import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isClerkConfigured } from "./config";

export type Role = "therapist" | "client";

export interface CurrentActor {
  userId: string;
  email: string;
  firstName: string | null;
  role: Role | null;
}

/**
 * Authoritative role lookup — always reads the live user record via the
 * Clerk Backend API rather than relying on session-token claims, so it
 * works correctly whether or not the Clerk Dashboard's session token has
 * been customized to include `publicMetadata` (see README).
 *
 * Returns null immediately (without touching the Clerk SDK) when Clerk
 * isn't configured yet, since calling `auth()` without clerkMiddleware
 * active throws rather than returning a signed-out state.
 */
export async function getCurrentActor(): Promise<CurrentActor | null> {
  if (!isClerkConfigured()) return null;

  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const role = user?.publicMetadata?.role ?? null;

  return { userId, email, firstName: user?.firstName ?? null, role };
}

/** Redirects unauthenticated/unassigned/wrong-role users; returns the actor otherwise. */
export async function requireRole(required: Role): Promise<CurrentActor> {
  const actor = await getCurrentActor();
  if (!actor) redirect("/sign-in");
  if (!actor.role) redirect("/select-role");
  if (actor.role !== required) {
    redirect(actor.role === "therapist" ? "/therapist-dashboard" : "/client-portal");
  }
  return actor;
}

/**
 * Assigns a role to a user, honoring whatever role they picked on
 * /select-role.
 *
 * DEMO-MODE NOTE: any account can become "therapist" this way. The stricter
 * version of this function only ever granted "therapist" to THERAPIST_EMAIL
 * (see git history / isTherapistEmail in lib/config.ts) — restore that check
 * here before this app is used by real, untrusted users.
 */
export async function assignRole(userId: string, requestedRole: Role): Promise<Role> {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, { publicMetadata: { role: requestedRole } });
  return requestedRole;
}
