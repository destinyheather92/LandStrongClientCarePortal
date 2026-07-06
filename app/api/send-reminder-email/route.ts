import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-roles";
import {
  getAppointment,
  getClient,
  getInvoice,
  markReminderSent,
  sendPaymentReminder,
} from "@/lib/store";
import { sendAppointmentReminder, sendInvoiceEmail } from "@/lib/resend";
import { formatCurrency, formatDateLong, formatDateTimeLabel } from "@/lib/utils";

/**
 * Manually triggers a reminder email — in production, appointment/invoice
 * reminders would be sent by a scheduled job (cron/queue) checking
 * reminderHoursBefore / invoiceDueDays automatically. For this demo, the
 * therapist dashboard exposes a "Send Reminder Now" button that hits this
 * route instead of running a real background scheduler.
 */
export async function POST(request: Request) {
  await requireRole("therapist");

  const body = await request.json().catch(() => null);
  const type = body?.type === "invoice" ? "invoice" : "appointment";

  if (type === "appointment") {
    const appointmentId = typeof body?.appointmentId === "string" ? body.appointmentId : "";
    const reminderId = typeof body?.reminderId === "string" ? body.reminderId : undefined;

    const appointment = getAppointment(appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }
    const client = getClient(appointment.clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const target =
      appointment.reminders.find((r) => r.id === reminderId) ??
      appointment.reminders.find((r) => r.status === "scheduled");

    const result = await sendAppointmentReminder({
      to: client.intake.email,
      clientName: client.intake.fullName,
      appointmentDate: formatDateTimeLabel(appointment.date, appointment.time),
      meetLink: appointment.meetLink,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    if (target) markReminderSent(appointment.id, target.id);
    revalidatePath(`/therapist-dashboard/${appointment.clientId}`);
    revalidatePath("/client-portal");

    return NextResponse.json({ success: true, mocked: result.mocked });
  }

  const invoiceId = typeof body?.invoiceId === "string" ? body.invoiceId : "";
  const invoice = getInvoice(invoiceId);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }
  const client = getClient(invoice.clientId);
  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }
  const appointment = getAppointment(invoice.appointmentId);

  const result = await sendInvoiceEmail({
    to: client.intake.email,
    clientName: client.intake.fullName,
    appointmentDate: appointment
      ? formatDateTimeLabel(appointment.date, appointment.time)
      : "your recent session",
    invoiceLink: invoice.stripeInvoiceUrl,
    amountLabel: formatCurrency(invoice.amount),
    dueDateLabel: formatDateLong(invoice.dueDate),
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  sendPaymentReminder(invoice.id);
  revalidatePath(`/therapist-dashboard/${invoice.clientId}`);
  revalidatePath("/invoice");

  return NextResponse.json({ success: true, mocked: result.mocked });
}
