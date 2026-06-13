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

// ── Custom tooltip ─────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?:  boolean;
  payload?: { value: number }[];
  label?:   string;
}) {
  if (!active || !payload?.length) return null;

  const val = payload[0].value;
  const date = label
    ? new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <div className="bg-[#111120] border border-[#ffffff10] rounded-lg px-3.5 py-2.5 shadow-xl">
      <p className="text-[11px] text-slate-500 mb-1">{date}</p>
      <p className="text-[14px] font-bold text-slate-50 tabular-nums">{formatCurrency(val)}</p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

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

  // Compute tick density
  const tickCount = Math.min(data.length, 6);
  const step      = Math.floor(data.length / tickCount);
  const ticks     = data.filter((_, i) => i % step === 0).map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="fill-up" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#10b981" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="fill-down" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.18} />
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
          dy={6}
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
          width={52}
          tickCount={5}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
        />

        <ReferenceLine
          y={initialCapital}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="4 4"
          strokeWidth={1}
        />

        <Area
          type="monotoneX"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={1.75}
          fill={`url(#${fillId})`}
          dot={false}
          activeDot={{ r: 3, fill: lineColor, stroke: "#0d0d1a", strokeWidth: 2 }}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
