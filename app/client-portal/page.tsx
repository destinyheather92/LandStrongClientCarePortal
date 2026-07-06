import { requireRole } from "@/lib/auth-roles";
import { isClerkConfigured } from "@/lib/config";
import { getClient } from "@/lib/store";
import { getTherapistSettings } from "@/lib/therapist-settings";
import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";
import { ClientPortalView } from "@/components/client-portal/client-portal-view";

export const metadata = {
  title: "Client Portal — LandStrong Client Care Portal",
};

export default async function ClientPortalPage() {
  if (!isClerkConfigured()) return <ClerkSetupNotice />;

  const actor = await requireRole("client");
  const client = getClient(actor.userId);
  const settings = getTherapistSettings();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-navy">
          Welcome{client ? `, ${client.intake.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-3 text-navy/60">
          Your sessions, reminders, and invoices with {settings.practiceName}.
        </p>
      </div>

      <ClientPortalView client={client} settings={settings} />
    </div>
  );
}
