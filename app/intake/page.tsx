import { requireRole } from "@/lib/auth-roles";
import { isClerkConfigured } from "@/lib/config";
import { getClient } from "@/lib/store";
import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";
import { IntakeForm } from "@/components/intake/intake-form";

export const metadata = {
  title: "Client Intake — LandStrong Client Care Portal",
};

export default async function IntakePage() {
  if (!isClerkConfigured()) return <ClerkSetupNotice />;

  const actor = await requireRole("client");
  const existing = getClient(actor.userId)?.intake;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-navy">
          Welcome to LandStrong Counseling
        </h1>
        <p className="mt-3 text-navy/60">
          Let&rsquo;s get to know you before your first session. This takes
          about two minutes.
        </p>
      </div>

      <IntakeForm existing={existing} />
    </div>
  );
}
