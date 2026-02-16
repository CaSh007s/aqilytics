require("dotenv").config({ path: ".env.local" });
const { URL } = require("url");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is missing");
} else {
  try {
    const url = new URL(connectionString);
    console.log("✅ Connection string parsed successfully");
    console.log("Hostname:", url.hostname);
    console.log("Protocol:", url.protocol);
    console.log("Port:", url.port);
    console.log("Database:", url.pathname);
  } catch (err) {
    console.error("❌ Could not parse DATABASE_URL:", err.message);
  }
}

const resendKey = process.env.RESEND_API_KEY;
if (!resendKey) {
  console.error("❌ RESEND_API_KEY is missing");
} else {
  console.log(
    "✅ RESEND_API_KEY is present (starts with " +
      resendKey.substring(0, 4) +
      "...)",
  );
}
