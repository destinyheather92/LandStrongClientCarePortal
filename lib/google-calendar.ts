import { isGoogleCalendarConfigured } from "./config";
import { generateId } from "./utils";

/**
 * Google Calendar / Meet integration.
 *
 * Real OAuth credentials go in .env.local:
 *   GOOGLE_CLIENT_ID       — OAuth client ID (Google Cloud Console -> APIs & Services -> Credentials)
 *   GOOGLE_CLIENT_SECRET   — OAuth client secret, same place
 *   GOOGLE_REFRESH_TOKEN   — obtained once via OAuth consent (e.g. Google OAuth Playground,
 *                            https://developers.google.com/oauthplayground, with the
 *                            "Calendar API v3" scope and your own client ID/secret plugged in
 *                            under the gear icon) — grants offline access to GOOGLE_CALENDAR_ID
 *   GOOGLE_CALENDAR_ID     — the calendar to book into (usually the therapist's email)
 *
 * All four must be present for real mode; if any are missing, every function
 * below falls back to a mock implementation so booking still works end to
 * end for the demo.
 */

interface BusyInterval {
  start: string;
  end: string;
}

interface CreateEventParams {
  summary: string;
  description?: string;
  startISO: string;
  endISO: string;
  attendeeEmail?: string;
}

interface CreateEventResult {
  eventId: string;
  meetLink: string;
  calendarLink: string;
  isMock: boolean;
}

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to refresh Google access token (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/** A believable but entirely fake meet.google.com link — never real, never reused. */
export function generateMockMeetLink(): string {
  const segment = () => Math.random().toString(36).slice(2, 5);
  return `https://meet.google.com/${segment()}-${segment()}-${segment()}`;
}

/**
 * Busy intervals on the therapist's calendar for the given day. Returns []
 * in mock mode (double-booking is still prevented via already-booked
 * appointments in lib/store.ts — this only adds *external* calendar busy
 * time on top, e.g. a personal event not created through this app).
 */
export async function getBusyTimes(dateISO: string): Promise<BusyInterval[]> {
  if (!isGoogleCalendarConfigured()) return [];

  try {
    const accessToken = await getAccessToken();
    const timeMin = `${dateISO}T00:00:00Z`;
    const timeMax = `${dateISO}T23:59:59Z`;

    const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const busy = data.calendars?.[process.env.GOOGLE_CALENDAR_ID as string]?.busy ?? [];
    return busy as BusyInterval[];
  } catch {
    // A flaky Google API call shouldn't take down scheduling for the demo —
    // fall back to "no external busy time known" and rely on our own store.
    return [];
  }
}

/**
 * Creates a calendar event with a unique Google Meet link when real
 * credentials are present (conferenceDataVersion=1 + conferenceData.createRequest
 * is what makes Google mint a fresh Meet link per event). Falls back to a
 * mock event + mock Meet link otherwise. Every call — mock or real — gets
 * its own unique link; links are never reused across appointments.
 */
export async function createCalendarEventWithMeet(
  params: CreateEventParams
): Promise<CreateEventResult> {
  if (!isGoogleCalendarConfigured()) {
    return {
      eventId: generateId("evt"),
      meetLink: generateMockMeetLink(),
      calendarLink: `https://calendar.google.com/calendar/event?eid=${generateId("mock")}`,
      isMock: true,
    };
  }

  try {
    const accessToken = await getAccessToken();
    const calendarId = process.env.GOOGLE_CALENDAR_ID!;
    const requestId = generateId("meet"); // unique per appointment — required so Google mints a new Meet link each time

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId
      )}/events?conferenceDataVersion=1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: params.summary,
          description: params.description,
          start: { dateTime: params.startISO },
          end: { dateTime: params.endISO },
          attendees: params.attendeeEmail ? [{ email: params.attendeeEmail }] : undefined,
          conferenceData: {
            createRequest: {
              requestId,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Google Calendar event creation failed (${res.status}): ${body}`);
    }

    const event = await res.json();
    const meetLink =
      event.conferenceData?.entryPoints?.find(
        (entry: { entryPointType?: string }) => entry.entryPointType === "video"
      )?.uri ?? event.hangoutLink ?? generateMockMeetLink();

    return {
      eventId: event.id,
      meetLink,
      calendarLink: event.htmlLink,
      isMock: false,
    };
  } catch (err) {
    // Never let a Google API hiccup block a booking during the demo — fall
    // back to mock so the appointment still gets created.
    console.error("[google-calendar] falling back to mock event:", err);
    return {
      eventId: generateId("evt"),
      meetLink: generateMockMeetLink(),
      calendarLink: `https://calendar.google.com/calendar/event?eid=${generateId("mock")}`,
      isMock: true,
    };
  }
}
