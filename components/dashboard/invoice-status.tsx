"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markInvoicePaidAction } from "@/app/therapist-dashboard/[clientId]/actions";
import { Invoice } from "@/lib/types";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatCurrency, formatDateLong, formatDateTime } from "@/lib/utils";

function statusTone(status: Invoice["status"]) {
  if (status === "paid") return "success" as const;
  if (status === "overdue") return "danger" as const;
  return "warning" as const;
}

export function InvoiceStatus({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendReminder() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/send-reminder-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "invoice", invoiceId: invoice.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't send the reminder.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the reminder.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div className="flex items-center justify-between">
          <CardTitle>Invoice &amp; Payment</CardTitle>
          <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-navy/40">Amount</p>
            <p className="mt-1 text-lg font-semibold text-navy">
              {formatCurrency(invoice.amount)}
            </p>
          </div>
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
          {invoice.reminderSentAt && (
            <div>
              <p className="text-xs uppercase tracking-wide text-navy/40">
                Payment reminder sent
              </p>
              <p className="mt-1 text-sm font-medium text-navy">
                {formatDateTime(invoice.reminderSentAt)}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-navy/40">
            {invoice.isMockInvoice
              ? "Mock invoice — wired for a real Stripe integration when STRIPE_SECRET_KEY is set."
              : "Real Stripe invoice."}
          </p>
          {invoice.stripeInvoiceUrl && (
            <a
              href={invoice.stripeInvoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants("ghost", "sm")}
            >
              View on Stripe
            </a>
          )}
        </div>

        {error && (
          <p className="rounded-xl bg-danger-bg px-4 py-2.5 text-sm text-danger">{error}</p>
        )}

        {invoice.status !== "paid" && (
          <div className="flex flex-wrap gap-3 border-t border-navy/10 pt-4">
            <form action={markInvoicePaidAction}>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <input type="hidden" name="clientId" value={invoice.clientId} />
              <Button type="submit" size="sm">
                Mark as Paid
              </Button>
            </form>
            <Button type="button" size="sm" variant="outline" disabled={sending} onClick={sendReminder}>
              {sending ? "Sending…" : "Send Payment Reminder"}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
