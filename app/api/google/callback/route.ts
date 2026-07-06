import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireRole } from "@/lib/auth-roles";
import { getAppUrl } from "@/lib/config";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function htmlPage(title: string, body: string, status = 200): NextResponse {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>body{font-family:system-ui,sans-serif;max-width:640px;margin:80px auto;padding:0 24px;color:#10263f;line-height:1.6}
      h1{font-size:1.4rem} pre{background:#eaf2f8;padding:16px;border-radius:12px;overflow:auto;font-size:.85rem}
      a{color:#4c86b8}</style></head><body>${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

/**
 * Exchanges the Google OAuth authorization code for tokens and writes the
 * refresh_token straight into .env.local — a one-time local setup helper,
 * not a general "connect calendar" feature for real users. Requires a
 * server restart afterward since env vars are read once at process start.
 */
export async function GET(request: Request) {
  await requireRole("therapist");

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return htmlPage(
      "Google connection failed",
      `<h1>Google connection failed</h1><p>${escapeHtml(oauthError)}</p>
       <p><a href="/api/google/connect">Try again</a></p>`,
      400
    );
  }

  if (!code) {
    return htmlPage(
      "Missing authorization code",
      `<h1>Missing authorization code</h1><p><a href="/api/google/connect">Try again</a></p>`,
      400
    );
  }

  const redirectUri = `${getAppUrl()}/api/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.refresh_token) {
    return htmlPage(
      "Couldn't get a refresh token",
      `<h1>Couldn't get a refresh token</h1>
       <pre>${escapeHtml(JSON.stringify(tokenData, null, 2))}</pre>
       <p>If there's no <code>refresh_token</code> above and no error either,
       Google usually only issues one on a user's first consent. Revoke prior
       access at
       <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
       myaccount.google.com/permissions</a> and
       <a href="/api/google/connect">try again</a>.</p>
       <p>If the error mentions <code>redirect_uri_mismatch</code>, add
       <code>${escapeHtml(redirectUri)}</code> as an Authorized redirect URI on this
       OAuth client in Google Cloud Console → APIs &amp; Services → Credentials.</p>`,
      400
    );
  }

  const envPath = path.join(process.cwd(), ".env.local");
  const existing = fs.readFileSync(envPath, "utf8");
  const updated = /^GOOGLE_REFRESH_TOKEN=.*$/m.test(existing)
    ? existing.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, `GOOGLE_REFRESH_TOKEN=${tokenData.refresh_token}`)
    : `${existing.replace(/\n?$/, "\n")}GOOGLE_REFRESH_TOKEN=${tokenData.refresh_token}\n`;
  fs.writeFileSync(envPath, updated, "utf8");

  return htmlPage(
    "Google Calendar connected",
    `<h1>✅ Google Calendar connected</h1>
     <p>The refresh token was saved to <code>.env.local</code>. Restart the dev
     server to pick it up — bookings will then create real Google Calendar
     events with real Meet links.</p>
     <p><a href="/therapist-settings">Back to Therapist Settings</a></p>`
  );
}
