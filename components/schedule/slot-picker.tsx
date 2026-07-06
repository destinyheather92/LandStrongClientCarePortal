"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Label } from "@/components/ui/field";
import { SESSION_TYPES, SessionType, TherapistSettings } from "@/lib/types";
import { formatCurrency, formatTime12h } from "@/lib/utils";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SlotPicker({ settings }: { settings: TherapistSettings }) {
  const router = useRouter();
  const [date, setDate] = useState(todayIso());
  const [sessionType, setSessionType] = useState<SessionType>("Video");
  const [slots, setSlots] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        setLoadingSlots(true);
        setSelectedSlot(null);
        setError(null);
        return fetch(`/api/availability?date=${date}`);
      })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSlots(data.slots ?? []);
        setClosed(Boolean(data.closed));
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load availability. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  async function confirmBooking() {
    if (!selectedSlot) return;
    setBooking(true);
    setError(null);

    try {
      const res = await fetch("/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time: selectedSlot, sessionType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't book that session.");
      router.push("/client-portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't book that session.");
      setBooking(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-5">
          <FieldGroup>
            <Label>Session type</Label>
            <div className="flex flex-wrap gap-2">
              {SESSION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSessionType(type)}
                  className={
                    sessionType === type
                      ? "rounded-full border border-blue bg-mist px-4 py-2 text-sm font-medium text-navy"
                      : "rounded-full border border-navy/15 px-4 py-2 text-sm text-navy/70 hover:bg-mist/60"
                  }
                >
                  {type}
                </button>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              min={todayIso()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <Label>Available times</Label>
            {loadingSlots ? (
              <p className="text-sm text-navy/50">Loading availability…</p>
            ) : closed ? (
              <p className="text-sm text-navy/50">
                The practice isn&rsquo;t open on this day. Try another date.
              </p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-navy/50">
                No open times left on this date. Try another date.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={
                      selectedSlot === slot
                        ? "rounded-full border border-blue bg-navy px-4 py-2 text-sm font-medium text-white"
                        : "rounded-full border border-navy/15 px-4 py-2 text-sm text-navy/70 hover:bg-mist/60"
                    }
                  >
                    {formatTime12h(slot)}
                  </button>
                ))}
              </div>
            )}
          </FieldGroup>

          <p className="text-xs text-navy/40">
            {settings.sessionLengthMinutes}-minute session &middot;{" "}
            {formatCurrency(settings.sessionRateCents)} flat rate
          </p>
        </CardBody>
      </Card>

      {error && (
        <p className="rounded-xl bg-danger-bg px-4 py-2.5 text-sm text-danger">{error}</p>
      )}

      <Button
        size="lg"
        disabled={!selectedSlot || booking}
        onClick={confirmBooking}
        className="w-full sm:w-auto"
      >
        {booking ? "Booking…" : "Confirm Booking"}
      </Button>
    </div>
  );
}
