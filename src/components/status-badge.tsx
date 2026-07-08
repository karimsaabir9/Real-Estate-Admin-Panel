import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  available: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",

  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",

  rented: "bg-primary/10 text-primary border-primary/20",

  sold: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  unpaid: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  inactive: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        STATUS_STYLES[key] ?? "bg-secondary text-secondary-foreground border-border",
      )}
    >
      {status}
    </span>
  );
}
