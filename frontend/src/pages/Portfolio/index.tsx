import { useState, useEffect } from "react";
import { getPortfolio } from "@/services/api";
import type { PortfolioResponse } from "@/types";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const PIE_COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#84cc16",
];

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getPortfolio()
      .then((data) => setPortfolio(data as PortfolioResponse))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 font-semibold">Failed to load portfolio</p>
          <p className="text-slate-500 text-[13px] mt-1">{error ?? "Unknown error"}</p>
          <button onClick={load} className="mt-3 text-blue-400 text-[13px] hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const p = portfolio;
  const pieData = p.positions.map((pos) => ({
    name:  pos.symbol,
    value: pos.market_value,
  }));

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Portfolio Value" value={formatCurrency(p.portfolio_value)} neutral />
        <StatCard label="Cash"            value={formatCurrency(p.cash)}            neutral />
        <StatCard label="Buying Power"    value={formatCurrency(p.buying_power)}    neutral />
        <StatCard
          label="Unrealized P&L"
          value={formatCurrency(p.unrealized_pnl)}
          positive={p.unrealized_pnl >= 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Holdings table ── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-[13px] font-semibold text-slate-200">
              Holdings
              <span className="ml-2 text-slate-600 font-normal text-[12px]">
                ({p.position_count} {p.position_count === 1 ? "position" : "positions"})
              </span>
            </h3>
            <Button size="sm" variant="secondary" onClick={load}>
              Refresh
            </Button>
          </CardHeader>

          {p.positions.length === 0 ? (
            <div className="py-16 text-center text-slate-600 text-[13px]">
              No open positions in paper portfolio.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#ffffff06]">
                    {(["Symbol","Qty","Avg Cost","Price","Market Value","P&L","P&L %"] as const).map((h) => (
                      <th
                        key={h}
                        className={cn(
                          "px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-slate-600",
                          h === "Symbol" ? "text-left" : "text-right",
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.positions.map((pos) => (
                    <tr
                      key={pos.symbol}
                      className="border-b border-[#ffffff04] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-100">{pos.symbol}</td>
                      <td className="px-4 py-3 text-right text-slate-300 tabular-nums">{pos.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-400 tabular-nums">
                        {formatCurrency(pos.avg_cost)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                        {formatCurrency(pos.current_price)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                        {formatCurrency(pos.market_value)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right tabular-nums font-semibold",
                          pos.unrealized_pnl >= 0 ? "text-emerald-400" : "text-red-400",
                        )}
                      >
                        {formatCurrency(pos.unrealized_pnl)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right tabular-nums font-semibold",
                          pos.unrealized_pnl_pct >= 0 ? "text-emerald-400" : "text-red-400",
                        )}
                      >
                        {formatPercent(pos.unrealized_pnl_pct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ── Allocation chart ── */}
        <Card title="Allocation">
          {p.positions.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-600 text-[13px]">
              No positions
            </div>
          ) : (
            <div className="p-5">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Value"]}
                    contentStyle={{
                      background:   "#0d0d1a",
                      border:       "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      fontSize:     12,
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-3 space-y-1.5">
                {pieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="font-mono font-semibold text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-slate-500 tabular-nums">
                      {p.portfolio_value > 0
                        ? ((item.value / p.portfolio_value) * 100).toFixed(1) + "%"
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
