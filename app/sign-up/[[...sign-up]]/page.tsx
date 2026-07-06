import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/config";
import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";

export const metadata = {
  title: "Sign Up — LandStrong Client Care Portal",
};

export default function SignUpPage() {
  if (!isClerkConfigured()) return <ClerkSetupNotice />;

  return (
    <div className="flex justify-center px-6 py-16">
      <SignUp fallbackRedirectUrl="/select-role" signInUrl="/sign-in" />
    </div>
  );
}
