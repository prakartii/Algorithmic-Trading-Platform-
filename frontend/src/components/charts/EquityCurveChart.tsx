import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { EquityPoint } from "@/types";
import { formatCurrency } from "@/utils/formatters";

function CustomTooltip({ active, payload, label, initialCapital }: {
  active?:         boolean;
  payload?:        { value: number }[];
  label?:          string;
  initialCapital?: number;
}) {
  if (!active || !payload?.length) return null;

  const val  = payload[0].value;
  const date = label
    ? new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  const pnl  = initialCapital != null ? val - initialCapital : null;
  const pct  = initialCapital != null && initialCapital > 0 ? ((val - initialCapital) / initialCapital) * 100 : null;

  return (
    <div className="bg-[#131320] border border-white/[0.10] rounded-lg px-3.5 py-2.5 shadow-2xl">
      <p className="text-[11px] text-slate-500 mb-2 leading-none">{date}</p>
      <p className="text-[15px] font-bold text-slate-50 tabular-nums leading-none">{formatCurrency(val)}</p>
      {pnl != null && pct != null && (
        <p className={`text-[11px] font-medium mt-1.5 tabular-nums leading-none ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)} ({pct >= 0 ? "+" : ""}{pct.toFixed(2)}%)
        </p>
      )}
    </div>
  );
}

interface EquityCurveChartProps {
  data:           EquityPoint[];
  initialCapital: number;
  height?:        number;
}

export default function EquityCurveChart({
  data,
  initialCapital,
  height = 320,
}: EquityCurveChartProps) {
  if (!data.length) return null;

  const last       = data[data.length - 1].value;
  const isPositive = last >= initialCapital;
  const lineColor  = isPositive ? "#10b981" : "#ef4444";
  const fillId     = isPositive ? "fill-up" : "fill-down";

  const tickCount = Math.min(data.length, 7);
  const step      = Math.max(1, Math.floor(data.length / tickCount));
  const ticks     = data.filter((_, i) => i % step === 0).map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fill-up" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#10b981" stopOpacity={0.20} />
            <stop offset="60%"  stopColor="#10b981" stopOpacity={0.04} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="fill-down" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.20} />
            <stop offset="60%"  stopColor="#ef4444" stopOpacity={0.04} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="0"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          ticks={ticks}
          tickFormatter={(v: string) =>
            new Date(v).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
          }
          tick={{ fontSize: 10, fill: "#475569", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />

        <YAxis
          tickFormatter={(v: number) => {
            if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
            if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`;
            return `$${v}`;
          }}
          tick={{ fontSize: 10, fill: "#475569", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickCount={5}
        />

        <Tooltip
          content={<CustomTooltip initialCapital={initialCapital} />}
          cursor={{ stroke: "rgba(255,255,255,0.10)", strokeWidth: 1 }}
        />

        <ReferenceLine
          y={initialCapital}
          stroke="rgba(255,255,255,0.10)"
          strokeDasharray="4 4"
          strokeWidth={1}
        />

        <Area
          type="monotoneX"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={1.8}
          fill={`url(#${fillId})`}
          dot={false}
          activeDot={{ r: 4, fill: lineColor, stroke: "#131320", strokeWidth: 2 }}
          animationDuration={700}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
