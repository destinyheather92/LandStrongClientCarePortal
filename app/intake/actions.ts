"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClientIntake } from "@/lib/store";
import { requireRole } from "@/lib/auth-roles";

const IntakeSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(7, "Enter a valid phone number."),
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  reasonForVisit: z
    .string()
    .min(5, "Please share a brief reason for your visit."),
  insuranceProvider: z.string().optional(),
  emergencyContactName: z.string().min(2, "Emergency contact name is required."),
  emergencyContactPhone: z
    .string()
    .min(7, "Emergency contact phone is required."),
  consentAcknowledged: z
    .string()
    .optional()
    .refine((v) => v === "on", {
      message: "Please acknowledge the consent statement to continue.",
    }),
});

export interface IntakeFormState {
  error?: string;
}

export async function submitIntakeAction(
  _prevState: IntakeFormState,
  formData: FormData
): Promise<IntakeFormState> {
  const actor = await requireRole("client");

  const parsed = IntakeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  createClientIntake({
    id: actor.userId,
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    dateOfBirth: parsed.data.dateOfBirth,
    reasonForVisit: parsed.data.reasonForVisit,
    insuranceProvider: parsed.data.insuranceProvider || undefined,
    emergencyContactName: parsed.data.emergencyContactName,
    emergencyContactPhone: parsed.data.emergencyContactPhone,
    consentAcknowledged: true,
  });

  redirect("/client-portal");
}
