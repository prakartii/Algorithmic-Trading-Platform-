import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

interface Point { date: string; value: number }

interface LineAreaChartProps {
  data:    Point[];
  color:   string;
  height?: number;
  unit?:   string;
  label:   string;
}

/** Generic single-series percent chart (drawdown, rolling volatility, …). */
export default function LineAreaChart({ data, color, height = 220, unit = "%", label }: LineAreaChartProps) {
  if (!data.length) return null;

  const id = `fill-${label.replace(/\W/g, "")}`;
  const step = Math.max(1, Math.floor(data.length / 6));
  const ticks = data.filter((_, i) => i % step === 0).map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={ticks}
          tickFormatter={(v: string) =>
            new Date(v).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
          tick={{ fontSize: 10, fill: "#71717a" }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tickFormatter={(v: number) => `${v.toFixed(0)}${unit}`}
          tick={{ fontSize: 10, fill: "#71717a" }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          cursor={{ stroke: "rgba(255,255,255,0.10)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as Point;
            return (
              <div className="bg-[#151619] border border-white/[0.10] rounded-lg px-3 py-2 shadow-2xl">
                <p className="text-[11px] text-slate-500 mb-1">
                  {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className="text-[13px] font-semibold text-slate-100 tabular-nums">
                  {label}: {p.value.toFixed(2)}{unit}
                </p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${id})`}
          dot={false}
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
