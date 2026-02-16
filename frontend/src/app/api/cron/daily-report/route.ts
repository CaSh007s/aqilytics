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
    // 2. Fetch Eligible Subscriptions
    const result = await client.query(`
      SELECT * FROM subscriptions 
      WHERE is_verified = TRUE 
      AND (last_sent_at IS NULL OR last_sent_at < NOW() - INTERVAL '24 hours')
      AND unsubscribed_at IS NULL
      LIMIT 50; -- Batch limit to prevent timeouts
    `);

    const subscriptions = result.rows;
    const stats = {
      total: subscriptions.length,
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    log("info", `Found ${stats.total} subscriptions to process`, {
      runId,
      count: stats.total,
    });

    // 3. Process Each Subscription
    const results = [];

    for (const sub of subscriptions) {
      try {
        // Fetch Data
        const [aqiData, forecastData] = await Promise.all([
          fetchAQI(sub.city),
          fetchForecast(sub.city),
        ]);

        // Generate PDF
        const pdfBuffer = await generateReportPDF(
          sub.city,
          aqiData,
          forecastData,
        );
        console.log("DEBUG: Is Buffer?", Buffer.isBuffer(pdfBuffer));
        console.log("DEBUG: Constructor?", pdfBuffer.constructor?.name);

        // Generate Unsubscribe Link
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/unsubscribe?token=${sub.verification_token}`;

        // Send Email
        const emailResult = await resend.emails.send({
          from: "AQILYTICS <updates@resend.dev>", // TODO: Verify domain
          to: sub.email,
          subject: `Daily AQI Report for ${sub.city}`,
          html: `
            <h1>Your Daily Air Quality Insight</h1>
            <p>Here is your daily report for <strong>${sub.city}</strong>.</p>
            <p>Current AQI: <strong>${aqiData.current_aqi}</strong> (${aqiData.aqi_category})</p>
            <p>Please find the detailed PDF report attached.</p>
            <br />
            <p><small>Stay safe and breathe easy.</small></p>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">
              <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a> or manage your preferences.
            </p>
          `,
          attachments: [
            {
              filename: `AQI_Report_${sub.city}_${new Date().toISOString().split("T")[0]}.pdf`,
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
          "UPDATE subscriptions SET last_sent_at = NOW() WHERE email = $1",
          [sub.email],
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
