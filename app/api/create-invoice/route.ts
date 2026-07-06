import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { format, addMinutes } from "date-fns";
import { requireRole } from "@/lib/auth-roles";
import { getAppointment, getClient, createInvoiceRecord } from "@/lib/store";
import { getTherapistSettings } from "@/lib/therapist-settings";
import { createMockInvoice, createStripeInvoiceIfConfigured } from "@/lib/stripe-invoices";
import { isStripeConfigured } from "@/lib/config";

/**
 * Manual invoice creation for an appointment that doesn't already have one —
 * the normal booking flow (/api/book-appointment) creates an invoice
 * automatically, so this mainly covers the therapist-triggered edge case.
 */
export async function POST(request: Request) {
  await requireRole("therapist");

  const body = await request.json().catch(() => null);
  const appointmentId = typeof body?.appointmentId === "string" ? body.appointmentId : "";
  if (!appointmentId) {
    return NextResponse.json({ error: "appointmentId is required." }, { status: 400 });
  }

  const appointment = getAppointment(appointmentId);
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  const client = getClient(appointment.clientId);
  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  const settings = getTherapistSettings();
  const dueDate = format(
    addMinutes(new Date(), settings.invoiceDueDays * 24 * 60),
    "yyyy-MM-dd"
  );

  const invoiceResult = isStripeConfigured()
    ? await createStripeInvoiceIfConfigured({
        clientEmail: client.intake.email,
        clientName: client.intake.fullName,
        amountCents: settings.sessionRateCents,
        dueDate,
        description: `${settings.practiceName} session on ${appointment.date}`,
      })
    : await createMockInvoice();

  const invoice = createInvoiceRecord({
    clientId: appointment.clientId,
    appointmentId: appointment.id,
    amountCents: settings.sessionRateCents,
    dueDate,
    isMockInvoice: invoiceResult.isMock,
    stripeInvoiceId: invoiceResult.stripeInvoiceId,
    stripeInvoiceUrl: invoiceResult.stripeInvoiceUrl,
  });

  revalidatePath(`/therapist-dashboard/${appointment.clientId}`);
  revalidatePath("/invoice");

  return NextResponse.json(invoice);
}
