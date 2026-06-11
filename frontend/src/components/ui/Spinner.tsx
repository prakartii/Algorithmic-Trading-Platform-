import { cn } from "@/utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "w-4 h-4 border-[1.5px]",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
};

export default function Spinner({ size = "md" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "rounded-full border-slate-700 border-t-blue-400 animate-spin shrink-0",
        SIZES[size],
      )}
    />
  );
}
