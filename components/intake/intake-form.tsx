"use client";

import { useActionState } from "react";
import { submitIntakeAction, IntakeFormState } from "@/app/intake/actions";
import { ClientIntake } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Label, Textarea } from "@/components/ui/field";

const initialState: IntakeFormState = {};

export function IntakeForm({ existing }: { existing?: ClientIntake }) {
  const [state, formAction, pending] = useActionState(
    submitIntakeAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-base font-semibold text-navy">Your information</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                autoComplete="name"
                defaultValue={existing?.fullName}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                defaultValue={existing?.dateOfBirth}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={existing?.email}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                defaultValue={existing?.phone}
              />
            </FieldGroup>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-base font-semibold text-navy">Care preferences</h2>

          <FieldGroup>
            <Label htmlFor="reasonForVisit">Reason for visit</Label>
            <Textarea
              id="reasonForVisit"
              name="reasonForVisit"
              rows={4}
              required
              placeholder="Briefly share what brings you to therapy right now."
              defaultValue={existing?.reasonForVisit}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="insuranceProvider">
              Insurance provider <span className="text-navy/40">(optional)</span>
            </Label>
            <Input
              id="insuranceProvider"
              name="insuranceProvider"
              placeholder="e.g. Aetna, Self-pay"
              defaultValue={existing?.insuranceProvider}
            />
          </FieldGroup>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-base font-semibold text-navy">Emergency contact</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="emergencyContactName">Contact name</Label>
              <Input
                id="emergencyContactName"
                name="emergencyContactName"
                required
                defaultValue={existing?.emergencyContactName}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="emergencyContactPhone">Contact phone</Label>
              <Input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                type="tel"
                required
                defaultValue={existing?.emergencyContactPhone}
              />
            </FieldGroup>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <label className="flex items-start gap-3 text-sm text-navy/70">
            <input
              type="checkbox"
              name="consentAcknowledged"
              required
              defaultChecked={existing?.consentAcknowledged}
              className="mt-0.5 h-4 w-4 rounded border-navy/30 text-blue focus:ring-blue/30"
            />
            <span>
              I understand this is a demo intake form for a therapy practice
              and consent to being contacted about scheduling. This is not a
              real medical record and no sensitive personal information should
              be submitted here.
            </span>
          </label>

          {state?.error && (
            <p className="rounded-xl bg-danger-bg px-4 py-2.5 text-sm text-danger">
              {state.error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Submitting…" : existing ? "Save Changes" : "Continue to Scheduling"}
          </Button>
        </CardBody>
      </Card>
    </form>
  );
}
