import { Logo } from "@/components/logo";
import { AuthHero } from "@/components/auth/auth-hero";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
      <AuthHero
        title="Join the platform trusted by modern realty teams"
        subtitle="Create your account and start managing properties, deals and tenants in minutes."
      />

      <div className="glass-strong flex w-full flex-col justify-center rounded-3xl p-8 sm:p-10">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Sign Up for an Account</h1>
        <p className="mt-1 mb-8 text-sm text-muted-foreground">
          Create your admin account to get started
        </p>

        <SignUpForm />
      </div>
    </div>
  );
}
