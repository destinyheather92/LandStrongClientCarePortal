import { ClientIntake } from "@/lib/types";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { formatDateShort } from "@/lib/utils";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-navy/40">{label}</p>
      <p className="mt-1 text-sm font-medium text-navy">{value}</p>
    </div>
  );
}

export function IntakeSummary({ intake }: { intake: ClientIntake }) {
  return (
    <Card>
      <CardBody className="space-y-5">
        <CardTitle>Client Intake</CardTitle>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={intake.fullName} />
          <Field label="Date of birth" value={formatDateShort(intake.dateOfBirth)} />
          <Field label="Email" value={intake.email} />
          <Field label="Phone" value={intake.phone} />
          <Field label="Insurance" value={intake.insuranceProvider || "Self-pay"} />
          <Field label="Emergency contact" value={intake.emergencyContactName} />
          <Field label="Emergency contact phone" value={intake.emergencyContactPhone} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-navy/40">
            Reason for visit
          </p>
          <p className="mt-1 text-sm leading-relaxed text-navy/80">
            {intake.reasonForVisit}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
