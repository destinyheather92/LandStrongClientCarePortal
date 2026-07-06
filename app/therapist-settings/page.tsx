import Link from "next/link";
import { ArrowLeft, CalendarCheck2 } from "lucide-react";
import { requireRole } from "@/lib/auth-roles";
import { getTherapistSettings } from "@/lib/therapist-settings";
import { isClerkConfigured, isGoogleCalendarConfigured } from "@/lib/config";
import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";
import { SettingsForm } from "@/components/therapist-settings/settings-form";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Therapist Settings — LandStrong Client Care Portal",
};

export default async function TherapistSettingsPage() {
  if (!isClerkConfigured()) return <ClerkSetupNotice />;
  await requireRole("therapist");

  const settings = getTherapistSettings();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/therapist-dashboard"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-navy/60 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-navy">Therapist Settings</h1>
        <p className="mt-3 text-navy/60">
          These settings drive scheduling, invoicing, and reminders across the
          portal.
        </p>
      </div>

      <div className="mb-6">
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-blue">
                <CalendarCheck2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">Google Calendar</p>
                <p className="text-xs text-navy/50">
                  {isGoogleCalendarConfigured()
                    ? "Connected — bookings create real calendar events with Meet links."
                    : "Not connected — bookings use simulated Meet links until you connect."}
                </p>
              </div>
            </div>
            {isGoogleCalendarConfigured() ? (
              <Badge tone="success">Connected</Badge>
            ) : (
              <a href="/api/google/connect" className={buttonVariants("primary", "sm")}>
                Connect Google Calendar
              </a>
            )}
          </CardBody>
        </Card>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
