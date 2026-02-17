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
      await client.query("BEGIN");

      // 1. Upsert Subscriber
      // We don't change is_verified here. If they verified before, they stay verified.
      // If they were unsubscribed, we might want to un-unsubscribe them?
      // Let's decide: If they subscribe again, we clear unsubscribed_at.
      const subscriberRes = await client.query(
        `INSERT INTO subscribers (email, verification_token)
         VALUES ($1, $2)
         ON CONFLICT (email) 
         DO UPDATE SET 
            unsubscribed_at = NULL,
            updated_at = NOW()
         RETURNING id, is_verified, verification_token, email`,
        [email, crypto.randomUUID()],
      );

      const subscriber = subscriberRes.rows[0];

      // 2. Add City Preference
      await client.query(
        `INSERT INTO subscriber_cities (subscriber_id, city)
         VALUES ($1, $2)
         ON CONFLICT (subscriber_id, city) DO NOTHING`,
        [subscriber.id, city],
      );

      await client.query("COMMIT");

      // 3. Handle Verification Email
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/verify?token=${subscriber.verification_token}`;

      // Only send verification if NOT verified
      if (!subscriber.is_verified) {
        console.log(
          `Attempting to send verification email to ${email} with link: ${verifyUrl}`,
        );

        const emailResponse = await resend.emails.send({
          from: "AQILYTICS <onboarding@resend.dev>",
          to: email,
          subject: "Verify your Daily AQI Report Subscription",
          html: `
            <h1>Confirm your subscription</h1>
            <p>You requested daily AQI reports for <strong>${city}</strong> (and any other cities you've added).</p>
            <p>Please click the link below to verify your email address and activate your subscription:</p>
            <p><a href="${verifyUrl}">Verify Email</a></p>
            <p><small>If you didn't request this, you can ignore this email.</small></p>
            `,
        });

        if (emailResponse.error) {
          console.error("Resend API Error:", emailResponse.error);
          // We don't rollback the DB transaction for email failure, but we warn.
          return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 },
          );
        }
        return NextResponse.json({ message: "Verification email sent" });
      }

      // If already verified, just confirm logic
      return NextResponse.json(
        {
          message: `Subscription updated! You will now receive reports for ${city}.`,
        },
        { status: 200 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
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
