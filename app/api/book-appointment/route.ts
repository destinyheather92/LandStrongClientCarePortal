import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addMinutes, format, parse } from "date-fns";
import { requireRole } from "@/lib/auth-roles";
import { isSlotStillAvailable } from "@/lib/availability";
import { getTherapistSettings } from "@/lib/therapist-settings";
import { createCalendarEventWithMeet } from "@/lib/google-calendar";
import { createMockInvoice, createStripeInvoiceIfConfigured } from "@/lib/stripe-invoices";
import { sendAppointmentConfirmation } from "@/lib/resend";
import { getClient, createAppointment, createInvoiceRecord } from "@/lib/store";
import { isStripeConfigured } from "@/lib/config";
import { formatDateTimeLabel } from "@/lib/utils";
import { SESSION_TYPES } from "@/lib/types";

const BookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Please choose a valid time."),
  sessionType: z.enum(SESSION_TYPES).default("Video"),
});

export async function POST(request: Request) {
  const actor = await requireRole("client");

  const body = await request.json().catch(() => null);
  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid booking request." },
      { status: 400 }
    );
  }

  const client = getClient(actor.userId);
  if (!client) {
    return NextResponse.json(
      { error: "Please complete intake before booking a session." },
      { status: 400 }
    );
  }

  const { date, time, sessionType } = parsed.data;

  const stillAvailable = await isSlotStillAvailable(date, time);
  if (!stillAvailable) {
    return NextResponse.json(
      { error: "That time was just booked. Please choose another slot." },
      { status: 409 }
    );
  }

  const settings = getTherapistSettings();
  const startDate = parse(time, "HH:mm", new Date(`${date}T00:00:00`));
  const endDate = addMinutes(startDate, settings.sessionLengthMinutes);

  const calendarEvent = await createCalendarEventWithMeet({
    summary: `${settings.practiceName} session with ${client.intake.fullName}`,
    description: "Booked via the LandStrong Client Care Portal.",
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
    attendeeEmail: client.intake.email,
  });

  const appointment = createAppointment({
    clientId: actor.userId,
    therapist: settings.displayName,
    sessionType,
    date,
    time,
    googleEventId: calendarEvent.eventId,
    meetLink: calendarEvent.meetLink,
    calendarLink: calendarEvent.calendarLink,
    isMockCalendarEvent: calendarEvent.isMock,
    reminderHoursBefore: settings.reminderHoursBefore,
  });

  const dueDate = format(addMinutes(new Date(), settings.invoiceDueDays * 24 * 60), "yyyy-MM-dd");
  const invoiceResult = isStripeConfigured()
    ? await createStripeInvoiceIfConfigured({
        clientEmail: client.intake.email,
        clientName: client.intake.fullName,
        amountCents: settings.sessionRateCents,
        dueDate,
        description: `${settings.practiceName} session on ${date}`,
      })
    : await createMockInvoice();

  const invoice = createInvoiceRecord({
    clientId: actor.userId,
    appointmentId: appointment.id,
    amountCents: settings.sessionRateCents,
    dueDate,
    isMockInvoice: invoiceResult.isMock,
    stripeInvoiceId: invoiceResult.stripeInvoiceId,
    stripeInvoiceUrl: invoiceResult.stripeInvoiceUrl,
  });

  try {
    await sendAppointmentConfirmation({
      to: client.intake.email,
      clientName: client.intake.fullName,
      appointmentDate: formatDateTimeLabel(date, time),
      meetLink: appointment.meetLink,
      invoiceLink: invoice.stripeInvoiceUrl,
    });
  } catch (err) {
    // A failed email should never roll back a successful booking.
    console.error("[book-appointment] confirmation email failed:", err);
  }

  revalidatePath("/client-portal");
  revalidatePath("/invoice");
  revalidatePath("/therapist-dashboard");
  revalidatePath(`/therapist-dashboard/${actor.userId}`);

  return NextResponse.json({ appointmentId: appointment.id });
}
