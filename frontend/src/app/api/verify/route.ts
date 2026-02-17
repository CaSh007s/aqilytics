import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    // Find subscriber by token
    const result = await client.query(
      "SELECT * FROM subscribers WHERE verification_token = $1",
      [token],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }

    const subscriber = result.rows[0];

    // Update to verified
    await client.query(
      "UPDATE subscribers SET is_verified = TRUE, updated_at = NOW() WHERE id = $1",
      [subscriber.id],
    );

    // Get the most recently added city for context in the email/redirect
    const cityResult = await client.query(
      "SELECT city FROM subscriber_cities WHERE subscriber_id = $1 ORDER BY added_at DESC LIMIT 1",
      [subscriber.id],
    );
    const initialCity = cityResult.rows[0]?.city || "your selected cities";

    // Send Welcome Email
    await resend.emails.send({
      from: "AQILYTICS <onboarding@resend.dev>",
      to: subscriber.email,
      subject: "Subscription Active: Daily AQI Reports",
      html: `
          <h1>Subscription Active!</h1>
          <p>You are now verified. You will receive daily AQI reports for <strong>${initialCity}</strong> (and other cities you add).</p>
        `,
    });

    // Redirect to the new success page
    return NextResponse.redirect(
      new URL(
        `/subscription/confirmed?city=${encodeURIComponent(initialCity)}`,
        request.url,
      ),
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  } finally {
    client.release();
  }
}
