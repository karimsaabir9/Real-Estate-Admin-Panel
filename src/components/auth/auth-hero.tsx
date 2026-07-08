import { Logo } from "@/components/logo";

export function AuthHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[oklch(0.5_0.2_275)] to-[oklch(0.42_0.18_290)] p-10 text-primary-foreground lg:flex">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Logo iconOnly={false} className="text-white [&_span]:text-white" />
      </div>

      <div className="relative z-10 space-y-4">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight">
          {title}
        </h2>
        <p className="max-w-sm text-sm text-white/75">{subtitle}</p>
      </div>

      <svg
        viewBox="0 0 400 180"
        fill="none"
        className="relative z-10 h-40 w-full text-white/90"
        preserveAspectRatio="xMidYMax slice"
      >
        <rect x="10" y="70" width="40" height="100" rx="4" fill="currentColor" opacity="0.15" />
        <rect x="60" y="40" width="50" height="130" rx="4" fill="currentColor" opacity="0.22" />
        <rect x="120" y="90" width="35" height="80" rx="4" fill="currentColor" opacity="0.15" />
        <rect x="165" y="20" width="55" height="150" rx="4" fill="currentColor" opacity="0.3" />
        <rect x="230" y="60" width="40" height="110" rx="4" fill="currentColor" opacity="0.18" />
        <rect x="280" y="35" width="50" height="135" rx="4" fill="currentColor" opacity="0.25" />
        <rect x="340" y="80" width="45" height="90" rx="4" fill="currentColor" opacity="0.15" />
        {Array.from({ length: 24 }).map((_, i) => (
          <rect
            key={i}
            x={170 + (i % 4) * 11}
            y={30 + Math.floor(i / 4) * 20}
            width="6"
            height="10"
            rx="1"
            fill="white"
            opacity="0.5"
          />
        ))}
      </svg>
    </div>
  );
}
