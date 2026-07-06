import { redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/auth-roles";
import { isClerkConfigured } from "@/lib/config";
import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";
import { SelectRoleClient } from "@/components/auth/select-role-client";

export const metadata = {
  title: "Select Role — LandStrong Client Care Portal",
};

export default async function SelectRolePage() {
  if (!isClerkConfigured()) return <ClerkSetupNotice />;

  const actor = await getCurrentActor();
  if (!actor) redirect("/sign-in");

  if (actor.role === "therapist") redirect("/therapist-dashboard");
  if (actor.role === "client") redirect("/client-portal");

  return <SelectRoleClient email={actor.email} />;
}
