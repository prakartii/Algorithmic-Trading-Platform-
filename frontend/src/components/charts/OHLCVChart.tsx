import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { OHLCVBar } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface OHLCVChartProps {
  data: OHLCVBar[];
  symbol: string;
}

export default function OHLCVChart({ data, symbol }: OHLCVChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => formatDate(v)}
          tick={{ fontSize: 11 }}
          minTickGap={60}
        />
        <YAxis
          yAxisId="price"
          tickFormatter={(v: number) => formatCurrency(v)}
          tick={{ fontSize: 11 }}
          width={80}
        />
        <YAxis
          yAxisId="volume"
          orientation="right"
          tick={{ fontSize: 11 }}
          width={60}
        />
        <Tooltip
          formatter={(value: number, name: string) =>
            name === "close"
              ? [formatCurrency(value), `${symbol} Close`]
              : [value.toLocaleString(), "Volume"]
          }
          labelFormatter={(label: string) => formatDate(label)}
        />
        <Bar yAxisId="volume" dataKey="volume" fill="#6366f1" opacity={0.3} />
        <Line
          yAxisId="price"
          type="monotone"
          dataKey="close"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
