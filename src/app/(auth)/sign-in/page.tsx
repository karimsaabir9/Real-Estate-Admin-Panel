import { Logo } from "@/components/logo";
import { AuthHero } from "@/components/auth/auth-hero";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
      <AuthHero
        title="Manage your real estate portfolio with ease"
        subtitle="Track properties, owners, tenants and deals from a single, elegant dashboard built for modern agencies."
      />

      <div className="glass-strong flex w-full flex-col justify-center rounded-3xl p-8 sm:p-10">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 mb-8 text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>

        <SignInForm />
      </div>
    </div>
  );
}
