import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  trend,
  trendLabel,
  trendUp = true,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: string;
  trendLabel?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-5 transition-shadow hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            iconClassName,
          )}
        >
          <Icon className="size-5" strokeWidth={2.2} />
        </span>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium",
              trendUp ? "text-emerald-600" : "text-red-500",
            )}
          >
            {trendUp ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {trend}
          </span>
          <span className="text-muted-foreground">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
