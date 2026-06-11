import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  positive?: boolean;
  neutral?: boolean;
}

export default function StatCard({ label, value, subValue, positive, neutral }: StatCardProps) {
  const color =
    neutral || positive === undefined
      ? "text-slate-100"
      : positive
      ? "text-emerald-400"
      : "text-red-400";

  return (
    <div className="bg-[#0d0d1a] border border-[#ffffff08] rounded-xl p-5">
      <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-500 select-none">
        {label}
      </p>
      <p className={cn("text-2xl font-bold mt-2 leading-tight tabular-nums", color)}>{value}</p>
      {subValue && (
        <p className="text-[12px] text-slate-500 mt-1">{subValue}</p>
      )}
    </div>
  );
}
