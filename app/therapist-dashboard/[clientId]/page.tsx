import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-roles";
import { isClerkConfigured } from "@/lib/config";
import { getClient } from "@/lib/store";
import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";
import { IntakeSummary } from "@/components/dashboard/intake-summary";
import { AppointmentCard } from "@/components/dashboard/appointment-card";
import { InvoiceStatus } from "@/components/dashboard/invoice-status";
import { AINoteGenerator } from "@/components/dashboard/ai-note-generator";
import { initials } from "@/lib/utils";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  if (!isClerkConfigured()) return <ClerkSetupNotice />;
  await requireRole("therapist");

  const { clientId } = await params;
  const client = getClient(clientId);
  if (!client) notFound();

  const latestAppointment = client.appointments[0];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href="/therapist-dashboard"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-navy/60 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mb-10 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mist text-lg font-semibold text-navy">
          {initials(client.intake.fullName)}
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-navy">
            {client.intake.fullName}
          </h1>
          <p className="text-sm text-navy/50">{client.intake.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <IntakeSummary intake={client.intake} />

        {client.appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}

        {client.invoices.map((invoice) => (
          <InvoiceStatus key={invoice.id} invoice={invoice} />
        ))}

        <AINoteGenerator
          clientId={client.intake.id}
          appointmentId={latestAppointment?.id}
          note={client.note}
        />
      </div>
    </div>
  );
}
