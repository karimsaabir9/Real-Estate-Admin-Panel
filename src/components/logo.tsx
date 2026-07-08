import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.65_0.19_300)] text-primary-foreground shadow-lg shadow-primary/30">
        <Building2 className="size-4.5" strokeWidth={2.25} />
      </span>
      {!iconOnly && (
        <span className="text-lg text-foreground">
          Real<span className="text-primary">State</span>
        </span>
      )}
    </div>
  );
}
