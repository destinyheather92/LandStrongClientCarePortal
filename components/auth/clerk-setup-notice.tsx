import { Card, CardBody, CardTitle } from "@/components/ui/card";

export function ClerkSetupNotice() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <Card>
        <CardBody className="space-y-3">
          <CardTitle>Clerk isn&rsquo;t configured yet</CardTitle>
          <p className="text-sm leading-relaxed text-navy/70">
            This page needs Clerk authentication. Add real{" "}
            <code className="rounded bg-mist px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
            </code>{" "}
            and{" "}
            <code className="rounded bg-mist px-1.5 py-0.5 text-xs">
              CLERK_SECRET_KEY
            </code>{" "}
            values to <code className="rounded bg-mist px-1.5 py-0.5 text-xs">.env.local</code>{" "}
            (see the README for exact setup steps), then restart the dev server.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
