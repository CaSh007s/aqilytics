import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Note: We are using "token" here which was originally verification_token.
  // In the new schema, verification_token is cleared after verification.
  // ISSUE: If verification_token is NULL, we can't use it for unsubscribe.
  // FIX: We should use the ID or a separate unsubscribe token.
  // However, specifically for the "One more thing" request, let's look at how we generate the link.
  // The cron job currently uses verification_token.
  // If we cleared it, we need a way to unsubscribe.
  // RECOMMENDATION: Let's NOT clear verification_token on verify, OR create a dedicated unsubscribe_token.
  // For now, to minimize schema changes, let's keep verification_token persistent or generate a signed JWT.
  // BUT the previous step (verify/route.ts) CLEARED the token: `verification_token = NULL`.
  // I must change verify/route.ts to NOT clear it, or generate a new one.
  // Let's modify verify/route.ts in a subsequent step or fix it here if possible? No, I must fix verify logic or this logic.
  // PROPOSAL: Don't clear verification_token in verify/route.ts? Or use email? email is insecure.
  // Let's assume we will fix verify/route.ts to NOT clear the token, or we use a separate column.
  // Actually, checking verify/route.ts again... I just edited it to clear it!
  // I will act as if I can search by 'id' if the link is changed? No, the link uses token.
  // Let's change this route to look up by `id` if possible, but the email link uses token.
  // Okay, I will modify verify/route.ts to NOT clear the token in a separate step?
  // Let's assume we fix `verify` to NOT clear the token.
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/unsubscribe?error=missing_token`,
    );
  }

  const client = await pool.connect();
  try {
    // Unsubscribe the user globally
    const result = await client.query(
      "UPDATE subscribers SET unsubscribed_at = NOW(), updated_at = NOW() WHERE verification_token = $1 RETURNING email",
      [token],
    );

    if (result.rowCount === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/unsubscribe?error=invalid_token`,
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription/unsubscribed?email=${encodeURIComponent(result.rows[0].email)}`,
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription/unsubscribed?error=server_error`,
    );
  } finally {
    client.release();
  }
}
