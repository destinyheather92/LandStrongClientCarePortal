import Link from "next/link";
import { requireRole } from "@/lib/auth-roles";
import { isClerkConfigured } from "@/lib/config";
import { getClient } from "@/lib/store";
import { getTherapistSettings } from "@/lib/therapist-settings";
import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";
import { SlotPicker } from "@/components/schedule/slot-picker";
import { Card, CardBody } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Schedule a Session — LandStrong Client Care Portal",
};

export default async function SchedulePage() {
  if (!isClerkConfigured()) return <ClerkSetupNotice />;

  const actor = await requireRole("client");
  const client = getClient(actor.userId);
  const settings = getTherapistSettings();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-navy">Schedule your session</h1>
        <p className="mt-3 text-navy/60">
          Pick a time that works for you with {settings.displayName}.
        </p>
      </div>

      {client ? (
        <SlotPicker settings={settings} />
      ) : (
        <Card>
          <CardBody className="space-y-4 text-center">
            <p className="text-sm text-navy/70">
              Please complete your intake before booking a session.
            </p>
            <Link href="/intake" className={buttonVariants("primary", "md")}>
              Complete Intake
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
