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
    // Find subscription by token
    const result = await client.query(
      "SELECT * FROM subscriptions WHERE verification_token = $1",
      [token],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }

    const subscription = result.rows[0];

    // Update to verified
    await client.query(
      "UPDATE subscriptions SET is_verified = TRUE, verification_token = NULL, updated_at = NOW() WHERE id = $1",
      [subscription.id],
    );

    // Send Welcome Email
    await resend.emails.send({
      from: "AQILYTICS <onboarding@resend.dev>",
      to: subscription.email,
      subject: "Subscription Active: Daily AQI Reports",
      html: `
          <h1>Subscription Active!</h1>
          <p>You are now verified. You will receive daily AQI reports for <strong>${subscription.city}</strong>.</p>
        `,
    });

    // Redirect to a success page or home
    return NextResponse.redirect(new URL("/?verified=true", request.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  } finally {
    client.release();
  }
}
