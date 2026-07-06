import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/layout";

export interface AppointmentConfirmationEmailProps {
  clientName: string;
  therapistName: string;
  practiceName: string;
  practicePhone?: string;
  appointmentDate: string;
  meetLink: string;
  invoiceLink?: string;
}

export default function AppointmentConfirmationEmail({
  clientName,
  therapistName,
  practiceName,
  practicePhone,
  appointmentDate,
  meetLink,
  invoiceLink,
}: AppointmentConfirmationEmailProps) {
  return (
    <EmailLayout
      previewText={`Your session with ${therapistName} is confirmed for ${appointmentDate}`}
      practiceName={practiceName}
      practicePhone={practicePhone}
    >
      <Heading className="m-0 text-xl font-semibold text-[#10263f]">
        You&rsquo;re booked, {clientName.split(" ")[0]}
      </Heading>
      <Text className="mt-3 text-sm leading-relaxed text-[#5b6b7c]">
        Your session with {therapistName} has been confirmed. Here are the
        details:
      </Text>

      <Section className="mt-5 rounded-xl bg-[#eaf2f8] px-5 py-4">
        <Text className="m-0 text-xs uppercase tracking-wide text-[#5b6b7c]">
          Date &amp; time
        </Text>
        <Text className="m-0 mt-1 text-sm font-semibold text-[#10263f]">
          {appointmentDate}
        </Text>
        <Text className="m-0 mt-4 text-xs uppercase tracking-wide text-[#5b6b7c]">
          Therapist
        </Text>
        <Text className="m-0 mt-1 text-sm font-semibold text-[#10263f]">
          {therapistName}
        </Text>
      </Section>

      <Section className="mt-6 text-center">
        <Button
          href={meetLink}
          className="rounded-full bg-[#10263f] px-6 py-3 text-sm font-semibold text-white"
        >
          Join via Google Meet
        </Button>
      </Section>
      <Text className="mt-3 text-center text-xs text-[#9aa8b6]">
        {meetLink}
      </Text>

      {invoiceLink && (
        <>
          <Hr className="my-6 border-[#eaf2f8]" />
          <Text className="m-0 text-sm text-[#5b6b7c]">
            An invoice for this session is ready to view.{" "}
            <a href={invoiceLink} className="font-medium text-[#4c86b8]">
              View invoice
            </a>
          </Text>
        </>
      )}
    </EmailLayout>
  );
}
