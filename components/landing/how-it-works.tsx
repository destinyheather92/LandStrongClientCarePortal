const STEPS = [
  {
    step: "01",
    title: "Client completes intake",
    description:
      "A short, guided form collects contact info, insurance, and reason for visit.",
  },
  {
    step: "02",
    title: "Client books a session",
    description:
      "A time slot is confirmed and a Google Calendar event with a Meet link is created automatically.",
  },
  {
    step: "03",
    title: "Reminders & invoice go out",
    description:
      "Email and text reminders are scheduled, and an invoice is generated for the session.",
  },
  {
    step: "04",
    title: "Therapist reviews & approves",
    description:
      "After the session, the therapist pastes notes, reviews the AI draft, and approves it into the record.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-mist/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-navy">How it flows</h2>
          <p className="mt-3 text-navy/60">
            From first contact to a reviewed clinical note, in four steps.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <div key={item.step}>
              <span className="text-sm font-semibold text-blue">
                {item.step}
              </span>
              <h3 className="mt-2 text-base font-semibold text-navy">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy/60">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
