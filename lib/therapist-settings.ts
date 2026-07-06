import { TherapistSettings } from "./types";
import { getPracticeName, getTherapistEmail } from "./config";

/**
 * Mock therapist settings store. Same globalThis-singleton trick as
 * lib/store.ts, for the same reason: Route Handlers and Server Components
 * can land in separate module graphs under Turbopack, and without this every
 * graph would get its own disconnected copy of the settings.
 *
 * Swap this module for a `therapist_settings` table (Supabase/Postgres/etc.)
 * behind the same two function signatures when a real database is added.
 */

function createDefaultSettings(): TherapistSettings {
  return {
    displayName: "Dr. Maria Landstrong, LMFT",
    practiceName: getPracticeName(),
    sessionRateCents: 15000,
    sessionLengthMinutes: 50,
    bufferMinutes: 10,
    availableDays: [1, 2, 3, 4, 5], // Mon–Fri
    startTime: "09:00",
    endTime: "17:00",
    googleCalendarEmail: getTherapistEmail(),
    reminderHoursBefore: [24, 1],
    invoiceDueDays: 7,
    intakeInstructions:
      "Please arrive a few minutes early to test your camera and microphone. Sessions are held over Google Meet unless otherwise noted.",
    updatedAt: new Date().toISOString(),
  };
}

const globalStore = globalThis as unknown as { __landstrongSettings?: TherapistSettings };

if (!globalStore.__landstrongSettings) {
  globalStore.__landstrongSettings = createDefaultSettings();
}

export function getTherapistSettings(): TherapistSettings {
  return globalStore.__landstrongSettings!;
}

export function updateTherapistSettings(
  partial: Partial<Omit<TherapistSettings, "updatedAt">>
): TherapistSettings {
  const current = getTherapistSettings();
  const updated: TherapistSettings = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  globalStore.__landstrongSettings = updated;
  return updated;
}
