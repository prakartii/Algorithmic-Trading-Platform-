import { cn } from "@/utils/cn";

function TrendUp() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 9 4.5 5.5 7 8 11 3" />
    </svg>
  );
}

function TrendDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 3 4.5 6.5 7 4 11 9" />
    </svg>
  );
}

interface StatCardProps {
  label:        string;
  value:        string | number;
  change?:      string;
  changeLabel?: string;
  positive?:    boolean;
  loading?:     boolean;
  className?:   string;
}

export default function StatCard({
  label, value, change, changeLabel, positive,
  loading = false, className,
}: StatCardProps) {
  const isNeutral   = positive === undefined;
  const valueColor  = isNeutral ? "text-slate-50"    : positive ? "text-emerald-400" : "text-red-400";
  const changeColor = positive ? "text-emerald-400" : "text-red-400";

  return (
    <div className={cn(
      "relative bg-[#0f1012] border border-white/[0.06] rounded-lg p-4",
      "shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]",
      "transition-colors duration-150 hover:border-white/[0.09]",
      className,
    )}>
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-2.5 w-20 bg-white/[0.06] rounded" />
          <div className="h-8 w-28 bg-white/[0.06] rounded" />
          <div className="h-2.5 w-16 bg-white/[0.06] rounded" />
        </div>
      ) : (
        <>
          <p className="text-[12px] font-medium text-slate-500 select-none mb-2.5 leading-none">
            {label}
          </p>

          <p className={cn(
            "text-[24px] font-semibold leading-none tracking-[-0.02em] font-tabular",
            valueColor,
          )}>
            {value}
          </p>

          {(change || changeLabel) && (
            <div className={cn(
              "flex items-center gap-1.5 mt-2.5",
              isNeutral ? "text-slate-500" : changeColor,
            )}>
              {!isNeutral && (
                <span className="shrink-0">
                  {positive ? <TrendUp /> : <TrendDown />}
                </span>
              )}
              {change && (
                <span className="text-[12px] font-semibold tabular-nums leading-none">{change}</span>
              )}
              {changeLabel && (
                <span className="text-[12px] text-slate-600 leading-none">{changeLabel}</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
