import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/layout";

export interface InvoiceEmailProps {
  clientName: string;
  therapistName: string;
  practiceName: string;
  practicePhone?: string;
  appointmentDate: string;
  amountLabel: string;
  dueDateLabel: string;
  invoiceLink?: string;
}

export default function InvoiceEmail({
  clientName,
  therapistName,
  practiceName,
  practicePhone,
  appointmentDate,
  amountLabel,
  dueDateLabel,
  invoiceLink,
}: InvoiceEmailProps) {
  return (
    <EmailLayout
      previewText={`Invoice from ${practiceName} — ${amountLabel} due ${dueDateLabel}`}
      practiceName={practiceName}
      practicePhone={practicePhone}
    >
      <Heading className="m-0 text-xl font-semibold text-[#10263f]">
        Invoice for your session
      </Heading>
      <Text className="mt-3 text-sm leading-relaxed text-[#5b6b7c]">
        Hi {clientName.split(" ")[0]}, here&rsquo;s the invoice for your
        session with {therapistName} on {appointmentDate}.
      </Text>

      <Section className="mt-5 rounded-xl bg-[#eaf2f8] px-5 py-4">
        <Text className="m-0 text-xs uppercase tracking-wide text-[#5b6b7c]">
          Amount due
        </Text>
        <Text className="m-0 mt-1 text-lg font-semibold text-[#10263f]">
          {amountLabel}
        </Text>
        <Text className="m-0 mt-4 text-xs uppercase tracking-wide text-[#5b6b7c]">
          Due date
        </Text>
        <Text className="m-0 mt-1 text-sm font-semibold text-[#10263f]">
          {dueDateLabel}
        </Text>
      </Section>

      {invoiceLink && (
        <Section className="mt-6 text-center">
          <Button
            href={invoiceLink}
            className="rounded-full bg-[#10263f] px-6 py-3 text-sm font-semibold text-white"
          >
            View &amp; Pay Invoice
          </Button>
        </Section>
      )}

      <Text className="mt-6 text-xs text-[#9aa8b6]">
        This is a mock invoice for demo purposes unless a real Stripe
        integration has been configured.
      </Text>
    </EmailLayout>
  );
}
