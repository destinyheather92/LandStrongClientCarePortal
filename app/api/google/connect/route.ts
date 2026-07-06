import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-roles";
import { getAppUrl } from "@/lib/config";

/**
 * Kicks off the Google OAuth consent flow to obtain a refresh token for
 * lib/google-calendar.ts's real mode. `access_type=offline` + `prompt=consent`
 * guarantees Google issues a refresh_token (it's otherwise only issued on a
 * user's very first consent).
 */
export async function GET() {
  await requireRole("therapist");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID is not set in .env.local." },
      { status: 400 }
    );
  }

  const redirectUri = `${getAppUrl()}/api/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar",
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
