import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mist via-cream to-background">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <Image
          src="/CMYK_LS_stacked.png"
          alt="LandStrong"
          width={1703}
          height={916}
          className="mx-auto h-auto w-40 sm:w-48"
          priority
        />

        <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-navy/60 shadow-sm shadow-navy/5">
          <Sparkles className="h-3.5 w-3.5 text-blue" />
          Demo MVP for LandStrong Counseling
        </span>

        <h1 className="mx-auto mt-8 max-w-3xl text-4xl font-semibold text-navy sm:text-5xl">
          A calmer way to run client care.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-navy/60">
          LandStrong&rsquo;s Client Care Portal automates intake, scheduling,
          reminders, and invoicing &mdash; and drafts session notes with AI so
          your therapists can spend less time on admin and more time with
          clients. Every note stays private until a therapist reviews and
          approves it.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/sign-up" className={buttonVariants("primary", "lg")}>
            Get Started as a Client
          </Link>
          <Link href="/sign-in" className={buttonVariants("outline", "lg")}>
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
