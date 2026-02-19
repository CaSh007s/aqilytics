import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToBuffer,
} from "@react-pdf/renderer";
import { AQIResponse, ForecastResponse } from "./api";
import { generatePollutantChart } from "./chart-generator";
import { generateFullCityReport } from "./ai-analyst";

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  page: {
    padding: 56, // ~20mm real A4 margin
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },

  header: {
    marginBottom: 18,
    borderBottomWidth: 2, // React-pdf doesn't support "2 solid #..." shorthand fully same as web css usually
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    paddingBottom: 10,
  },

  city: { fontSize: 26, fontWeight: "bold" },

  subtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },

  riskBlock: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderStyle: "solid",
    borderRadius: 6,
  },

  riskTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },

  metricBand: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    padding: 14,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
  },

  metricBox: { alignItems: "center", width: "30%" },

  metricValue: { fontSize: 22, fontWeight: "bold", color: "#0284c7" },

  metricLabel: { fontSize: 9, color: "#64748b" },

  section: { marginTop: 18 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    paddingBottom: 4,
  },

  text: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 10,
  },

  chartContainer: {
    marginTop: 8,
    marginBottom: 18,
  },

  chartImage: {
    width: "100%",
    height: 260,
    objectFit: "contain",
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 56,
    right: 56,
    fontSize: 8,
    textAlign: "center",
    color: "#94a3b8",
  },
});

/* ---------------------- TYPES ---------------------- */

interface CityReportData {
  city: string;
  data: AQIResponse;
  forecast: ForecastResponse | null;
  charts: Record<string, ArrayBuffer>;
  summary?: string;
  pollutantAnalysis?: Record<string, string>;
}

interface ReportProps {
  reports: CityReportData[];
  date: string;
}

/* ---------------------- HELPERS ---------------------- */

const displayNameMap: Record<string, string> = {
  pm2_5: "PM2.5",
  pm10: "PM10",
  no2: "NO₂",
  so2: "SO₂",
  o3: "Ozone",
  nh3: "NH₃",
  co: "CO",
};

const snapshotPollutants = ["nh3", "co"];

function findDominantPollutant(
  pollutants: Record<string, number>,
): [string, number] {
  const sorted = Object.entries(pollutants).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return ["Unknown", 0];
  return sorted[0];
}

/* ---------------------- PDF COMPONENT ---------------------- */

const AQIReportPDF = ({ reports, date }: ReportProps) => (
  <Document>
    {reports.map((report, index) => {
      const pollutants = report.data.pollutants as Record<string, number>;
      const [dominantKey, dominantValue] = findDominantPollutant(pollutants);
      const dominantName = displayNameMap[dominantKey] ?? dominantKey;

      return (
        <Page key={index} size="A4" style={styles.page}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.city}>{report.city}</Text>
            <Text style={styles.subtitle}>
              Atmospheric Intelligence Report • {date}
            </Text>

            <View style={styles.riskBlock}>
              <Text style={styles.riskTitle}>
                AQI Classification: {report.data.aqi_category}
              </Text>
              <Text style={styles.text}>
                Dominant pollutant driving air quality is {dominantName} (
                {dominantValue.toFixed(1)} µg/m³).
              </Text>
            </View>
          </View>

          {/* METRIC BAND */}
          <View style={styles.metricBand}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {report.data.current_aqi.toFixed(0)}
              </Text>
              <Text style={styles.metricLabel}>AQI</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {Object.keys(pollutants).length}
              </Text>
              <Text style={styles.metricLabel}>Pollutants Measured</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {report.forecast ? "Yes" : "No"}
              </Text>
              <Text style={styles.metricLabel}>Forecast Model</Text>
            </View>
          </View>

          {/* EXECUTIVE SUMMARY */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.text}>{report.summary}</Text>
          </View>

          {/* POLLUTANT SECTIONS */}
          {Object.entries(pollutants).map(([rawKey, val]) => {
            const value = val as number;
            const key = rawKey.toLowerCase();
            const name = displayNameMap[key] ?? rawKey;
            const isSnapshot = snapshotPollutants.includes(key);

            return (
              <View key={key} style={styles.section} break={false}>
                <Text style={styles.sectionTitle}>{name} Analysis</Text>
                <Text style={styles.text}>
                  {report.pollutantAnalysis?.[name]}
                </Text>
                <Text style={styles.text}>
                  Current concentration: {value.toFixed(2)} µg/m³.
                </Text>

                {!isSnapshot && report.charts[name] && (
                  <View style={styles.chartContainer}>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      src={Buffer.from(report.charts[name]) as any}
                      style={styles.chartImage}
                    />
                  </View>
                )}
              </View>
            );
          })}

          {/* FOOTER */}
          <Text style={styles.footer} fixed>
            AQILYTICS Automated Atmospheric Assessment • {date}
          </Text>
        </Page>
      );
    })}
  </Document>
);

/* ---------------------- DATA PREPARATION ---------------------- */

type InputReportData = Omit<
  CityReportData,
  "charts" | "summary" | "pollutantAnalysis"
>;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateReportPDF = async (
  reports: InputReportData[],
): Promise<Buffer> => {
  const date = new Date().toLocaleDateString();
  const reportsWithContent: CityReportData[] = [];

  // Serialize reports processing
  for (const report of reports) {
    const charts: Record<string, ArrayBuffer> = {};
    const pollutants = report.data.pollutants as Record<string, number>;

    // 1. Single AI Call for Full Report Analysis
    let aiAnalysisResult;
    try {
      aiAnalysisResult = await generateFullCityReport(
        report.city,
        report.data.current_aqi,
        report.data.aqi_category,
        pollutants,
      );
    } catch (e) {
      console.error("AI Full Report Gen failed", e);
      aiAnalysisResult = {
        active_summary: "Summary unavailable.",
        pollutants: {},
      };
    }

    // Unpack AI results
    const summary = aiAnalysisResult.active_summary;
    const pollutantAnalysis = aiAnalysisResult.pollutants;

    await delay(200); // Small throttle just in case of multiple reports

    // 2. Pollutants Loop (Charts Only)
    // We strictly await chart generation to prevent any potential overload on chart API if many pollutants
    for (const [rawKey, val] of Object.entries(pollutants)) {
      const key = rawKey.toLowerCase();
      const name = displayNameMap[key] ?? rawKey;
      const isSnapshot = snapshotPollutants.includes(key);

      if (!isSnapshot && report.forecast) {
        try {
          // Use rawKey for data lookup, name for storage
          charts[name] = await generatePollutantChart(
            rawKey,
            report.forecast.forecast,
          );
        } catch (e) {
          console.error(`Chart gen failed for ${name} (${rawKey})`, e);
        }
      }
    }

    reportsWithContent.push({ ...report, summary, charts, pollutantAnalysis });
  }

  return await renderToBuffer(
    <AQIReportPDF reports={reportsWithContent} date={date} />,
  );
};
