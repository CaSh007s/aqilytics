/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });
const { Resend } = require("resend");

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("❌ RESEND_API_KEY is not defined in .env.local");
  process.exit(1);
}

const resend = new Resend(resendApiKey);

async function sendTestEmail() {
  try {
    console.log("📧 Sending test email...");

    // You must use a verified domain or the onboarding domain: onboarding@resend.dev
    // If you haven't verified a domain yet, use onboarding@resend.dev and send to ONLY your email.
    const { data, error } = await resend.emails.send({
      from: "AQILYTICS <onboarding@resend.dev>", // Change this if you have a verified domain
      to: ["delivered@resend.dev"], // Tests that the delivery mechanism works
      subject: "AQILYTICS: Infrastructure Test",
      html: "<strong>It works!</strong> The email infrastructure is ready.",
    });

    if (error) {
      console.error("❌ Failed to send email:", error);
      return;
    }

    console.log("✅ Email sent successfully!");
    console.log("🆔 Email ID:", data.id);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
}

sendTestEmail();
