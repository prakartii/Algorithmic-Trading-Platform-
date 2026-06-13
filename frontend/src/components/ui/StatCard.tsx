import { cn } from "@/utils/cn";

// ── Micro arrow icons ─────────────────────────────────────────────────────────

function ArrowUp() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 2 10 6 6 10" transform="rotate(-90 6 6)" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 2 10 6 6 10" transform="rotate(90 6 6)" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:        string;
  value:        string | number;
  change?:      string;       // e.g. "+$1,234" or "+1.18%"
  changeLabel?: string;       // e.g. "today"
  positive?:    boolean;      // undefined = neutral
  loading?:     boolean;
  className?:   string;
}

export default function StatCard({
  label,
  value,
  change,
  changeLabel,
  positive,
  loading = false,
  className,
}: StatCardProps) {
  const isNeutral  = positive === undefined;
  const valueColor = isNeutral ? "text-slate-50" : positive ? "text-emerald-400" : "text-red-400";
  const changeColor = positive ? "text-emerald-400" : "text-red-400";

  return (
    <div
      className={cn(
        "relative bg-[#0d0d1a] border border-[#ffffff08] rounded-xl p-5 overflow-hidden",
        "transition-colors duration-150 hover:border-[#ffffff0f]",
        className,
      )}
    >
      {/* Subtle top glow for non-neutral cards */}
      {!isNeutral && positive !== undefined && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-[1px]",
            positive ? "bg-emerald-500/30" : "bg-red-500/30",
          )}
        />
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 bg-white/[0.06] rounded" />
          <div className="h-7 w-32 bg-white/[0.06] rounded" />
          <div className="h-3 w-20 bg-white/[0.06] rounded" />
        </div>
      ) : (
        <>
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500 select-none mb-2">
            {label}
          </p>

          <p className={cn(
            "text-[26px] font-bold leading-none tabular-nums tracking-tight",
            valueColor,
          )}>
            {value}
          </p>

          {(change || changeLabel) && (
            <div className={cn(
              "flex items-center gap-1 mt-2.5",
              isNeutral ? "text-slate-500" : changeColor,
            )}>
              {!isNeutral && (
                <span className="shrink-0">
                  {positive ? <ArrowUp /> : <ArrowDown />}
                </span>
              )}
              {change && (
                <span className="text-[12px] font-semibold tabular-nums">{change}</span>
              )}
              {changeLabel && (
                <span className="text-[12px] text-slate-600 font-normal">{changeLabel}</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
