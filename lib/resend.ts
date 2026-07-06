import { Resend } from "resend";
import AppointmentConfirmationEmail from "@/emails/appointment-confirmation";
import AppointmentReminderEmail from "@/emails/appointment-reminder";
import InvoiceEmail from "@/emails/invoice-email";
import { getPracticeName, getPracticePhone } from "./config";
import { getTherapistSettings } from "./therapist-settings";

/**
 * Thin wrapper around the official Resend SDK. When RESEND_API_KEY is unset
 * every function logs the email to the console and resolves as if it had
 * sent successfully, so the booking/reminder/invoice flows never break in
 * mock mode — flip on a real key in .env.local and the exact same call
 * sites start sending real mail.
 */

export interface EmailParams {
  to: string;
  clientName: string;
  appointmentDate: string;
  meetLink?: string;
  invoiceLink?: string;
}

export type EmailResult =
  | { success: true; id?: string; mocked: boolean }
  | { success: false; error: string };

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || "onboarding@resend.dev";
}

function logMockEmail(kind: string, subject: string, params: EmailParams) {
  console.log(
    [
      `[mock email:${kind}] RESEND_API_KEY not set — logging instead of sending.`,
      `  to: ${params.to}`,
      `  subject: ${subject}`,
      `  clientName: ${params.clientName}`,
      `  appointmentDate: ${params.appointmentDate}`,
      params.meetLink ? `  meetLink: ${params.meetLink}` : null,
      params.invoiceLink ? `  invoiceLink: ${params.invoiceLink}` : null,
    ]
      .filter(Boolean)
      .join("\n")
  );
}

async function send(
  kind: string,
  subject: string,
  react: React.ReactNode,
  params: EmailParams
): Promise<EmailResult> {
  const client = getClient();

  if (!client) {
    logMockEmail(kind, subject, params);
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await client.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject,
      react,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id, mocked: false };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email.",
    };
  }
}

export async function sendAppointmentConfirmation(
  params: EmailParams
): Promise<EmailResult> {
  const settings = getTherapistSettings();
  const practiceName = getPracticeName();

  return send(
    "appointment-confirmation",
    `Your session with ${settings.displayName} is confirmed`,
    AppointmentConfirmationEmail({
      clientName: params.clientName,
      therapistName: settings.displayName,
      practiceName,
      practicePhone: getPracticePhone(),
      appointmentDate: params.appointmentDate,
      meetLink: params.meetLink ?? "",
      invoiceLink: params.invoiceLink,
    }),
    params
  );
}

export async function sendAppointmentReminder(
  params: EmailParams & { hoursBefore?: number }
): Promise<EmailResult> {
  const settings = getTherapistSettings();
  const practiceName = getPracticeName();

  return send(
    "appointment-reminder",
    `Reminder: your session with ${settings.displayName} is coming up`,
    AppointmentReminderEmail({
      clientName: params.clientName,
      therapistName: settings.displayName,
      practiceName,
      practicePhone: getPracticePhone(),
      appointmentDate: params.appointmentDate,
      meetLink: params.meetLink ?? "",
      hoursBefore: params.hoursBefore,
    }),
    params
  );
}

export async function sendInvoiceEmail(
  params: EmailParams & { amountLabel: string; dueDateLabel: string }
): Promise<EmailResult> {
  const settings = getTherapistSettings();
  const practiceName = getPracticeName();

  return send(
    "invoice",
    `Invoice from ${practiceName}`,
    InvoiceEmail({
      clientName: params.clientName,
      therapistName: settings.displayName,
      practiceName,
      practicePhone: getPracticePhone(),
      appointmentDate: params.appointmentDate,
      amountLabel: params.amountLabel,
      dueDateLabel: params.dueDateLabel,
      invoiceLink: params.invoiceLink,
    }),
    params
  );
}
