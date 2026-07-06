import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/layout";

export interface AppointmentReminderEmailProps {
  clientName: string;
  therapistName: string;
  practiceName: string;
  practicePhone?: string;
  appointmentDate: string;
  meetLink: string;
  hoursBefore?: number;
}

export default function AppointmentReminderEmail({
  clientName,
  therapistName,
  practiceName,
  practicePhone,
  appointmentDate,
  meetLink,
  hoursBefore = 24,
}: AppointmentReminderEmailProps) {
  const timingLabel =
    hoursBefore >= 24
      ? `in about ${Math.round(hoursBefore / 24)} day${hoursBefore >= 48 ? "s" : ""}`
      : `in about ${hoursBefore} hour${hoursBefore === 1 ? "" : "s"}`;

  return (
    <EmailLayout
      previewText={`Reminder: your session with ${therapistName} is ${timingLabel}`}
      practiceName={practiceName}
      practicePhone={practicePhone}
    >
      <Heading className="m-0 text-xl font-semibold text-[#10263f]">
        See you soon, {clientName.split(" ")[0]}
      </Heading>
      <Text className="mt-3 text-sm leading-relaxed text-[#5b6b7c]">
        This is a friendly reminder that your session with {therapistName} is{" "}
        {timingLabel}.
      </Text>

      <Section className="mt-5 rounded-xl bg-[#eaf2f8] px-5 py-4">
        <Text className="m-0 text-xs uppercase tracking-wide text-[#5b6b7c]">
          Date &amp; time
        </Text>
        <Text className="m-0 mt-1 text-sm font-semibold text-[#10263f]">
          {appointmentDate}
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
    </EmailLayout>
  );
}
