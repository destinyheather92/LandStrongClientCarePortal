import Link from "next/link";
import { ClientRecord } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateShort, initials } from "@/lib/utils";

function invoiceTone(status?: string) {
  if (status === "paid") return "success" as const;
  if (status === "overdue") return "danger" as const;
  return "warning" as const;
}

function appointmentTone(status?: string) {
  if (status === "confirmed") return "info" as const;
  if (status === "cancelled") return "danger" as const;
  return "neutral" as const;
}

function noteTone(status: string) {
  if (status === "approved") return "success" as const;
  if (status === "draft") return "warning" as const;
  return "neutral" as const;
}

function noteLabel(status: string) {
  if (status === "approved") return "Approved";
  if (status === "draft") return "Draft pending review";
  return "Not started";
}

export function TherapistDashboard({ clients }: { clients: ClientRecord[] }) {
  const today = new Date().toISOString().slice(0, 10);

  if (clients.length === 0) {
    return <p className="text-navy/50">No clients yet.</p>;
  }

  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-navy/10">
        {clients.map((record) => {
          const nextAppointment = record.appointments[0];
          const invoice = record.invoices[0];
          const noteStatus = record.note?.status ?? "not_started";
          const isToday = nextAppointment?.date === today;

          return (
            <Link
              key={record.intake.id}
              href={`/therapist-dashboard/${record.intake.id}`}
              className="grid grid-cols-1 gap-4 px-6 py-5 transition-colors hover:bg-mist/50 sm:grid-cols-[1.6fr_1fr_1fr_1fr] sm:items-center"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-sm font-semibold text-navy">
                  {initials(record.intake.fullName)}
                </span>
                <div>
                  <p className="text-sm font-medium text-navy">
                    {record.intake.fullName}
                  </p>
                  <p className="text-xs text-navy/50">{record.intake.email}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-navy/40 sm:hidden">
                  Appointment
                </p>
                {nextAppointment ? (
                  <div className="mt-1 flex items-center gap-2 sm:mt-0">
                    <div>
                      <p className="text-sm text-navy">
                        {isToday ? "Today" : formatDateShort(nextAppointment.date)}
                      </p>
                      <Badge tone={appointmentTone(nextAppointment.status)} className="mt-1">
                        {nextAppointment.status}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-navy/40">None scheduled</span>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-navy/40 sm:hidden">
                  Invoice
                </p>
                {invoice ? (
                  <Badge tone={invoiceTone(invoice.status)} className="mt-1 sm:mt-0">
                    {invoice.status}
                  </Badge>
                ) : (
                  <span className="text-sm text-navy/40">No invoice</span>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-navy/40 sm:hidden">
                  Session note
                </p>
                <Badge tone={noteTone(noteStatus)} className="mt-1 sm:mt-0">
                  {noteLabel(noteStatus)}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
