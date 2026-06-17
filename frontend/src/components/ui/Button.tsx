import { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?:    "sm" | "md" | "lg";
  loading?: boolean;
}

const V: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:   "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white border-transparent shadow-sm",
  secondary: "bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border-white/[0.08] hover:border-white/[0.14]",
  danger:    "bg-red-500/[0.10] hover:bg-red-500/[0.16] text-red-400 border-red-500/25",
  ghost:     "bg-transparent hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 border-transparent",
};

const S: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-[12px] h-7",
  md: "px-3.5 py-2 text-[13px] h-8",
  lg: "px-4 py-2.5 text-[13px] h-9",
};

export default function Button({
  children, variant = "primary", size = "md", loading = false,
  disabled, className, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold border",
        "transition-all duration-100 select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        V[variant], S[size], className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3 h-3 border-[1.5px] border-current border-t-transparent rounded-full animate-spin shrink-0" />
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
}
