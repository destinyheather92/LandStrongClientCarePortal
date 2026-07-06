"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-roles";
import { getClient, markInvoicePaid } from "@/lib/store";

export async function payInvoiceAction(formData: FormData) {
  const actor = await requireRole("client");
  const invoiceId = String(formData.get("invoiceId") || "");

  const client = getClient(actor.userId);
  const ownsInvoice = client?.invoices.some((i) => i.id === invoiceId);
  if (!ownsInvoice) return;

  markInvoicePaid(invoiceId);
  revalidatePath("/invoice");
  revalidatePath(`/therapist-dashboard/${actor.userId}`);
}
