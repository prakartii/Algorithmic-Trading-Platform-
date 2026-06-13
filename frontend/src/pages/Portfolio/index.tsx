import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getPortfolio } from "@/services/api";
import type { PortfolioResponse } from "@/types";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import AllocationChart from "@/components/charts/AllocationChart";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const TH   = "px-4 py-2.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-600 whitespace-nowrap";
const TD   = "px-4 py-3 text-[13px] border-b border-[#ffffff04] last-of-type:border-0";

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getPortfolio()
      .then((d) => setPortfolio(d as PortfolioResponse))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  }

  if (error || !portfolio) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <p className="text-[14px] font-semibold text-slate-300">Failed to load portfolio</p>
          <p className="text-[12px] text-slate-600">{error ?? "Unknown error"}</p>
          <button onClick={load} className="text-[12px] text-blue-400 hover:text-blue-300 mt-2 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const p       = portfolio;
  const pieData = p.positions.map((pos) => ({ name: pos.symbol, value: pos.market_value }));
  const dayPct  = p.equity > 0 ? (p.day_pnl / p.equity) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Portfolio Value",  value: formatCurrency(p.portfolio_value), positive: undefined },
          { label: "Day P&L",          value: formatCurrency(p.day_pnl),         change: `${dayPct >= 0 ? "+" : ""}${dayPct.toFixed(2)}%`, changeLabel: "today", positive: p.day_pnl >= 0 ? true : false },
          { label: "Cash",             value: formatCurrency(p.cash),            change: `${formatCurrency(p.buying_power)} buying power`, changeLabel: "", positive: undefined },
          { label: "Unrealized P&L",   value: formatCurrency(p.unrealized_pnl), positive: p.unrealized_pnl >= 0 ? true : (p.unrealized_pnl < 0 ? false : undefined) },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.04, ease: EASE }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* ── Holdings + Allocation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Holdings table */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.16, ease: EASE }}
        >
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-200">Holdings</h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {p.position_count} {p.position_count === 1 ? "position" : "positions"} open
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={load}>
                Refresh
              </Button>
            </CardHeader>

            {p.positions.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-[13px] text-slate-600">
                No open positions in paper portfolio
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#ffffff07]">
                      <th className={cn(TH, "text-left")}>Symbol</th>
                      <th className={cn(TH, "text-right")}>Side</th>
                      <th className={cn(TH, "text-right")}>Qty</th>
                      <th className={cn(TH, "text-right")}>Avg Cost</th>
                      <th className={cn(TH, "text-right")}>Price</th>
                      <th className={cn(TH, "text-right")}>Market Value</th>
                      <th className={cn(TH, "text-right")}>P&amp;L</th>
                      <th className={cn(TH, "text-right")}>P&amp;L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.positions.map((pos) => (
                      <tr key={pos.symbol} className="hover:bg-white/[0.015] transition-colors">
                        <td className={cn(TD, "text-left")}>
                          <span className="font-mono font-bold text-slate-100">{pos.symbol}</span>
                        </td>
                        <td className={cn(TD, "text-right")}>
                          <span className={cn(
                            "text-[10px] font-semibold tracking-wide uppercase",
                            pos.side === "long" ? "text-emerald-500" : "text-red-500",
                          )}>
                            {pos.side}
                          </span>
                        </td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{pos.quantity}</td>
                        <td className={cn(TD, "text-right text-slate-500 tabular-nums")}>{formatCurrency(pos.avg_cost)}</td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{formatCurrency(pos.current_price)}</td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{formatCurrency(pos.market_value)}</td>
                        <td className={cn(
                          TD, "text-right font-semibold tabular-nums",
                          pos.unrealized_pnl >= 0 ? "text-emerald-400" : "text-red-400",
                        )}>
                          {formatCurrency(pos.unrealized_pnl)}
                        </td>
                        <td className={cn(
                          TD, "text-right font-semibold tabular-nums",
                          pos.unrealized_pnl_pct >= 0 ? "text-emerald-400" : "text-red-400",
                        )}>
                          {formatPercent(pos.unrealized_pnl_pct)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Allocation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.2, ease: EASE }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-slate-200">Allocation</h3>
              <span className="text-[11px] text-slate-600 tabular-nums">{formatCurrency(p.portfolio_value)}</span>
            </CardHeader>
            {pieData.length > 0 ? (
              <div className="p-5">
                <AllocationChart data={pieData} totalValue={p.portfolio_value} />

                {/* Cash row */}
                {p.cash > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#ffffff06]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                        <span className="text-[12px] text-slate-500">Cash</span>
                      </div>
                      <span className="text-[12px] text-slate-500 tabular-nums">
                        {p.portfolio_value > 0 ? ((p.cash / p.portfolio_value) * 100).toFixed(1) : "0.0"}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-52 text-[13px] text-slate-700">
                No positions
              </div>
            )}
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
