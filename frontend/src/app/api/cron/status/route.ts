import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Force dynamic to prevent caching
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // 1. Security Check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await pool.connect();

  try {
    // 2. Fetch Stats
    const statsQuery = await client.query(`
      SELECT
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as verified_subscriptions,
        COUNT(CASE WHEN unsubscribed_at IS NOT NULL THEN 1 END) as unsubscribed_count,
        COUNT(CASE WHEN is_verified = TRUE AND unsubscribed_at IS NULL THEN 1 END) as active_subscriptions
      FROM subscriptions;
    `);

    const lastRunQuery = await client.query(`
      SELECT last_sent_at 
      FROM subscriptions 
      WHERE last_sent_at IS NOT NULL 
      ORDER BY last_sent_at DESC 
      LIMIT 1;
    `);

    const stats = statsQuery.rows[0];
    const lastRun = lastRunQuery.rows[0]?.last_sent_at;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      stats: {
        total: parseInt(stats.total_subscriptions || "0", 10),
        verified: parseInt(stats.verified_subscriptions || "0", 10),
        active: parseInt(stats.active_subscriptions || "0", 10),
        unsubscribed: parseInt(stats.unsubscribed_count || "0", 10),
      },
      last_cron_run: lastRun || "Never",
    });
  } catch (error) {
    console.error("Status check failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
