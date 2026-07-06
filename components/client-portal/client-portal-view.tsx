import Link from "next/link";
import { CalendarCheck, ExternalLink, ShieldAlert, Video } from "lucide-react";
import { ClientRecord, TherapistSettings } from "@/lib/types";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ReminderStatus } from "@/components/reminder-status";
import { DemoBanner } from "@/components/demo-banner";
import { formatCurrency, formatDateLong, formatDateTimeLabel } from "@/lib/utils";

export function ClientPortalView({
  client,
  settings,
}: {
  client: ClientRecord | undefined;
  settings: TherapistSettings;
}) {
  if (!client) {
    return (
      <Card>
        <CardBody className="space-y-4 text-center">
          <CardTitle>Welcome to {settings.practiceName}</CardTitle>
          <p className="text-sm text-navy/60">
            Let&rsquo;s get your intake done first, then you can book your
            first session.
          </p>
          <Link href="/intake" className={buttonVariants("primary", "lg")}>
            Complete Intake
          </Link>
        </CardBody>
      </Card>
    );
  }

  const upcoming = client.appointments.find(
    (a) => a.status === "confirmed" && a.date >= new Date().toISOString().slice(0, 10)
  );
  const latestInvoice = client.invoices[0];

  return (
    <div className="space-y-6">
      <DemoBanner>
        Your therapist may draft session notes with AI assistance. Every
        draft is reviewed and approved by {settings.displayName} before it
        becomes part of your record — it is never shared with you
        automatically.
      </DemoBanner>

      <Card>
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-navy/40">Intake</p>
            <p className="mt-1 text-sm font-medium text-navy">
              {client.intake.fullName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="success">Complete</Badge>
            <Link href="/intake" className={buttonVariants("outline", "sm")}>
              Review
            </Link>
          </div>
        </CardBody>
      </Card>

      {upcoming ? (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 bg-success-bg px-6 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-white">
              <CalendarCheck className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-success">Upcoming session</p>
          </div>
          <CardBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-navy/40">Therapist</p>
                <p className="mt-1 text-sm font-medium text-navy">{upcoming.therapist}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-navy/40">Date &amp; time</p>
                <p className="mt-1 text-sm font-medium text-navy">
                  {formatDateTimeLabel(upcoming.date, upcoming.time)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={upcoming.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants("primary", "md")}
              >
                <Video className="h-4 w-4" />
                Join via Google Meet
              </a>
              <a
                href={upcoming.calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants("outline", "md")}
              >
                <ExternalLink className="h-4 w-4" />
                View in Google Calendar
              </a>
            </div>
            {upcoming.isMockCalendarEvent && (
              <p className="text-xs text-navy/40">
                Simulated for this demo — the Meet link won&rsquo;t connect to a real meeting.
              </p>
            )}

            <div className="border-t border-navy/10 pt-4">
              <p className="mb-3 text-xs uppercase tracking-wide text-navy/40">Reminders</p>
              <ReminderStatus reminders={upcoming.reminders} />
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <CardTitle>No upcoming session</CardTitle>
              <p className="mt-1 text-sm text-navy/50">
                Book your next session with {settings.displayName}.
              </p>
            </div>
            <Link href="/schedule" className={buttonVariants("primary", "md")}>
              Schedule Appointment
            </Link>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="flex items-center justify-between">
          <div>
            <CardTitle>Invoice</CardTitle>
            {latestInvoice ? (
              <p className="mt-1 text-sm text-navy/50">
                {formatCurrency(latestInvoice.amount)} due{" "}
                {formatDateLong(latestInvoice.dueDate)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-navy/50">No invoices yet.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {latestInvoice && (
              <Badge tone={latestInvoice.status === "paid" ? "success" : "warning"}>
                {latestInvoice.status}
              </Badge>
            )}
            <Link href="/invoice" className={buttonVariants("outline", "sm")}>
              View Invoice
            </Link>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-start gap-2 rounded-xl bg-mist/60 px-4 py-3 text-xs text-navy/50">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
        <p>
          This is a demo MVP. Please don&rsquo;t enter real medical or
          personal information.
        </p>
      </div>
    </div>
  );
}
