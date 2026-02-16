import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, city } = await request.json();

    if (!email || !city) {
      return NextResponse.json(
        { error: "Email and city are required" },
        { status: 400 },
      );
    }

    const client = await pool.connect();
    try {
      const checkResult = await client.query(
        "SELECT * FROM subscriptions WHERE email = $1",
        [email],
      );

      const message = "Verification email sent";
      const verificationToken = crypto.randomUUID();

      if (checkResult.rows.length > 0) {
        const sub = checkResult.rows[0];

        // Case 1: Already verified and active
        if (sub.is_verified && !sub.unsubscribed_at) {
          // Optional: Update city if they want to change it?
          // For now, let's allow city update even if active.
          await client.query(
            "UPDATE subscriptions SET city = $1, updated_at = NOW() WHERE email = $2",
            [city, email],
          );
          return NextResponse.json(
            { message: `Subscription updated to ${city}!` },
            { status: 200 },
          );
        }

        // Case 2: Verified but Unsubscribed (Reactivation)
        if (sub.is_verified && sub.unsubscribed_at) {
          await client.query(
            "UPDATE subscriptions SET city = $1, unsubscribed_at = NULL, updated_at = NOW() WHERE email = $2",
            [city, email],
          );
          return NextResponse.json(
            { message: `Welcome back! Subscription reactivated for ${city}.` },
            { status: 200 },
          );
        }

        // Case 3: Not verified (Resend logic)
        // We reuse the existing logic to update token and resend
        await client.query(
          "UPDATE subscriptions SET city = $1, verification_token = $2, updated_at = NOW() WHERE email = $3",
          [city, verificationToken, email],
        );
      } else {
        // Case 4: New Subscription
        await client.query(
          `INSERT INTO subscriptions (email, city, verification_token, is_verified)
           VALUES ($1, $2, $3, FALSE)`,
          [email, city, verificationToken],
        );
      }

      // Send verification email (only for Cases 3 & 4)
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/verify?token=${verificationToken}`;

      await resend.emails.send({
        from: "AQILYTICS <onboarding@resend.dev>",
        to: email,
        subject: "Verify your Daily AQI Report Subscription",
        html: `
          <h1>Confirm your subscription</h1>
          <p>You requested daily AQI reports for <strong>${city}</strong>.</p>
          <p>Please click the link below to verify your email address and activate your subscription:</p>
          <p><a href="${verifyUrl}">Verify Email</a></p>
          <p><small>If you didn't request this, you can ignore this email.</small></p>
        `,
      });

      return NextResponse.json({ message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
