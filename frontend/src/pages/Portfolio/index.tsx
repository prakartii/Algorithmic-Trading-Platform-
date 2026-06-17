import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
const TH   = "px-4 py-3 text-[11px] font-medium tracking-[0.07em] uppercase text-slate-500 whitespace-nowrap";
const TD   = "px-4 py-[11px] text-[13px] border-b border-white/[0.04] last:border-0";

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
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[14px] font-semibold text-slate-300">Failed to load portfolio</p>
        <p className="text-[12px] text-slate-600">{error ?? "Unknown error"}</p>
        <button onClick={load} className="text-[12px] text-blue-400 hover:text-blue-300 mt-1 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const p       = portfolio;
  const pieData = p.positions.map((pos) => ({ name: pos.symbol, value: pos.market_value }));
  const dayPct  = p.equity > 0 ? (p.day_pnl / p.equity) * 100 : 0;
  const cashPct = p.portfolio_value > 0 ? (p.cash / p.portfolio_value) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="space-y-5"
    >

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Portfolio Value",  value: formatCurrency(p.portfolio_value),  positive: undefined },
          { label: "Day P&L",          value: formatCurrency(p.day_pnl),          change: `${dayPct >= 0 ? "+" : ""}${dayPct.toFixed(2)}%`, changeLabel: "today", positive: p.day_pnl >= 0 },
          { label: "Cash",             value: formatCurrency(p.cash),             change: `${cashPct.toFixed(1)}% of NAV`, positive: undefined },
          { label: "Unrealized P&L",   value: formatCurrency(p.unrealized_pnl),  positive: p.unrealized_pnl !== 0 ? p.unrealized_pnl >= 0 : undefined },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: i * 0.05, ease: EASE }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* ── Holdings + Allocation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.20, ease: EASE }}
        >
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-200">Holdings</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  {p.position_count} {p.position_count === 1 ? "position" : "positions"} · {formatCurrency(p.equity)} equity
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={load} disabled={loading}>
                Refresh
              </Button>
            </CardHeader>

            {p.positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 gap-3">
                <p className="text-[13px] text-slate-600">No open positions in paper portfolio</p>
                <Link to="/paper-trading" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Go to Paper Trading →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
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
                      <tr key={pos.symbol} className="hover:bg-white/[0.02] transition-colors">
                        <td className={cn(TD, "text-left")}>
                          <span className="font-mono font-bold text-slate-100">{pos.symbol}</span>
                        </td>
                        <td className={cn(TD, "text-right")}>
                          <span className={cn(
                            "text-[10px] font-semibold uppercase tracking-[0.06em]",
                            pos.side === "long" ? "text-emerald-500" : "text-red-500",
                          )}>
                            {pos.side}
                          </span>
                        </td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{pos.quantity}</td>
                        <td className={cn(TD, "text-right text-slate-500 tabular-nums")}>{formatCurrency(pos.avg_cost)}</td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{formatCurrency(pos.current_price)}</td>
                        <td className={cn(TD, "text-right text-slate-200 tabular-nums font-medium")}>{formatCurrency(pos.market_value)}</td>
                        <td className={cn(
                          TD, "text-right font-semibold tabular-nums",
                          pos.unrealized_pnl >= 0 ? "text-emerald-400" : "text-red-400",
                        )}>
                          {pos.unrealized_pnl >= 0 ? "+" : ""}{formatCurrency(pos.unrealized_pnl)}
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

                {/* Footer summary */}
                <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                  <span className="text-[11px] text-slate-600 uppercase tracking-wider">Total</span>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-600 block">Market Value</span>
                      <span className="text-[13px] font-semibold text-slate-200 tabular-nums">{formatCurrency(p.equity)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-600 block">Unrealized P&L</span>
                      <span className={cn(
                        "text-[13px] font-semibold tabular-nums",
                        p.unrealized_pnl >= 0 ? "text-emerald-400" : "text-red-400",
                      )}>
                        {p.unrealized_pnl >= 0 ? "+" : ""}{formatCurrency(p.unrealized_pnl)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.25, ease: EASE }}
        >
          <Card className="h-full">
            <CardHeader>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-200">Allocation</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">By market value</p>
              </div>
              <span className="text-[12px] text-slate-500 tabular-nums">{formatCurrency(p.portfolio_value)}</span>
            </CardHeader>

            {pieData.length > 0 ? (
              <div className="px-5 py-4">
                <AllocationChart data={pieData} totalValue={p.portfolio_value} />

                {p.cash > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-[6px] h-[6px] rounded-full bg-slate-600 shrink-0" />
                      <span className="text-[12px] text-slate-500">Cash</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-slate-500 tabular-nums">{formatCurrency(p.cash)}</span>
                      <span className="text-[11px] text-slate-600 tabular-nums w-10 text-right">
                        {cashPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Portfolio summary */}
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-500">Buying Power</span>
                    <span className="text-[12px] text-slate-300 tabular-nums">{formatCurrency(p.buying_power)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-500">Total Equity</span>
                    <span className="text-[12px] text-slate-300 tabular-nums">{formatCurrency(p.equity)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-500">Positions</span>
                    <span className="text-[12px] text-slate-300">{p.position_count}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-52 gap-2">
                <p className="text-[13px] text-slate-600">No positions</p>
              </div>
            )}
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
