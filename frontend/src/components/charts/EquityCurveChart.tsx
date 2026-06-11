import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { EquityPoint } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface EquityCurveChartProps {
  data: EquityPoint[];
  initialCapital: number;
}

export default function EquityCurveChart({ data, initialCapital }: EquityCurveChartProps) {
  const isPositive = data.length > 0 && data[data.length - 1].value >= initialCapital;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 16 }}>
        <defs>
          <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.2} />
            <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => formatDate(v)}
          tick={{ fontSize: 11 }}
          minTickGap={60}
        />
        <YAxis
          tickFormatter={(v: number) => formatCurrency(v)}
          tick={{ fontSize: 11 }}
          width={80}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "Portfolio Value"]}
          labelFormatter={(label: string) => formatDate(label)}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth={2}
          fill="url(#equity-fill)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
