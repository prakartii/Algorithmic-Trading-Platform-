import { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:   "bg-blue-600 hover:bg-blue-500 text-white border-transparent",
  secondary: "bg-white/[0.06] hover:bg-white/[0.10] text-slate-200 border-white/[0.08]",
  danger:    "bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-500/20",
  ghost:     "bg-transparent hover:bg-white/[0.04] text-slate-400 border-transparent",
};

const SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-[12px]",
  md: "px-4 py-2   text-[13px]",
  lg: "px-5 py-2.5 text-[14px]",
};

export default function Button({
  children,
  variant  = "primary",
  size     = "md",
  loading  = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold border",
        "transition-all duration-150 select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          Loading…
        </>
      ) : (
        children
      )}
    </button>
  );
}
