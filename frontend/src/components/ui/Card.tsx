import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Card({ title, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn("bg-[#0d0d1a] border border-[#ffffff08] rounded-xl overflow-hidden", className)}
      {...props}
    >
      {title && (
        <div className="px-5 py-4 border-b border-[#ffffff08]">
          <h3 className="text-[13px] font-semibold text-slate-200 tracking-wide">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-[#ffffff08] flex items-center justify-between gap-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// No default padding — callers supply className="p-5" or omit for full-bleed content.
export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
