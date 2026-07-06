import {
  BellRing,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  Sparkles,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Digital client intake",
    description:
      "A calm, guided onboarding form captures contact details, insurance, and reason for visit before the first session.",
  },
  {
    icon: CalendarClock,
    title: "Smart scheduling",
    description:
      "Clients pick a therapist, session type, and time slot that books straight to Google Calendar with a Meet link.",
  },
  {
    icon: BellRing,
    title: "Automated reminders",
    description:
      "Confirmation, 24-hour, and 2-hour reminders are scheduled automatically so sessions don't get missed.",
  },
  {
    icon: Receipt,
    title: "Invoicing & payment status",
    description:
      "Every booking generates an invoice with clear paid, unpaid, and overdue status &mdash; ready for Stripe.",
  },
  {
    icon: Sparkles,
    title: "AI-drafted session notes",
    description:
      "Paste a transcript or shorthand notes and get a structured DAP draft. Never sent anywhere without review.",
  },
  {
    icon: LayoutDashboard,
    title: "Therapist dashboard",
    description:
      "One place to see every client's intake, appointments, invoice status, and note approval state.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold text-navy">
          Everything around the session, handled.
        </h2>
        <p className="mt-3 text-navy/60">
          Built for LandStrong Counseling to remove admin friction without
          removing the therapist from the loop.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardBody>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mist text-blue">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-navy">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy/60">
                {feature.description}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
