import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

// ── Card ─────────────────────────────────────────────────────────────────────

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Card({ title, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#0d0d1a] border border-[#ffffff08] rounded-xl overflow-hidden",
        "transition-colors duration-150 hover:border-[#ffffff0d]",
        className,
      )}
      {...props}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-[#ffffff07]">
          <h3 className="text-[13px] font-semibold text-slate-200">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

// ── CardHeader ────────────────────────────────────────────────────────────────

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-5 py-3.5 border-b border-[#ffffff07] flex items-center justify-between gap-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── CardBody ──────────────────────────────────────────────────────────────────

export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}
