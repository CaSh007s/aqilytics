import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

/**
 * Create the Gemini model at runtime (NOT at module load).
 * This is required for Next.js / Vercel serverless environments.
 */
function getModel(modelName: string = MODEL_NAME) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GOOGLE_API_KEY is missing. Ensure it is defined in .env.local and Vercel environment variables.",
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: modelName,
  });
}

export interface PollutantContext {
  pollutant: string;
  value: number;
  category: string;
  city: string;
}

export interface FullReportAnalysis {
  active_summary: string;
  pollutants: Record<string, string>;
}

/**
 * Generates a full report analysis (Executive Summary + Pollutant Analyses) in a single API call.
 */
export async function generateFullCityReport(
  city: string,
  aqi: number,
  category: string,
  pollutants: Record<string, number>,
): Promise<FullReportAnalysis> {
  // 1. Construct the monolithic prompt
  const pollutantList = Object.entries(pollutants)
    .map(([key, val]) => `${key}: ${val} µg/m³`)
    .join("\n");

  const prompt = `
You are an environmental data analyst preparing a formal AQI report for ${city}.

Overall AQI: ${aqi}
Classification: ${category}

Pollutant Data:
${pollutantList}

INSTRUCTIONS:
1. Write an EXECUTIVE SUMMARY (2-3 sentences) on overall conditions and health relevance.
2. For each pollutant in the data, write a concise analysis (40-60 words).
   - If the pollutant is NH3 or CO, write a "Snapshot Interpretation" (real-time value only, no forecast).
   - For others, write a standard scientific analysis of the concentration.
   - Do NOT mention "missing data" or "errors".

FORMAT REQURIREMENTS:
- Return plain text only (no markdown).
- Use EXACT headers as delimiters.

OUTPUT STRUCTURE:

EXECUTIVE_SUMMARY:
<summary text>

PM2.5:
<text>

PM10:
<text>

NO2:
<text>

SO2:
<text>

O3:
<text>

NH3:
<text>

CO:
<text>

(Include headers for only the pollutants present in the data)
`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return parseGeminiResponse(responseText, pollutants);
  } catch (error) {
    console.error(
      "Gemini Error (Full Report):",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
    );

    // Fallback logic
    if (
      String(error).includes("404") ||
      String(error).includes("not found") ||
      String(error).includes("RESOURCE_EXHAUSTED")
    ) {
      console.warn(`Attempting fallback to ${FALLBACK_MODEL}...`);
      try {
        const fallbackModel = getModel(FALLBACK_MODEL);
        const result = await fallbackModel.generateContent(prompt);
        return parseGeminiResponse(result.response.text(), pollutants);
      } catch (fbError) {
        console.error(
          "Fallback Failed:",
          JSON.stringify(fbError, Object.getOwnPropertyNames(fbError), 2),
        );
      }
    }

    return getFallbackAnalysis(pollutants);
  }
}

// Helper to parse the structured response
function parseGeminiResponse(
  text: string,
  pollutants: Record<string, number>,
): FullReportAnalysis {
  const result: FullReportAnalysis = {
    active_summary: "Summary unavailable.",
    pollutants: {},
  };

  // Normalize formatting
  const cleanText = text.replace(/\*\*/g, "").trim(); // Remove bolding if any

  // Extract Summary
  const summaryMatch = cleanText.match(
    /EXECUTIVE_SUMMARY:\s*([\s\S]*?)(?=\n[A-Z0-9.]+[:]\s|$)/i,
  );
  if (summaryMatch && summaryMatch[1]) {
    result.active_summary = summaryMatch[1].trim();
  }

  // Extract Pollutants
  Object.keys(pollutants).forEach((key) => {
    // Try to find the section for this pollutant
    // Patterns to look for: "KEY:", "Key:", "DISPLAY_NAME:"
    // We can map keys to display names
    const displayName = getDisplayName(key);

    // Regex matches "HEADER:\n content..."
    // Header can be key or displayName
    const pattern = new RegExp(
      `(?:${key}|${displayName}|${key.toUpperCase()}):\\s*([\\s\\S]*?)(?=\\n[A-Z0-9.]+[:]\\s|$)`,
      "i",
    );
    const match = cleanText.match(pattern);

    if (match && match[1]) {
      // Store using the Display Name for consistency with PDF renderer
      result.pollutants[displayName] = match[1].trim();
    } else {
      result.pollutants[displayName] = "Analysis unavailable.";
    }
  });

  return result;
}

function getFallbackAnalysis(
  pollutants: Record<string, number>,
): FullReportAnalysis {
  const result: FullReportAnalysis = {
    active_summary: "Executive summary unavailable due to processing error.",
    pollutants: {},
  };
  Object.keys(pollutants).forEach((key) => {
    const name = getDisplayName(key);
    result.pollutants[name] = "Analysis unavailable.";
  });
  return result;
}

function getDisplayName(key: string): string {
  const map: Record<string, string> = {
    pm2_5: "PM2.5",
    pm10: "PM10",
    no2: "NO2", // Model might prefer NO2 over NO₂ for standard ASCII
    so2: "SO2",
    o3: "O3", // or Ozone
    nh3: "NH3",
    co: "CO",
    // Handle variants
    ozone: "O3",
  };
  return map[key.toLowerCase()] || key.toUpperCase();
}
