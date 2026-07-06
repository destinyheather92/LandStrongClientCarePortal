import {
  Appointment,
  ClientIntake,
  ClientRecord,
  Invoice,
  ReminderEvent,
  SessionNote,
  SessionType,
} from "./types";
import { generateId } from "./utils";

/**
 * In-memory mock "database" for the demo. Resets whenever the dev server
 * process restarts. A real deployment would replace this module with a
 * Postgres/Prisma (or similar) data layer behind the same function names.
 */

const DEMO_THERAPIST_NAME = "Dr. Maria Landstrong, LMFT";
const SESSION_FEE_CENTS = 15000;

function daysFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function isoDaysAgo(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString();
}

let clients: ClientIntake[] = [
  {
    id: "client_emily",
    fullName: "Emily Carter",
    email: "emily.carter@example.com",
    phone: "(555) 201-3344",
    dateOfBirth: "1994-03-12",
    reasonForVisit:
      "Ongoing anxiety related to a recent job change and difficulty sleeping.",
    insuranceProvider: "Blue Cross Blue Shield",
    emergencyContactName: "Daniel Carter",
    emergencyContactPhone: "(555) 201-9981",
    consentAcknowledged: true,
    createdAt: isoDaysAgo(2),
  },
  {
    id: "client_marcus",
    fullName: "Marcus Webb",
    email: "marcus.webb@example.com",
    phone: "(555) 447-8820",
    dateOfBirth: "1988-11-02",
    reasonForVisit: "Grief counseling following the loss of a parent.",
    insuranceProvider: "Aetna",
    emergencyContactName: "Renee Webb",
    emergencyContactPhone: "(555) 447-1102",
    consentAcknowledged: true,
    createdAt: isoDaysAgo(19),
  },
  {
    id: "client_sophia",
    fullName: "Sophia Nguyen",
    email: "sophia.nguyen@example.com",
    phone: "(555) 663-2290",
    dateOfBirth: "2000-07-24",
    reasonForVisit: "Support with relationship communication and stress management.",
    insuranceProvider: "Self-pay",
    emergencyContactName: "Linh Nguyen",
    emergencyContactPhone: "(555) 663-5510",
    consentAcknowledged: true,
    createdAt: isoDaysAgo(9),
  },
];

let appointments: Appointment[] = [
  {
    id: "appt_emily_1",
    clientId: "client_emily",
    therapist: DEMO_THERAPIST_NAME,
    sessionType: "Video",
    date: daysFromToday(3),
    time: "10:00",
    status: "confirmed",
    googleEventId: "evt_9f8a3c1d",
    meetLink: "https://meet.google.com/lqs-vrpm-hty",
    calendarLink: "https://calendar.google.com/calendar/event?eid=evt_9f8a3c1d",
    isMockCalendarEvent: true,
    reminders: [
      {
        id: "rem_e1_1",
        label: "Booking confirmation email",
        channel: "email",
        timing: "Immediately",
        status: "sent",
        timestamp: isoDaysAgo(2),
      },
      {
        id: "rem_e1_2",
        label: "24-hour reminder",
        channel: "email",
        timing: "24 hours before session",
        status: "scheduled",
        timestamp: null,
      },
      {
        id: "rem_e1_3",
        label: "1-hour reminder",
        channel: "email",
        timing: "1 hour before session",
        status: "scheduled",
        timestamp: null,
      },
    ],
    createdAt: isoDaysAgo(2),
  },
  {
    id: "appt_marcus_1",
    clientId: "client_marcus",
    therapist: DEMO_THERAPIST_NAME,
    sessionType: "In-Person",
    date: daysFromToday(-10),
    time: "14:00",
    status: "completed",
    googleEventId: "evt_2b7e441a",
    meetLink: "https://meet.google.com/kxo-fbnj-qwd",
    calendarLink: "https://calendar.google.com/calendar/event?eid=evt_2b7e441a",
    isMockCalendarEvent: true,
    reminders: [
      {
        id: "rem_m1_1",
        label: "Booking confirmation email",
        channel: "email",
        timing: "Immediately",
        status: "sent",
        timestamp: isoDaysAgo(19),
      },
      {
        id: "rem_m1_2",
        label: "24-hour reminder",
        channel: "email",
        timing: "24 hours before session",
        status: "sent",
        timestamp: isoDaysAgo(11),
      },
      {
        id: "rem_m1_3",
        label: "1-hour reminder",
        channel: "email",
        timing: "1 hour before session",
        status: "sent",
        timestamp: isoDaysAgo(10),
      },
    ],
    createdAt: isoDaysAgo(19),
  },
  {
    id: "appt_sophia_1",
    clientId: "client_sophia",
    therapist: DEMO_THERAPIST_NAME,
    sessionType: "Video",
    date: daysFromToday(1),
    time: "16:00",
    status: "confirmed",
    googleEventId: "evt_7c1f209e",
    meetLink: "https://meet.google.com/dpv-znxk-uur",
    calendarLink: "https://calendar.google.com/calendar/event?eid=evt_7c1f209e",
    isMockCalendarEvent: true,
    reminders: [
      {
        id: "rem_s1_1",
        label: "Booking confirmation email",
        channel: "email",
        timing: "Immediately",
        status: "sent",
        timestamp: isoDaysAgo(9),
      },
      {
        id: "rem_s1_2",
        label: "24-hour reminder",
        channel: "email",
        timing: "24 hours before session",
        status: "sent",
        timestamp: isoDaysAgo(0),
      },
      {
        id: "rem_s1_3",
        label: "1-hour reminder",
        channel: "email",
        timing: "1 hour before session",
        status: "scheduled",
        timestamp: null,
      },
    ],
    createdAt: isoDaysAgo(9),
  },
];

let invoices: Invoice[] = [
  {
    id: "inv_emily_1",
    clientId: "client_emily",
    appointmentId: "appt_emily_1",
    amount: SESSION_FEE_CENTS,
    status: "unpaid",
    issuedAt: isoDaysAgo(2),
    dueDate: daysFromToday(5),
    isMockInvoice: true,
  },
  {
    id: "inv_marcus_1",
    clientId: "client_marcus",
    appointmentId: "appt_marcus_1",
    amount: SESSION_FEE_CENTS,
    status: "paid",
    issuedAt: isoDaysAgo(19),
    dueDate: isoDaysAgo(5),
    paidAt: isoDaysAgo(9),
    isMockInvoice: true,
  },
  {
    id: "inv_sophia_1",
    clientId: "client_sophia",
    appointmentId: "appt_sophia_1",
    amount: SESSION_FEE_CENTS,
    status: "overdue",
    issuedAt: isoDaysAgo(9),
    dueDate: isoDaysAgo(2),
    reminderSentAt: isoDaysAgo(1),
    isMockInvoice: true,
  },
];

let notes: SessionNote[] = [
  {
    clientId: "client_marcus",
    appointmentId: "appt_marcus_1",
    sourceText:
      "Client discussed continued grief following the loss of his father 3 months ago. Reports better sleep this week (6-7 hrs vs 4 hrs). Still avoids his father's workshop. Practiced grounding exercise in session, client engaged well. Plans to visit workshop briefly before next session as a gentle exposure step.",
    aiDraft:
      "DATA: Client presented with continued grief symptoms related to the loss of his father approximately 3 months ago. He reported improved sleep this week, averaging 6-7 hours compared to 4 hours previously. Client continues to avoid his father's workshop. A grounding exercise was practiced in session, with the client engaging actively.\n\nASSESSMENT: Client is showing gradual improvement in sleep and emotional regulation. Continued avoidance of the workshop suggests unresolved grief-related distress tied to that specific location. Client demonstrated openness to therapeutic techniques introduced in session.\n\nPLAN: Client agreed to a brief, low-pressure visit to the workshop before the next session as a gentle exposure step. Continue grief processing work and reinforce grounding/coping strategies at next session.",
    status: "approved",
    generatedAt: isoDaysAgo(10),
    approvedAt: isoDaysAgo(10),
    approvedBy: DEMO_THERAPIST_NAME,
  },
  {
    clientId: "client_sophia",
    appointmentId: "appt_sophia_1",
    sourceText:
      "Sophia talked about a recent argument with her partner about division of household responsibilities. She felt unheard during the conflict and raised her voice, which she regretted afterward. We reviewed 'I-statements' and practiced a script for revisiting the conversation calmly. She identified stress at work as a contributing factor to her short temper lately.",
    aiDraft:
      "DATA: Client reported a recent conflict with her partner regarding division of household responsibilities. She described feeling unheard during the exchange and raised her voice, which she later regretted. Client identified elevated work-related stress as a contributing factor to recent irritability.\n\nASSESSMENT: Client is experiencing situational relationship stress compounded by external work pressures. She demonstrates insight into her own reactive patterns and expressed motivation to communicate differently.\n\nPLAN: Reviewed and practiced 'I-statement' framing with client to support a calmer follow-up conversation with her partner. Continue to monitor work-related stress and its impact on relationship dynamics at next session.",
    status: "draft",
    generatedAt: isoDaysAgo(1),
  },
];

interface StoreData {
  clients: ClientIntake[];
  appointments: Appointment[];
  invoices: Invoice[];
  notes: SessionNote[];
}

// Route Handlers (app/api/**/route.ts) and Server Components/Actions can be
// compiled into separate module graphs, which would otherwise give each its
// own copy of this in-memory "database". Stashing it on `globalThis` the
// first time this module runs means every graph reads and writes the same
// arrays for the lifetime of the process.
const globalStore = globalThis as unknown as { __landstrongStore?: StoreData };

if (!globalStore.__landstrongStore) {
  globalStore.__landstrongStore = { clients, appointments, invoices, notes };
} else {
  ({ clients, appointments, invoices, notes } = globalStore.__landstrongStore);
}

function getIntake(clientId: string): ClientIntake | undefined {
  return clients.find((c) => c.id === clientId);
}

function toRecord(intake: ClientIntake): ClientRecord {
  return {
    intake,
    appointments: appointments
      .filter((a) => a.clientId === intake.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
    invoices: invoices.filter((i) => i.clientId === intake.id),
    note: notes.find((n) => n.clientId === intake.id) ?? null,
  };
}

export function getClients(): ClientRecord[] {
  return [...clients]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(toRecord);
}

export function getClient(clientId: string): ClientRecord | undefined {
  const intake = getIntake(clientId);
  return intake ? toRecord(intake) : undefined;
}

export function getAppointment(appointmentId: string): Appointment | undefined {
  return appointments.find((a) => a.id === appointmentId);
}

export function getInvoice(invoiceId: string): Invoice | undefined {
  return invoices.find((i) => i.id === invoiceId);
}

/** All non-cancelled appointments on a given date, across every client — used to prevent double-booking. */
export function getAppointmentsOnDate(date: string): Appointment[] {
  return appointments.filter((a) => a.date === date && a.status !== "cancelled");
}

export interface IntakeInput {
  id?: string; // pass the signed-in client's Clerk user id to key the record by it
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  reasonForVisit: string;
  insuranceProvider?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  consentAcknowledged: boolean;
}

export function createClientIntake(input: IntakeInput): ClientIntake {
  const existingIndex = input.id ? clients.findIndex((c) => c.id === input.id) : -1;
  const intake: ClientIntake = {
    id: input.id ?? generateId("client"),
    createdAt: existingIndex >= 0 ? clients[existingIndex].createdAt : new Date().toISOString(),
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    dateOfBirth: input.dateOfBirth,
    reasonForVisit: input.reasonForVisit,
    insuranceProvider: input.insuranceProvider,
    emergencyContactName: input.emergencyContactName,
    emergencyContactPhone: input.emergencyContactPhone,
    consentAcknowledged: input.consentAcknowledged,
  };

  if (existingIndex >= 0) {
    clients[existingIndex] = intake;
  } else {
    clients.push(intake);
  }
  return intake;
}

function buildAppointmentReminders(hoursBeforeList: number[]): ReminderEvent[] {
  const confirmation: ReminderEvent = {
    id: generateId("rem"),
    label: "Booking confirmation email",
    channel: "email",
    timing: "Immediately",
    status: "sent",
    timestamp: new Date().toISOString(),
  };

  const scheduled = [...hoursBeforeList]
    .sort((a, b) => b - a)
    .map((hours) => {
      const isDays = hours >= 24 && hours % 24 === 0;
      const amount = isDays ? hours / 24 : hours;
      const unit = isDays ? "day" : "hour";
      const plural = amount === 1 ? "" : "s";
      return {
        id: generateId("rem"),
        label: `${amount}-${unit} reminder`,
        channel: (hours <= 2 ? "sms" : "email") as ReminderEvent["channel"],
        timing: `${amount} ${unit}${plural} before session`,
        status: "scheduled" as const,
        timestamp: null,
      };
    });

  return [confirmation, ...scheduled];
}

export interface CreateAppointmentInput {
  clientId: string;
  therapist: string;
  sessionType: SessionType;
  date: string;
  time: string;
  googleEventId: string;
  meetLink: string;
  calendarLink: string;
  isMockCalendarEvent: boolean;
  reminderHoursBefore: number[];
}

export function createAppointment(input: CreateAppointmentInput): Appointment {
  const appointment: Appointment = {
    id: generateId("appt"),
    clientId: input.clientId,
    therapist: input.therapist,
    sessionType: input.sessionType,
    date: input.date,
    time: input.time,
    status: "confirmed",
    googleEventId: input.googleEventId,
    meetLink: input.meetLink,
    calendarLink: input.calendarLink,
    isMockCalendarEvent: input.isMockCalendarEvent,
    reminders: buildAppointmentReminders(input.reminderHoursBefore),
    createdAt: new Date().toISOString(),
  };
  appointments.push(appointment);
  return appointment;
}

export interface CreateInvoiceInput {
  clientId: string;
  appointmentId: string;
  amountCents: number;
  dueDate: string;
  isMockInvoice: boolean;
  stripeInvoiceId?: string;
  stripeInvoiceUrl?: string;
}

export function createInvoiceRecord(input: CreateInvoiceInput): Invoice {
  const invoice: Invoice = {
    id: generateId("inv"),
    clientId: input.clientId,
    appointmentId: input.appointmentId,
    amount: input.amountCents,
    status: "unpaid",
    issuedAt: new Date().toISOString(),
    dueDate: input.dueDate,
    isMockInvoice: input.isMockInvoice,
    stripeInvoiceId: input.stripeInvoiceId,
    stripeInvoiceUrl: input.stripeInvoiceUrl,
  };
  invoices.push(invoice);
  return invoice;
}

/** Looks up a local invoice by its Stripe invoice ID — used by the Stripe webhook to sync payment status. */
export function getInvoiceByStripeId(stripeInvoiceId: string): Invoice | undefined {
  return invoices.find((i) => i.stripeInvoiceId === stripeInvoiceId);
}

export function markInvoicePaid(invoiceId: string): void {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return;
  invoice.status = "paid";
  invoice.paidAt = new Date().toISOString();
}

export function sendPaymentReminder(invoiceId: string): void {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return;
  invoice.reminderSentAt = new Date().toISOString();
}

export function markReminderSent(appointmentId: string, reminderId: string): void {
  const appointment = appointments.find((a) => a.id === appointmentId);
  const reminder = appointment?.reminders.find((r) => r.id === reminderId);
  if (!reminder) return;
  reminder.status = "sent";
  reminder.timestamp = new Date().toISOString();
}

export function saveDraftNote(
  clientId: string,
  appointmentId: string,
  sourceText: string,
  aiDraft: string
): SessionNote {
  const existingIndex = notes.findIndex((n) => n.clientId === clientId);
  const note: SessionNote = {
    clientId,
    appointmentId,
    sourceText,
    aiDraft,
    status: "draft",
    generatedAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.push(note);
  }
  return note;
}

export function updateDraftNoteText(clientId: string, aiDraft: string): void {
  const note = notes.find((n) => n.clientId === clientId);
  if (!note) return;
  note.aiDraft = aiDraft;
}

export function approveDraftNote(clientId: string, approvedBy: string): void {
  const note = notes.find((n) => n.clientId === clientId);
  if (!note) return;
  note.status = "approved";
  note.approvedAt = new Date().toISOString();
  note.approvedBy = approvedBy;
}

export function discardDraftNote(clientId: string): void {
  const index = notes.findIndex((n) => n.clientId === clientId);
  if (index >= 0) notes.splice(index, 1);
}
