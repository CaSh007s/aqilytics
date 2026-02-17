import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Resend } from "resend";
import { fetchAQI, fetchForecast } from "@/services/api";
import { generateReportPDF } from "@/services/report-generator";

// Force dynamic to prevent caching of the cron route
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

function log(
  level: "info" | "warn" | "error",
  message: string,
  data: object = {},
) {
  try {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...data,
      }),
    );
  } catch (err) {
    console.error(`[LOGGING ERROR] Failed to log message: ${message}`, err);
  }
}

export async function GET(request: Request) {
  const runId = crypto.randomUUID();
  const startTime = Date.now();

  log("info", "Cron job started", { runId });

  // 1. Security Check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    log("warn", "Unauthorized cron attempt", { runId });
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const client = await pool.connect();

  try {
    // 2. Fetch Eligible Subscribers with their cities
    // We group by subscriber so we get one row per user with an array of cities
    const result = await client.query(`
      SELECT s.id, s.email, s.verification_token, 
             json_agg(sc.city) as cities
      FROM subscribers s
      JOIN subscriber_cities sc ON s.id = sc.subscriber_id
      WHERE s.is_verified = TRUE 
      AND (s.last_sent_at IS NULL OR s.last_sent_at < NOW() - INTERVAL '24 hours')
      AND s.unsubscribed_at IS NULL
      GROUP BY s.id
      LIMIT 50; -- Batch limit to prevent timeouts
    `);

    const subscribers = result.rows;
    const stats = {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    log("info", `Found ${stats.total} subscribers to process`, {
      runId,
      count: stats.total,
    });

    // 3. Process Each Subscriber
    const results = [];

    for (const sub of subscribers) {
      try {
        const cityReports = [];

        // Fetch Data for each city
        for (const city of sub.cities) {
          try {
            const [aqiData, forecastData] = await Promise.all([
              fetchAQI(city),
              fetchForecast(city),
            ]);
            cityReports.push({
              city,
              data: aqiData,
              forecast: forecastData,
            });
          } catch (err) {
            log("error", `Failed to fetch data for ${city}`, {
              error: String(err),
            });
            // We continue with other cities if one fails
          }
        }

        if (cityReports.length === 0) {
          log("warn", `No valid data found for any city for ${sub.email}`, {
            runId,
          });
          stats.skipped++;
          continue;
        }

        // Generate Combined PDF
        const pdfBuffer = await generateReportPDF(cityReports);

        // Generate Unsubscribe Link
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/unsubscribe?token=${sub.verification_token}`;

        // Prepare Email Content
        // We'll list the cities in the email body
        const citiesListHtml = cityReports
          .map(
            (r) =>
              `<li><strong>${r.city}</strong>: ${r.data.current_aqi} (${r.data.aqi_category})</li>`,
          )
          .join("");

        const subjectCity =
          cityReports.length === 1
            ? cityReports[0].city
            : "Your Selected Cities";

        // Send Email
        const emailResult = await resend.emails.send({
          from: "AQILYTICS <updates@resend.dev>",
          to: sub.email,
          subject: `Daily AQI Report for ${subjectCity}`,
          html: `
            <h1>Your Daily Air Quality Insight</h1>
            <p>Here is your daily report for:</p>
            <ul>${citiesListHtml}</ul>
            <p>Please find the detailed PDF report attached containing full analysis for all locations.</p>
            <br />
            <p>Stay safe and breathe easy.</p>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">
              <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a> or manage your preferences.
            </p>
          `,
          attachments: [
            {
              filename: `AQI_Report_${new Date().toISOString().split("T")[0]}.pdf`,
              content: pdfBuffer,
            },
          ],
        });

        if (emailResult.error) {
          log("error", `Failed to send email to ${sub.email}`, {
            runId,
            error: emailResult.error.message || String(emailResult.error),
            type: emailResult.error.name,
          });
          stats.failed++;
          results.push({
            email: sub.email,
            status: "failed",
            error: emailResult.error.message || String(emailResult.error),
          });
          continue;
        }

        // Update last_sent_at
        await client.query(
          "UPDATE subscribers SET last_sent_at = NOW() WHERE id = $1",
          [sub.id],
        );

        stats.sent++;
        results.push({
          email: sub.email,
          status: "sent",
          id: emailResult.data?.id,
        });
      } catch (err) {
        log("error", `Error processing subscription for ${sub.email}`, {
          runId,
          error: String(err),
        });
        stats.failed++;
        results.push({
          email: sub.email,
          status: "error",
          message: String(err),
        });
      }
    }

    const duration = Date.now() - startTime;
    log("info", "Cron job finished", { runId, stats, duration });

    return NextResponse.json({
      success: true,
      runId,
      stats,
      duration,
      details: results,
    });
  } catch (error) {
    log("error", "Critical cron job failure", { runId, error: String(error) });
    return NextResponse.json(
      { error: "Internal Server Error", runId },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
