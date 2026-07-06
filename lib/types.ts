export const SESSION_TYPES = ["Video", "Phone", "In-Person"] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export type AppointmentStatus = "confirmed" | "completed" | "cancelled";

export type InvoiceStatus = "paid" | "unpaid" | "overdue";

export type NoteStatus = "not_started" | "draft" | "approved";

export interface ClientIntake {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  reasonForVisit: string;
  insuranceProvider?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  consentAcknowledged: boolean;
  createdAt: string;
}

export interface ReminderEvent {
  id: string;
  label: string;
  channel: "email" | "sms";
  timing: string;
  status: "sent" | "scheduled";
  timestamp: string | null;
}

export interface Appointment {
  id: string;
  clientId: string;
  therapist: string;
  sessionType: SessionType;
  date: string;
  time: string;
  status: AppointmentStatus;
  googleEventId: string;
  meetLink: string;
  calendarLink: string;
  isMockCalendarEvent: boolean;
  reminders: ReminderEvent[];
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  appointmentId: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  reminderSentAt?: string;
  isMockInvoice: boolean;
  stripeInvoiceId?: string;
  stripeInvoiceUrl?: string;
}

export interface SessionNote {
  clientId: string;
  appointmentId: string;
  sourceText: string;
  aiDraft: string;
  status: NoteStatus;
  generatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface ClientRecord {
  intake: ClientIntake;
  appointments: Appointment[];
  invoices: Invoice[];
  note: SessionNote | null;
}

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export interface TherapistSettings {
  displayName: string;
  practiceName: string;
  sessionRateCents: number;
  sessionLengthMinutes: number;
  bufferMinutes: number;
  availableDays: number[]; // 0 = Sunday .. 6 = Saturday
  startTime: string; // "09:00" 24h
  endTime: string; // "17:00" 24h
  googleCalendarEmail: string;
  reminderHoursBefore: number[]; // e.g. [24, 1]
  invoiceDueDays: number;
  intakeInstructions?: string;
  updatedAt: string;
}
