"use server";

import { revalidatePath } from "next/cache";
import { approveDraftNote, discardDraftNote, markInvoicePaid, updateDraftNoteText } from "@/lib/store";
import { requireRole } from "@/lib/auth-roles";

export async function markInvoicePaidAction(formData: FormData) {
  await requireRole("therapist");
  const invoiceId = String(formData.get("invoiceId") || "");
  const clientId = String(formData.get("clientId") || "");
  markInvoicePaid(invoiceId);
  revalidatePath(`/therapist-dashboard/${clientId}`);
}

export async function approveDraftNoteAction(formData: FormData) {
  await requireRole("therapist");
  const clientId = String(formData.get("clientId") || "");
  const aiDraft = String(formData.get("aiDraft") || "");
  updateDraftNoteText(clientId, aiDraft);
  approveDraftNote(clientId, "Therapist (demo reviewer)");
  revalidatePath(`/therapist-dashboard/${clientId}`);
}

export async function discardDraftNoteAction(formData: FormData) {
  await requireRole("therapist");
  const clientId = String(formData.get("clientId") || "");
  discardDraftNote(clientId);
  revalidatePath(`/therapist-dashboard/${clientId}`);
}
