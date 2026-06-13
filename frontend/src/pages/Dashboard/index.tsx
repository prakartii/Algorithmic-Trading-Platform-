import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getPortfolio, getBacktests } from "@/services/api";
import { getLastBacktest } from "@/utils/storage";
import type { PortfolioResponse, BacktestListItem } from "@/types";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import EquityCurveChart from "@/components/charts/EquityCurveChart";
import AllocationChart from "@/components/charts/AllocationChart";
import { formatCurrency, formatPercent, formatNumber } from "@/utils/formatters";
import { cn } from "@/utils/cn";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const;

function stagger(i: number) {
  return { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.22, delay: i * 0.04, ease: EASE } };
}

// ── Shared table styles ───────────────────────────────────────────────────────

const TH = "px-4 py-2.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-600 whitespace-nowrap";
const TD = "px-4 py-2.5 text-[13px] border-b border-[#ffffff04] last-of-type:border-0";

// ── Risk metric row ───────────────────────────────────────────────────────────

function RiskRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#ffffff05] last:border-0">
      <span className="text-[12px] text-slate-500">{label}</span>
      <div className="text-right">
        <span className="text-[13px] font-semibold text-slate-200 tabular-nums">{value}</span>
        {sub && <span className="text-[11px] text-slate-600 ml-1.5">{sub}</span>}
      </div>
    </div>
  );
}

// ── Insight item ─────────────────────────────────────────────────────────────

function Insight({ dot, text }: { dot: string; text: string }) {
  return (
    <div className="flex gap-3 py-3 border-b border-[#ffffff05] last:border-0">
      <div className={cn("w-1.5 h-1.5 rounded-full mt-[5px] shrink-0", dot)} />
      <p className="text-[13px] text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [history,   setHistory]   = useState<BacktestListItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const lastBt = getLastBacktest();

  useEffect(() => {
    Promise.all([getPortfolio(), getBacktests(8)])
      .then(([p, b]) => {
        setPortfolio(p as PortfolioResponse);
        setHistory(b as BacktestListItem[]);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
        <div className="text-center space-y-2">
          <p className="text-[14px] font-semibold text-slate-300">Backend unavailable</p>
          <p className="text-[12px] text-slate-600">{error ?? "Could not reach the API"}</p>
          <p className="text-[11px] text-slate-700 font-mono">localhost:8000</p>
        </div>
      </div>
    );
  }

  const p          = portfolio;
  const dayPnlPct  = p.equity > 0 ? (p.day_pnl / p.equity) * 100 : 0;
  const topBt      = history.find((b) => b.status === "completed");
  const pieData    = p.positions.map((pos) => ({ name: pos.symbol, value: pos.market_value }));

  // Insights from real data
  const insights: { dot: string; text: string }[] = [];
  if (p.position_count === 0) {
    insights.push({ dot: "bg-slate-600", text: "No open positions. Use Paper Trading to deploy capital into the market." });
  } else {
    const best = [...p.positions].sort((a, b) => b.unrealized_pnl_pct - a.unrealized_pnl_pct)[0];
    insights.push({ dot: "bg-emerald-500", text: `Best position: ${best.symbol} up ${formatPercent(best.unrealized_pnl_pct)} — unrealized gain of ${formatCurrency(best.unrealized_pnl)}.` });
    if (p.unrealized_pnl < 0) {
      insights.push({ dot: "bg-red-500", text: `Portfolio is carrying ${formatCurrency(Math.abs(p.unrealized_pnl))} in unrealized losses across ${p.position_count} position${p.position_count > 1 ? "s" : ""}.` });
    }
  }
  const cashPct = p.portfolio_value > 0 ? (p.cash / p.portfolio_value) * 100 : 100;
  if (cashPct > 60) {
    insights.push({ dot: "bg-amber-500", text: `${cashPct.toFixed(0)}% of portfolio is in cash. Consider deploying capital to reduce drag.` });
  } else {
    insights.push({ dot: "bg-blue-500", text: `Portfolio is ${(100 - cashPct).toFixed(0)}% deployed with ${formatCurrency(p.cash)} in cash reserve.` });
  }
  if (topBt) {
    insights.push({ dot: "bg-blue-500", text: `Latest backtest on ${topBt.symbol} returned ${formatPercent(topBt.total_return_pct ?? 0)} with a Sharpe of ${(topBt.sharpe_ratio ?? 0).toFixed(2)}.` });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Portfolio Value",
            value: formatCurrency(p.portfolio_value),
            positive: undefined,
          },
          {
            label: "Day P&L",
            value: formatCurrency(p.day_pnl),
            change: `${dayPnlPct >= 0 ? "+" : ""}${dayPnlPct.toFixed(2)}%`,
            changeLabel: "today",
            positive: p.day_pnl >= 0 ? true : false,
          },
          {
            label: "Cash Available",
            value: formatCurrency(p.cash),
            change: `${cashPct.toFixed(1)}% of portfolio`,
            changeLabel: "",
            positive: undefined,
          },
          {
            label: "Open Positions",
            value: String(p.position_count),
            change: p.position_count === 0 ? "No positions" : `${p.position_count === 1 ? "1 position" : `${p.position_count} positions`}`,
            changeLabel: "",
            positive: undefined,
          },
        ].map((card, i) => (
          <motion.div key={card.label} {...stagger(i)}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Equity curve */}
        <motion.div {...stagger(4)} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-200">
                  {lastBt ? `${lastBt.symbol} — Strategy Performance` : "Strategy Performance"}
                </h3>
                {lastBt && (
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {lastBt.start_date.slice(0, 7)} → {lastBt.end_date.slice(0, 7)} · 50/200 SMA Crossover
                  </p>
                )}
              </div>
              {lastBt && (
                <Badge
                  label={formatPercent(lastBt.total_return_pct)}
                  variant={lastBt.total_return_pct >= 0 ? "success" : "danger"}
                />
              )}
            </CardHeader>

            {lastBt?.equity_curve?.length ? (
              <div className="p-4 pt-3">
                <EquityCurveChart
                  data={lastBt.equity_curve}
                  initialCapital={lastBt.initial_capital}
                  height={260}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-52 gap-3">
                <p className="text-[13px] text-slate-600">No backtest data yet</p>
                <Link
                  to="/backtests"
                  className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Run a backtest →
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Allocation */}
        <motion.div {...stagger(5)}>
          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-slate-200">Allocation</h3>
              <span className="text-[11px] text-slate-600">{p.position_count} positions</span>
            </CardHeader>
            {pieData.length > 0 ? (
              <div className="p-5">
                <AllocationChart data={pieData} totalValue={p.portfolio_value} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-[13px] text-slate-700">
                No open positions
              </div>
            )}
          </Card>
        </motion.div>

      </div>

      {/* ── Positions + Risk ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Positions table */}
        <motion.div {...stagger(6)} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-slate-200">Open Positions</h3>
              {p.unrealized_pnl !== 0 && (
                <span className={cn(
                  "text-[12px] font-semibold tabular-nums",
                  p.unrealized_pnl >= 0 ? "text-emerald-400" : "text-red-400",
                )}>
                  {formatCurrency(p.unrealized_pnl)} unrealized
                </span>
              )}
            </CardHeader>

            {p.positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 gap-2">
                <p className="text-[13px] text-slate-600">No open positions</p>
                <Link to="/paper-trading" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Place an order →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#ffffff07]">
                      <th className={cn(TH, "text-left")}>Symbol</th>
                      <th className={cn(TH, "text-right")}>Qty</th>
                      <th className={cn(TH, "text-right")}>Avg Cost</th>
                      <th className={cn(TH, "text-right")}>Price</th>
                      <th className={cn(TH, "text-right")}>Value</th>
                      <th className={cn(TH, "text-right")}>P&amp;L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.positions.map((pos) => (
                      <tr key={pos.symbol} className="hover:bg-white/[0.015] transition-colors group">
                        <td className={cn(TD, "text-left")}>
                          <span className="font-mono font-semibold text-slate-100">{pos.symbol}</span>
                          <span className="ml-2 text-[11px] text-slate-600">{pos.side}</span>
                        </td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{pos.quantity}</td>
                        <td className={cn(TD, "text-right text-slate-500 tabular-nums")}>{formatCurrency(pos.avg_cost)}</td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{formatCurrency(pos.current_price)}</td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{formatCurrency(pos.market_value)}</td>
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

        {/* Risk metrics */}
        <motion.div {...stagger(7)} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-slate-200">Risk Metrics</h3>
              {topBt && (
                <span className="text-[11px] text-slate-600 font-mono">{topBt.symbol}</span>
              )}
            </CardHeader>
            {topBt ? (
              <div className="px-5 py-1">
                <RiskRow label="Total Return"  value={formatPercent(topBt.total_return_pct ?? 0)} />
                <RiskRow label="Sharpe Ratio"  value={formatNumber(topBt.sharpe_ratio ?? 0)} />
                <RiskRow label="Max Drawdown"  value={formatPercent(topBt.max_drawdown_pct ?? 0)} />
                <RiskRow label="Win Rate"      value={formatPercent(topBt.total_return_pct != null ? (topBt.win_rate_pct ?? 0) : 0)} />
                <RiskRow label="Trades"        value={String(topBt.trade_count ?? "—")} />
                <RiskRow label="Initial Capital" value={formatCurrency(topBt.initial_capital)} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <p className="text-[13px] text-slate-600">No backtest results</p>
                <Link to="/backtests" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Run a backtest →
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

      </div>

      {/* ── Backtest history + AI Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Backtest history */}
        <motion.div {...stagger(8)} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-slate-200">Recent Backtests</h3>
              <Link to="/backtests" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                View all →
              </Link>
            </CardHeader>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 gap-2">
                <p className="text-[13px] text-slate-600">No backtests yet</p>
                <Link to="/backtests" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Run one →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#ffffff07]">
                      <th className={cn(TH, "text-left")}>Symbol</th>
                      <th className={cn(TH, "text-right")}>Period</th>
                      <th className={cn(TH, "text-right")}>Return</th>
                      <th className={cn(TH, "text-right")}>Sharpe</th>
                      <th className={cn(TH, "text-right")}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 6).map((bt, i) => (
                      <tr key={bt.id ?? i} className="hover:bg-white/[0.015] transition-colors">
                        <td className={cn(TD, "text-left font-mono font-semibold text-slate-200")}>{bt.symbol}</td>
                        <td className={cn(TD, "text-right text-slate-600 text-[11px] tabular-nums")}>
                          {bt.start_date.slice(0, 7)} – {bt.end_date.slice(0, 7)}
                        </td>
                        <td className={cn(
                          TD, "text-right font-semibold tabular-nums",
                          (bt.total_return_pct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400",
                        )}>
                          {bt.total_return_pct != null ? formatPercent(bt.total_return_pct) : "—"}
                        </td>
                        <td className={cn(TD, "text-right text-slate-400 tabular-nums")}>
                          {bt.sharpe_ratio != null ? bt.sharpe_ratio.toFixed(2) : "—"}
                        </td>
                        <td className={cn(TD, "text-right")}>
                          <Badge
                            label={bt.status}
                            variant={bt.status === "completed" ? "success" : bt.status === "failed" ? "danger" : "warning"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div {...stagger(9)} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-200">Portfolio Insights</h3>
                <p className="text-[11px] text-slate-600 mt-0.5">Based on live data</p>
              </div>
              <Badge label="LIVE" variant="blue" />
            </CardHeader>
            <div className="px-5 py-1">
              {insights.map((ins, i) => (
                <Insight key={i} {...ins} />
              ))}
            </div>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
