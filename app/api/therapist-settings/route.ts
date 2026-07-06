import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth-roles";
import { getTherapistSettings, updateTherapistSettings } from "@/lib/therapist-settings";

const SettingsSchema = z.object({
  displayName: z.string().min(2),
  practiceName: z.string().min(2),
  sessionRateCents: z.number().int().min(0),
  sessionLengthMinutes: z.number().int().min(5).max(480),
  bufferMinutes: z.number().int().min(0).max(240),
  availableDays: z.array(z.number().int().min(0).max(6)),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  googleCalendarEmail: z.string().email().or(z.literal("")),
  reminderHoursBefore: z.array(z.number().int().min(0)),
  invoiceDueDays: z.number().int().min(0).max(90),
  intakeInstructions: z.string().optional(),
});

export async function GET() {
  await requireRole("therapist");
  return NextResponse.json(getTherapistSettings());
}

export async function POST(request: Request) {
  await requireRole("therapist");

  const body = await request.json().catch(() => null);
  const parsed = SettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid settings." },
      { status: 400 }
    );
  }

  const updated = updateTherapistSettings(parsed.data);
  return NextResponse.json(updated);
}
