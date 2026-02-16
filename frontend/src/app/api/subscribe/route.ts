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

    // Check if subscription already exists
    const client = await pool.connect();
    try {
      const checkResult = await client.query(
        "SELECT * FROM subscriptions WHERE email = $1",
        [email],
      );

      if (checkResult.rows.length > 0) {
        const sub = checkResult.rows[0];
        if (sub.is_verified) {
          return NextResponse.json(
            { message: "You are already subscribed!" },
            { status: 200 },
          );
        } else {
          // Resend verification email if not verified ??
          // For now, let's just update the city and token and resend
        }
      }

      const verificationToken = crypto.randomUUID();

      // Upsert subscription (update if exists but not verified, or insert new)
      await client.query(
        `INSERT INTO subscriptions (email, city, verification_token, is_verified)
         VALUES ($1, $2, $3, FALSE)
         ON CONFLICT (email) 
         DO UPDATE SET city = $2, verification_token = $3, updated_at = NOW()`,
        [email, city, verificationToken],
      );

      // Send verification email
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/verify?token=${verificationToken}`;

      await resend.emails.send({
        from: "AQILYTICS <onboarding@resend.dev>", // Update with verified domain later
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

      return NextResponse.json({ message: "Verification email sent" });
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
