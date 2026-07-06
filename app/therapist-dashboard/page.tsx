import Link from "next/link";
import { Settings } from "lucide-react";
import { requireRole } from "@/lib/auth-roles";
import { isClerkConfigured, isGoogleCalendarConfigured, isResendConfigured, isStripeConfigured } from "@/lib/config";
import { getClients } from "@/lib/store";
import { getTherapistSettings } from "@/lib/therapist-settings";
import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";
import { TherapistDashboard } from "@/components/dashboard/therapist-dashboard";
import { DemoBanner } from "@/components/demo-banner";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Therapist Dashboard — LandStrong Client Care Portal",
};

export default async function TherapistDashboardPage() {
  if (!isClerkConfigured()) return <ClerkSetupNotice />;

  await requireRole("therapist");
  const settings = getTherapistSettings();

  const modes = [
    isGoogleCalendarConfigured() ? "Google Calendar: live" : "Google Calendar: mock",
    isStripeConfigured() ? "Invoices: Stripe" : "Invoices: mock",
    isResendConfigured() ? "Email: Resend" : "Email: console log",
  ].join(" · ");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-navy">Therapist Dashboard</h1>
          <p className="mt-2 text-sm text-navy/50">
            {settings.displayName} &middot; {settings.practiceName}
          </p>
        </div>
        <Link href="/therapist-settings" className={buttonVariants("outline", "sm")}>
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>

      <div className="mb-8">
        <DemoBanner>{modes}. Add real credentials to .env.local any time to switch a piece over.</DemoBanner>
      </div>

      <TherapistDashboard clients={getClients()} />
    </div>
  );
}
