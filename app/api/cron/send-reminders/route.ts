import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getDueReminders, markReminderSent } from "@/lib/store";
import { sendAppointmentReminder } from "@/lib/resend";
import { formatDateTimeLabel } from "@/lib/utils";

/**
 * Vercel Cron hits this on a schedule (see vercel.json) to send appointment
 * reminders automatically — this replaces the therapist having to click
 * "Send Reminder Now" for every 24-hour/1-hour reminder. Auth is a shared
 * secret since Cron requests aren't a signed-in therapist session.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const due = getDueReminders();
  let sent = 0;
  let failed = 0;

  for (const { appointment, reminder, client } of due) {
    const result = await sendAppointmentReminder({
      to: client.email,
      clientName: client.fullName,
      appointmentDate: formatDateTimeLabel(appointment.date, appointment.time),
      meetLink: appointment.meetLink,
      hoursBefore: reminder.hoursBefore,
    });

    if (result.success) {
      markReminderSent(appointment.id, reminder.id);
      revalidatePath(`/therapist-dashboard/${appointment.clientId}`);
      revalidatePath("/client-portal");
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({ checked: due.length, sent, failed });
}
