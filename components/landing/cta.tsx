import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="rounded-3xl bg-navy px-8 py-16 text-center sm:px-16">
        <h2 className="text-3xl font-semibold text-white">
          Ready to see it in action?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-navy-soft text-white/70">
          Sign up as a client to walk through intake and booking, or sign in
          as the therapist to see the AI note generator for yourself.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/sign-up" className={buttonVariants("secondary", "lg")}>
            Sign Up as a Client
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
