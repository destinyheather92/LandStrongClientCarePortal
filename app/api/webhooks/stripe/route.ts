import { NextResponse } from "next/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { getInvoiceByStripeId, markInvoicePaid } from "@/lib/store";

/**
 * Syncs real Stripe payment status back into the local store. Only relevant
 * when STRIPE_SECRET_KEY is configured (lib/stripe-invoices.ts creates real
 * invoices in that case) — mock invoices are marked paid directly from the
 * UI instead, since there's no real payment event to listen for.
 *
 * Local testing: forward events with the Stripe CLI —
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * It prints a `whsec_...` value the first time you run it; put that in
 * STRIPE_WEBHOOK_SECRET. In production, create the webhook endpoint in the
 * Stripe Dashboard instead and use the signing secret it gives you.
 */

const TOLERANCE_SECONDS = 300;

function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > TOLERANCE_SECONDS) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signatureHeader = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 503 }
    );
  }

  if (!signatureHeader || !verifyStripeSignature(rawBody, signatureHeader, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
    const stripeInvoiceId: string | undefined = event.data?.object?.id;
    const invoice = stripeInvoiceId ? getInvoiceByStripeId(stripeInvoiceId) : undefined;

    if (invoice) {
      markInvoicePaid(invoice.id);
      revalidatePath(`/therapist-dashboard/${invoice.clientId}`);
      revalidatePath("/invoice");
    }
  }

  return NextResponse.json({ received: true });
}
