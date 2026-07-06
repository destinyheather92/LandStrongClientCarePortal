"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, UserRound } from "lucide-react";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import type { Role } from "@/lib/auth-roles";

export function SelectRoleClient({ email }: { email: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function chooseRole(role: Role) {
    setPending(role);
    setError(null);
    try {
      const res = await fetch("/api/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      router.push(role === "therapist" ? "/therapist-dashboard" : "/client-portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(null);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Card>
        <CardBody className="space-y-6 text-center">
          <div>
            <CardTitle>Welcome to LandStrong</CardTitle>
            <p className="mt-2 text-sm text-navy/60">
              You&rsquo;re signed in as <span className="font-medium">{email}</span>.
              How would you like to continue?
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-danger-bg px-4 py-2.5 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => chooseRole("client")}
              disabled={pending !== null}
              className="flex flex-col items-center gap-3 rounded-2xl border border-navy/15 p-6 text-center transition-colors hover:border-blue hover:bg-mist/60 disabled:opacity-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-blue">
                <UserRound className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-navy">
                {pending === "client" ? "Setting up…" : "I'm a Client"}
              </span>
              <span className="text-xs text-navy/50">
                Complete intake, book sessions, view invoices
              </span>
            </button>

            <button
              type="button"
              onClick={() => chooseRole("therapist")}
              disabled={pending !== null}
              className="flex flex-col items-center gap-3 rounded-2xl border border-navy/15 p-6 text-center transition-colors hover:border-blue hover:bg-mist/60 disabled:opacity-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-blue">
                <Stethoscope className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-navy">
                {pending === "therapist" ? "Setting up…" : "I'm a Therapist"}
              </span>
              <span className="text-xs text-navy/50">
                Manage clients, settings, and AI note drafts
              </span>
            </button>
          </div>

          <p className="text-xs text-navy/40">
            Demo mode — either role is available to any account for testing.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
