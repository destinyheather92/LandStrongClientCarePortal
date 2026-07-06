import { isStripeConfigured } from "./config";
import { Invoice, InvoiceStatus } from "./types";

/**
 * Invoice creation. Real credentials go in .env.local:
 *   STRIPE_SECRET_KEY — a restricted or standard secret key from
 *   https://dashboard.stripe.com/apikeys (test mode is fine for a demo).
 *
 * Uses the plain Stripe REST API via fetch (no `stripe` npm package) since
 * this app only ever needs a handful of endpoints.
 */

export interface InvoiceCreationParams {
  clientEmail: string;
  clientName: string;
  amountCents: number;
  dueDate: string; // ISO date, "YYYY-MM-DD"
  description: string;
}

export interface InvoiceCreationResult {
  isMock: boolean;
  stripeInvoiceId?: string;
  stripeInvoiceUrl?: string;
}

export async function createMockInvoice(): Promise<InvoiceCreationResult> {
  return { isMock: true };
}

function daysUntil(dueDateISO: string): number {
  const due = new Date(`${dueDateISO}T00:00:00Z`).getTime();
  const now = Date.now();
  return Math.max(1, Math.ceil((due - now) / (1000 * 60 * 60 * 24)));
}

async function stripeRequest(path: string, body: Record<string, string>) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Stripe request to ${path} failed (${res.status}): ${errorBody}`);
  }

  return res.json();
}

export async function createStripeInvoiceIfConfigured(
  params: InvoiceCreationParams
): Promise<InvoiceCreationResult> {
  if (!isStripeConfigured()) return createMockInvoice();

  try {
    const customer = await stripeRequest("customers", {
      email: params.clientEmail,
      name: params.clientName,
    });

    await stripeRequest("invoiceitems", {
      customer: customer.id,
      amount: String(params.amountCents),
      currency: "usd",
      description: params.description,
    });

    const invoice = await stripeRequest("invoices", {
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: String(daysUntil(params.dueDate)),
      // Defaults to "exclude" as of a recent Stripe API version, which would
      // silently create an empty $0 invoice — the invoice item above would
      // never attach without this.
      pending_invoice_items_behavior: "include",
    });

    const finalized = await stripeRequest(`invoices/${invoice.id}/finalize`, {});

    return {
      isMock: false,
      stripeInvoiceId: finalized.id,
      stripeInvoiceUrl: finalized.hosted_invoice_url,
    };
  } catch (err) {
    // A Stripe hiccup shouldn't block booking during a demo — fall back to mock.
    console.error("[stripe-invoices] falling back to mock invoice:", err);
    return createMockInvoice();
  }
}

/** Recomputes "overdue" from the due date rather than trusting a stale flag. */
export function getInvoiceStatus(invoice: Pick<Invoice, "status" | "dueDate">): InvoiceStatus {
  if (invoice.status === "paid") return "paid";
  const isPastDue = new Date(`${invoice.dueDate}T23:59:59`) < new Date();
  return isPastDue ? "overdue" : "unpaid";
}
