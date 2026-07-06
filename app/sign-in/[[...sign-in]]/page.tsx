import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/config";
import { ClerkSetupNotice } from "@/components/auth/clerk-setup-notice";

export const metadata = {
  title: "Sign In — LandStrong Client Care Portal",
};

export default function SignInPage() {
  if (!isClerkConfigured()) return <ClerkSetupNotice />;

  return (
    <div className="flex justify-center px-6 py-16">
      <SignIn fallbackRedirectUrl="/select-role" signUpUrl="/sign-up" />
    </div>
  );
}
