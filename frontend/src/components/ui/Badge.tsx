import { cn } from "@/utils/cn";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const VARIANTS: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-800 text-slate-300 border-slate-700/50",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  warning: "bg-amber-500/10  text-amber-400  border-amber-500/25",
  danger:  "bg-red-500/10    text-red-400    border-red-500/25",
};

export default function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border select-none",
        VARIANTS[variant],
      )}
    >
      {label}
    </span>
  );
}
