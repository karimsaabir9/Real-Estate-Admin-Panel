export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-app-gradient" />
      <div className="pointer-events-none absolute -top-40 -left-40 -z-10 size-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 -z-10 size-96 rounded-full bg-[oklch(0.65_0.19_300)]/20 blur-3xl" />
      {children}
    </div>
  );
}
