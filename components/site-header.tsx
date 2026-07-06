import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";
import { isClerkConfigured } from "@/lib/config";
import { getCurrentActor } from "@/lib/auth-roles";

const navLinkClass =
  "rounded-full px-4 py-2 text-sm font-medium text-navy/70 transition-colors hover:bg-mist hover:text-navy";

const CLIENT_LINKS = [
  { href: "/client-portal", label: "Client Portal" },
  { href: "/schedule", label: "Schedule" },
  { href: "/invoice", label: "Invoices" },
];

const THERAPIST_LINKS = [
  { href: "/therapist-dashboard", label: "Dashboard" },
  { href: "/therapist-settings", label: "Settings" },
];

export async function SiteHeader() {
  const clerkConfigured = isClerkConfigured();
  const actor = clerkConfigured ? await getCurrentActor() : null;
  const links = actor?.role === "therapist" ? THERAPIST_LINKS : CLIENT_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
            LS
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-navy">
              LandStrong Counseling
            </span>
            <span className="block text-xs text-navy/50">Client Care Portal</span>
          </span>
        </Link>

        {clerkConfigured ? (
          <>
            <Show when="signed-in">
              <nav className="hidden items-center gap-1 md:flex">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className={navLinkClass}>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <UserButton />
            </Show>
            <Show when="signed-out">
              <nav className="flex items-center gap-2">
                <Link href="/sign-in" className={buttonVariants("ghost", "sm")}>
                  Sign In
                </Link>
                <Link href="/sign-up" className={buttonVariants("primary", "sm")}>
                  Sign Up
                </Link>
              </nav>
            </Show>
          </>
        ) : (
          <Link href="/sign-up" className={buttonVariants("primary", "sm")}>
            Sign Up
          </Link>
        )}
      </div>
    </header>
  );
}
