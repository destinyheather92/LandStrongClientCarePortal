import { addMinutes, format, isBefore, parse } from "date-fns";
import { getAppointmentsOnDate } from "./store";
import { getBusyTimes } from "./google-calendar";
import { getTherapistSettings } from "./therapist-settings";

export interface AvailabilityResult {
  slots: string[]; // "HH:MM", 24-hour
  closed: boolean;
  reason?: string;
}

function parseDateOnly(dateISO: string): Date {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return isBefore(startA, endB) && isBefore(startB, endA);
}

/**
 * Available session start times for a given date, derived from the
 * therapist's working hours/session length/buffer, minus already-booked
 * appointments (lib/store.ts) and, if Google Calendar is configured, minus
 * external busy time on the real calendar too.
 */
export async function getAvailableSlots(dateISO: string): Promise<AvailabilityResult> {
  const settings = getTherapistSettings();
  const weekday = parseDateOnly(dateISO).getDay();

  if (!settings.availableDays.includes(weekday)) {
    return { slots: [], closed: true, reason: "The practice isn't open on this day." };
  }

  const dayStart = parse(settings.startTime, "HH:mm", parseDateOnly(dateISO));
  const dayEnd = parse(settings.endTime, "HH:mm", parseDateOnly(dateISO));
  const stepMinutes = settings.sessionLengthMinutes + settings.bufferMinutes;

  const bookedAppointments = getAppointmentsOnDate(dateISO);
  const busyFromCalendar = await getBusyTimes(dateISO);

  const now = new Date();
  const slots: string[] = [];

  for (
    let slotStart = dayStart;
    isBefore(addMinutes(slotStart, settings.sessionLengthMinutes), addMinutes(dayEnd, 1));
    slotStart = addMinutes(slotStart, stepMinutes)
  ) {
    const slotEnd = addMinutes(slotStart, settings.sessionLengthMinutes);

    if (isBefore(slotStart, now)) continue;

    const clashesWithBooking = bookedAppointments.some((appt) => {
      const apptStart = parse(appt.time, "HH:mm", parseDateOnly(dateISO));
      const apptEnd = addMinutes(apptStart, settings.sessionLengthMinutes);
      return overlaps(slotStart, slotEnd, apptStart, apptEnd);
    });
    if (clashesWithBooking) continue;

    const clashesWithCalendar = busyFromCalendar.some((busy) =>
      overlaps(slotStart, slotEnd, new Date(busy.start), new Date(busy.end))
    );
    if (clashesWithCalendar) continue;

    slots.push(format(slotStart, "HH:mm"));
  }

  return { slots, closed: false };
}

export async function isSlotStillAvailable(dateISO: string, time24: string): Promise<boolean> {
  const { slots } = await getAvailableSlots(dateISO);
  return slots.includes(time24);
}
