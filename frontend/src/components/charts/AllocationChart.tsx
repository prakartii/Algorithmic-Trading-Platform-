import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/utils/formatters";

const COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#f87171", "#a78bfa", "#34d399",
];

function CustomTooltip({ active, payload }: {
  active?:  boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#131320] border border-white/[0.10] rounded-lg px-3 py-2.5 shadow-2xl">
      <p className="text-[11px] font-semibold text-slate-300 leading-none mb-1">{payload[0].name}</p>
      <p className="text-[13px] font-bold text-slate-50 tabular-nums">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

interface AllocationChartProps {
  data: { name: string; value: number }[];
  totalValue: number;
}

export default function AllocationChart({ data, totalValue }: AllocationChartProps) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={168}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
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
                opacity={0.88}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-1.5">
        {data.map((item, idx) => {
          const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
          return (
            <div key={item.name} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-[6px] h-[6px] rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-[12px] font-mono font-semibold text-slate-300 truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-[12px] text-slate-500 tabular-nums">{formatCurrency(item.value)}</span>
                <span className="text-[11px] text-slate-600 tabular-nums w-10 text-right">{pct.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
