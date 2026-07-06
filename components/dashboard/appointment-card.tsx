"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
import { Appointment } from "@/lib/types";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReminderStatus } from "@/components/reminder-status";
import { formatTime12h, formatDateLong } from "@/lib/utils";

function statusTone(status: Appointment["status"]) {
  if (status === "confirmed") return "info" as const;
  if (status === "cancelled") return "danger" as const;
  return "neutral" as const;
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextScheduled = appointment.reminders.find((r) => r.status === "scheduled");

  async function sendReminder() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/send-reminder-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "appointment",
          appointmentId: appointment.id,
          reminderId: nextScheduled?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't send the reminder.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the reminder.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div className="flex items-center justify-between">
          <CardTitle>Appointment</CardTitle>
          <Badge tone={statusTone(appointment.status)}>{appointment.status}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-navy/40">Therapist</p>
            <p className="mt-1 text-sm font-medium text-navy">{appointment.therapist}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-navy/40">Session type</p>
            <p className="mt-1 text-sm font-medium text-navy">{appointment.sessionType}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-navy/40">Date &amp; time</p>
            <p className="mt-1 text-sm font-medium text-navy">
              {formatDateLong(appointment.date)} · {formatTime12h(appointment.time)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-navy/40">Meet link</p>
            <a
              href={appointment.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1.5 text-sm font-medium text-blue hover:underline"
            >
              <Video className="h-3.5 w-3.5" />
              Join {appointment.isMockCalendarEvent ? "(demo)" : ""}
            </a>
          </div>
        </div>

        <div className="border-t border-navy/10 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-navy/40">Reminders</p>
            {appointment.status === "confirmed" && nextScheduled && (
              <Button type="button" size="sm" variant="outline" disabled={sending} onClick={sendReminder}>
                {sending ? "Sending…" : "Send Reminder Now"}
              </Button>
            )}
          </div>
          {error && (
            <p className="mb-3 rounded-xl bg-danger-bg px-4 py-2.5 text-sm text-danger">{error}</p>
          )}
          <ReminderStatus reminders={appointment.reminders} />
        </div>
      </CardBody>
    </Card>
  );
}
