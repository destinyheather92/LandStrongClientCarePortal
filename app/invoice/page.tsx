import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth-roles";
import { isClerkConfigured } from "@/lib/config";
import { getClient } from "@/lib/store";
import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatCurrency, formatDateLong, formatDateTime } from "@/lib/utils";
import { payInvoiceAction } from "./actions";

export const metadata = {
  title: "Invoices — LandStrong Client Care Portal",
};

function statusTone(status: string) {
  if (status === "paid") return "success" as const;
  if (status === "overdue") return "danger" as const;
  return "warning" as const;
}

export default async function InvoicePage() {
  if (!isClerkConfigured()) return <ClerkSetupNotice />;

  const actor = await requireRole("client");
  const client = getClient(actor.userId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/client-portal"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-navy/60 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to portal
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-navy">Invoices</h1>
        <p className="mt-3 text-navy/60">Every invoice for your sessions.</p>
      </div>

      {!client || client.invoices.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-navy/50">
              No invoices yet — they&rsquo;re created automatically after you
              book a session.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-5">
          {client.invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle>{formatCurrency(invoice.amount)}</CardTitle>
                  <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-navy/40">Due date</p>
                    <p className="mt-1 text-sm font-medium text-navy">
                      {formatDateLong(invoice.dueDate)}
                    </p>
                  </div>
                  {invoice.paidAt && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-navy/40">Paid on</p>
                      <p className="mt-1 text-sm font-medium text-navy">
                        {formatDateTime(invoice.paidAt)}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-navy/40">
                  {invoice.isMockInvoice
                    ? "Mock invoice for this demo."
                    : "Processed via Stripe."}
                </p>

                {invoice.status !== "paid" && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-navy/10 pt-4">
                    {invoice.stripeInvoiceUrl ? (
                      <>
                        <a
                          href={invoice.stripeInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants("primary", "sm")}
                        >
                          Pay Now
                        </a>
                        <span className="text-xs text-navy/40">
                          Opens Stripe&rsquo;s secure checkout — status updates here
                          automatically once paid.
                        </span>
                      </>
                    ) : (
                      <form action={payInvoiceAction}>
                        <input type="hidden" name="invoiceId" value={invoice.id} />
                        <Button type="submit" size="sm">
                          Mark as Paid (Demo)
                        </Button>
                      </form>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
