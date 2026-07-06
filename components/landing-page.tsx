import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CallToAction } from "@/components/landing/cta";

export function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <CallToAction />
    </>
  );
}
