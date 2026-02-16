/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

// Use local dev server URL
const BASE_URL = "http://localhost:3000";
const EMAIL = "test_user_flow@example.com";
const CITY = "London";

async function runTest() {
  console.log("🚀 Starting Full System Test...");

  // 1. Subscribe
  console.log("\n1️⃣  Testing Subscription...");
  const subRes = await fetch(`${BASE_URL}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, city: CITY }),
  });
  console.log("Subscribe Status:", subRes.status);
  const subData = await subRes.json();
  console.log("Subscribe Response:", subData);

  if (!subRes.ok) throw new Error("Subscription failed");

  // 2. Simulate Verification (Direct DB Update)
  console.log("\n2️⃣  Simulating Verification...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const verifyRes = await client.query(
    "UPDATE subscriptions SET is_verified = TRUE WHERE email = $1 RETURNING verification_token",
    [EMAIL],
  );
  if (verifyRes.rowCount === 0) throw new Error("DB Verification failed");
  const token = verifyRes.rows[0].verification_token;
  console.log("✅ User verified in DB. Token:", token);

  // 3. Check Status Endpoint
  console.log("\n3️⃣  Checking Diagnostics Endpoint...");
  const statusRes = await fetch(`${BASE_URL}/api/cron/status`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  console.log("Status Code:", statusRes.status);
  const statusData = await statusRes.json();
  console.log("System Stats:", statusData.stats);

  // 4. Trigger Cron Job
  console.log("\n4️⃣  Triggering Cron Job...");
  // Reset last_sent_at to ensure it runs
  await client.query(
    "UPDATE subscriptions SET last_sent_at = NULL WHERE email = $1",
    [EMAIL],
  );

  const cronRes = await fetch(`${BASE_URL}/api/cron/daily-report`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  console.log("Cron Status:", cronRes.status);
  const cronData = await cronRes.json();
  console.log("Cron Result:", JSON.stringify(cronData, null, 2));

  if (cronData.stats.sent !== 1)
    console.warn("⚠️  Warning: Expected 1 email sent");

  // 5. Unsubscribe
  console.log("\n5️⃣  Testing Unsubscribe...");
  // Note: The API redirects, so we follow it or check status
  const unsubRes = await fetch(`${BASE_URL}/api/unsubscribe?token=${token}`, {
    redirect: "manual",
  });
  console.log("Unsubscribe Status:", unsubRes.status);
  // Should be 307 Redirect

  // Verify in DB
  const checkRes = await client.query(
    "SELECT unsubscribed_at FROM subscriptions WHERE email = $1",
    [EMAIL],
  );
  if (checkRes.rows[0].unsubscribed_at) {
    console.log("✅ User successfully marked as unsubscribed in DB");
  } else {
    throw new Error("User NOT marked as unsubscribed");
  }

  // 6. Cron Job Should Skip
  console.log("\n6️⃣  Triggering Cron Job (Should Skip)...");
  // Reset last_sent_at again
  await client.query(
    "UPDATE subscriptions SET last_sent_at = NULL WHERE email = $1",
    [EMAIL],
  );

  const cronSkipRes = await fetch(`${BASE_URL}/api/cron/daily-report`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  const cronSkipData = await cronSkipRes.json();
  console.log("Cron Result (Expect 0 sent):", cronSkipData.stats);

  if (cronSkipData.stats.sent === 0) {
    console.log("✅ Correctly skipped unsubscribed user");
  } else {
    console.error("❌ Failed: Sent email to unsubscribed user");
  }

  // Cleanup
  await client.query("DELETE FROM subscriptions WHERE email = $1", [EMAIL]);
  await client.end();
  console.log("\n✨ Test Run Complete!");
}

runTest().catch(console.error);
