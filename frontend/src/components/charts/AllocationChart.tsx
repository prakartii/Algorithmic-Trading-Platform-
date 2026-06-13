import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/utils/formatters";

// ── Palette ───────────────────────────────────────────────────────────────────

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#84cc16", // lime
];

// ── Custom tooltip ─────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: {
  active?:  boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111120] border border-[#ffffff10] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[11px] font-semibold text-slate-300">{payload[0].name}</p>
      <p className="text-[13px] font-bold text-slate-50 tabular-nums mt-0.5">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AllocationChartProps {
  data: { name: string; value: number }[];
  totalValue: number;
}

export default function AllocationChart({ data, totalValue }: AllocationChartProps) {
  return (
    <div>
      {/* Donut chart */}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={76}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
            animationBegin={0}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((_, idx) => (
              <Cell
                key={idx}
                fill={COLORS[idx % COLORS.length]}
                opacity={0.9}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 space-y-2">
        {data.map((item, idx) => {
          const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-[12px] font-mono font-semibold text-slate-300 truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-[12px] text-slate-500 tabular-nums ml-3 shrink-0">
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
