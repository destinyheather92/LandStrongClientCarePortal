/**
 * Central mock/real mode flags. Every integration in this app (auth is the
 * one exception — see lib/auth-roles.ts) falls back to a mock implementation
 * whenever its real credentials are absent, so the app stays fully demoable
 * without any third-party accounts configured.
 */

export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_") &&
      process.env.CLERK_SECRET_KEY?.startsWith("sk_")
  );
}

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.GOOGLE_CALENDAR_ID
  );
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getTherapistEmail(): string {
  return process.env.THERAPIST_EMAIL?.trim().toLowerCase() ?? "";
}

export function isTherapistEmail(email: string | null | undefined): boolean {
  const therapistEmail = getTherapistEmail();
  return Boolean(therapistEmail && email && email.trim().toLowerCase() === therapistEmail);
}

export function getPracticeName(): string {
  return process.env.PRACTICE_NAME?.trim() || "LandStrong Counseling";
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export function getPracticePhone(): string | undefined {
  return process.env.PRACTICE_PHONE?.trim() || undefined;
}
