import { cn } from "@/utils/cn";

interface BadgeProps {
  label:    string;
  variant?: "default" | "success" | "warning" | "danger" | "blue";
}

const V: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "text-slate-400  bg-white/[0.06]      border-white/[0.08]",
  success: "text-emerald-400 bg-emerald-500/[0.10] border-emerald-500/25",
  warning: "text-amber-400  bg-amber-500/[0.10]   border-amber-500/25",
  danger:  "text-red-400    bg-red-500/[0.10]     border-red-500/25",
  blue:    "text-blue-400   bg-blue-500/[0.10]    border-blue-500/25",
};

export default function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-[3px] rounded-md",
      "text-[10px] font-semibold tracking-[0.06em] uppercase border select-none",
      V[variant],
    )}>
      {label}
    </span>
  );
}
