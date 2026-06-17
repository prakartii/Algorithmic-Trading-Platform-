import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Card({ title, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#0e0e15] border border-white/[0.07] rounded-xl overflow-hidden",
        "transition-colors duration-150 hover:border-white/[0.10]",
        className,
      )}
      {...props}
    >
      {title && (
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-[14px] font-semibold text-slate-200">{title}</h3>
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
        "px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}
