import { cn } from "@/utils/cn";

interface BadgeProps {
  label:    string;
  variant?: "default" | "success" | "warning" | "danger" | "blue";
}

const V: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "text-slate-400  bg-slate-800/60    border-slate-700/40",
  success: "text-emerald-400 bg-emerald-500/8  border-emerald-500/20",
  warning: "text-amber-400  bg-amber-500/8     border-amber-500/20",
  danger:  "text-red-400    bg-red-500/8       border-red-500/20",
  blue:    "text-blue-400   bg-blue-500/8      border-blue-500/20",
};

export default function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border select-none",
      V[variant],
    )}>
      {label}
    </span>
  );
}
