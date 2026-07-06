import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export const brandTheme = {
  navy: "#10263f",
  navySoft: "#1c3a5e",
  blue: "#4c86b8",
  mist: "#eaf2f8",
  mistDeep: "#d7e7f3",
  cream: "#fbfdff",
  textMuted: "#5b6b7c",
};

interface EmailLayoutProps {
  previewText: string;
  practiceName: string;
  practicePhone?: string;
  children: React.ReactNode;
}

export function EmailLayout({
  previewText,
  practiceName,
  practicePhone,
  children,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="m-0 bg-[#f6f9fc] p-0 font-sans">
          <Container className="mx-auto my-8 max-w-[520px] overflow-hidden rounded-2xl border border-solid border-[#d7e7f3] bg-white">
            <Section className="bg-[#10263f] px-8 py-6 text-center">
              <table role="presentation" className="mx-auto" cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td
                      className="rounded-full bg-white text-center align-middle"
                      style={{ width: 36, height: 36, borderRadius: 999 }}
                    >
                      <Text className="m-0 text-sm font-bold text-[#10263f]" style={{ lineHeight: "36px" }}>
                        LS
                      </Text>
                    </td>
                    <td className="pl-3 text-left align-middle">
                      <Text className="m-0 text-sm font-semibold text-white">
                        {practiceName}
                      </Text>
                      <Text className="m-0 text-xs text-[#a9c4dd]">Client Care Portal</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section className="px-8 py-8">{children}</Section>

            <Hr className="mx-8 my-0 border-[#eaf2f8]" />

            <Section className="px-8 py-6">
              <Text className="m-0 text-xs leading-relaxed text-[#5b6b7c]">
                {practiceName}
                {practicePhone ? ` · ${practicePhone}` : ""}
              </Text>
              <Text className="m-0 mt-2 text-xs leading-relaxed text-[#9aa8b6]">
                This is an automated message from a demo build of the
                LandStrong Client Care Portal. AI-generated session notes are
                always reviewed and approved by your therapist before they
                become part of your record — this email never contains
                clinical note content.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
