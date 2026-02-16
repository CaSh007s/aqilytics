import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/unsubscribe?error=missing_token`,
    );
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      "UPDATE subscriptions SET unsubscribed_at = NOW(), updated_at = NOW() WHERE verification_token = $1 RETURNING email",
      [token],
    );

    if (result.rowCount === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/unsubscribe?error=invalid_token`,
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/unsubscribe?success=true&email=${encodeURIComponent(result.rows[0].email)}`,
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/unsubscribe?error=server_error`,
    );
  } finally {
    client.release();
  }
}
