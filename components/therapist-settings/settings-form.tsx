"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { TherapistSettings, WEEKDAY_LABELS } from "@/lib/types";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Label, Textarea } from "@/components/ui/field";

function centsToDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

function parseHoursList(value: string): number[] {
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

export function SettingsForm({ settings }: { settings: TherapistSettings }) {
  const router = useRouter();
  const [availableDays, setAvailableDays] = useState<number[]>(settings.availableDays);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function toggleDay(day: number) {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      displayName: String(form.get("displayName") || ""),
      practiceName: String(form.get("practiceName") || ""),
      sessionRateCents: Math.round(Number(form.get("sessionRate") || 0) * 100),
      sessionLengthMinutes: Number(form.get("sessionLengthMinutes") || 0),
      bufferMinutes: Number(form.get("bufferMinutes") || 0),
      availableDays,
      startTime: String(form.get("startTime") || ""),
      endTime: String(form.get("endTime") || ""),
      googleCalendarEmail: String(form.get("googleCalendarEmail") || ""),
      reminderHoursBefore: parseHoursList(String(form.get("reminderHoursBefore") || "")),
      invoiceDueDays: Number(form.get("invoiceDueDays") || 0),
      intakeInstructions: String(form.get("intakeInstructions") || ""),
    };

    try {
      const res = await fetch("/api/therapist-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save settings.");
      setSavedAt(new Date().toLocaleTimeString());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save settings.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardBody className="space-y-5">
          <CardTitle>Practice details</CardTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" name="displayName" defaultValue={settings.displayName} required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="practiceName">Practice name</Label>
              <Input id="practiceName" name="practiceName" defaultValue={settings.practiceName} required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="googleCalendarEmail">Google Calendar email</Label>
              <Input
                id="googleCalendarEmail"
                name="googleCalendarEmail"
                type="email"
                defaultValue={settings.googleCalendarEmail}
              />
            </FieldGroup>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <CardTitle>Sessions</CardTitle>
          <div className="grid gap-5 sm:grid-cols-3">
            <FieldGroup>
              <Label htmlFor="sessionRate">Flat session rate ($)</Label>
              <Input
                id="sessionRate"
                name="sessionRate"
                type="number"
                step="0.01"
                min="0"
                defaultValue={centsToDollarsInput(settings.sessionRateCents)}
                required
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="sessionLengthMinutes">Session length (min)</Label>
              <Input
                id="sessionLengthMinutes"
                name="sessionLengthMinutes"
                type="number"
                min="5"
                defaultValue={settings.sessionLengthMinutes}
                required
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="bufferMinutes">Buffer between sessions (min)</Label>
              <Input
                id="bufferMinutes"
                name="bufferMinutes"
                type="number"
                min="0"
                defaultValue={settings.bufferMinutes}
                required
              />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label>Available days</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((label, day) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={
                    availableDays.includes(day)
                      ? "rounded-full border border-blue bg-mist px-4 py-2 text-sm font-medium text-navy"
                      : "rounded-full border border-navy/15 px-4 py-2 text-sm text-navy/60 hover:bg-mist/60"
                  }
                >
                  {label.slice(0, 3)}
                </button>
              ))}
            </div>
          </FieldGroup>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="startTime">Start time</Label>
              <Input id="startTime" name="startTime" type="time" defaultValue={settings.startTime} required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="endTime">End time</Label>
              <Input id="endTime" name="endTime" type="time" defaultValue={settings.endTime} required />
            </FieldGroup>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <CardTitle>Reminders &amp; invoicing</CardTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="reminderHoursBefore">
                Reminder timing (hours before, comma-separated)
              </Label>
              <Input
                id="reminderHoursBefore"
                name="reminderHoursBefore"
                defaultValue={settings.reminderHoursBefore.join(", ")}
                placeholder="24, 1"
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="invoiceDueDays">Invoice due (days after booking)</Label>
              <Input
                id="invoiceDueDays"
                name="invoiceDueDays"
                type="number"
                min="0"
                defaultValue={settings.invoiceDueDays}
                required
              />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="intakeInstructions">
              Intake instructions <span className="text-navy/40">(optional)</span>
            </Label>
            <Textarea
              id="intakeInstructions"
              name="intakeInstructions"
              rows={3}
              defaultValue={settings.intakeInstructions ?? ""}
            />
          </FieldGroup>
        </CardBody>
      </Card>

      {error && (
        <p className="rounded-xl bg-danger-bg px-4 py-2.5 text-sm text-danger">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save Settings"}
        </Button>
        {savedAt && <p className="text-sm text-navy/50">Saved at {savedAt}</p>}
      </div>
    </form>
  );
}
