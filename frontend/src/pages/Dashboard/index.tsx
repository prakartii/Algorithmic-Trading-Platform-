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

const EASE = [0.16, 1, 0.3, 1] as const;

function stagger(i: number) {
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, delay: i * 0.05, ease: EASE },
  };
}

const TH = "px-4 py-3 text-[11px] font-medium tracking-[0.07em] uppercase text-slate-500 whitespace-nowrap";
const TD = "px-4 py-[11px] text-[13px] border-b border-white/[0.04] last:border-0";

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[13px] text-slate-500">{label}</span>
      <span className={cn("text-[13px] font-semibold tabular-nums", color ?? "text-slate-200")}>{value}</span>
    </div>
  );
}

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
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/[0.08] border border-red-500/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[14px] font-semibold text-slate-300">Backend unavailable</p>
          <p className="text-[12px] text-slate-600 mt-1">{error ?? "Could not reach the API"}</p>
          <p className="text-[11px] text-slate-700 font-mono mt-1">localhost:8000</p>
        </div>
      </div>
    );
  }

  const p         = portfolio;
  const dayPnlPct = p.equity > 0 ? (p.day_pnl / p.equity) * 100 : 0;
  const cashPct   = p.portfolio_value > 0 ? (p.cash / p.portfolio_value) * 100 : 100;
  const topBt     = history.find((b) => b.status === "completed");
  const pieData   = p.positions.map((pos) => ({ name: pos.symbol, value: pos.market_value }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
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
            positive: p.day_pnl >= 0,
          },
          {
            label: "Buying Power",
            value: formatCurrency(p.buying_power),
            positive: undefined,
          },
          {
            label: "Cash Balance",
            value: formatCurrency(p.cash),
            change: `${cashPct.toFixed(1)}% of portfolio`,
            positive: undefined,
          },
        ].map((card, i) => (
          <motion.div key={card.label} {...stagger(i)}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* ── Equity curve + Allocation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <motion.div {...stagger(4)} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-200">
                  {lastBt ? `${lastBt.symbol} — Strategy Performance` : "Strategy Performance"}
                </h3>
                {lastBt && (
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {lastBt.start_date.slice(0, 7)} → {lastBt.end_date.slice(0, 7)} · SMA 50/200 Crossover
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
              <div className="px-4 pt-4 pb-3">
                <EquityCurveChart
                  data={lastBt.equity_curve}
                  initialCapital={lastBt.initial_capital}
                  height={268}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-56 gap-3">
                <p className="text-[13px] text-slate-600">No backtest data yet</p>
                <Link to="/backtests" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Run a backtest →
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div {...stagger(5)}>
          <Card className="h-full">
            <CardHeader>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-200">Allocation</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">{p.position_count} position{p.position_count !== 1 ? "s" : ""}</p>
              </div>
              <span className="text-[12px] text-slate-500 font-mono tabular-nums">{formatCurrency(p.portfolio_value)}</span>
            </CardHeader>

            {pieData.length > 0 ? (
              <div className="px-5 py-4">
                <AllocationChart data={pieData} totalValue={p.portfolio_value} />
                {p.cash > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-[6px] h-[6px] rounded-full bg-slate-600 shrink-0" />
                      <span className="text-[12px] text-slate-500">Cash</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-slate-500 tabular-nums">{formatCurrency(p.cash)}</span>
                      <span className="text-[11px] text-slate-600 tabular-nums w-10 text-right">{cashPct.toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-52 gap-2">
                <p className="text-[13px] text-slate-600">No open positions</p>
                <Link to="/paper-trading" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Place an order →
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

      </div>

      {/* ── Open Positions + Risk Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        <motion.div {...stagger(6)} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-200">Open Positions</h3>
                {p.unrealized_pnl !== 0 && (
                  <p className={cn(
                    "text-[12px] font-semibold tabular-nums mt-0.5",
                    p.unrealized_pnl >= 0 ? "text-emerald-400" : "text-red-400",
                  )}>
                    {p.unrealized_pnl >= 0 ? "+" : ""}{formatCurrency(p.unrealized_pnl)} unrealized
                  </p>
                )}
              </div>
              <Link to="/paper-trading" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors shrink-0">
                Trade →
              </Link>
            </CardHeader>

            {p.positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <p className="text-[13px] text-slate-600">No open positions</p>
                <Link to="/paper-trading" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Place a paper trade →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className={cn(TH, "text-left")}>Symbol</th>
                      <th className={cn(TH, "text-right")}>Qty</th>
                      <th className={cn(TH, "text-right")}>Avg Cost</th>
                      <th className={cn(TH, "text-right")}>Price</th>
                      <th className={cn(TH, "text-right")}>Market Value</th>
                      <th className={cn(TH, "text-right")}>P&amp;L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.positions.map((pos) => (
                      <tr key={pos.symbol} className="hover:bg-white/[0.02] transition-colors group">
                        <td className={cn(TD, "text-left")}>
                          <span className="font-mono font-semibold text-slate-100 text-[13px]">{pos.symbol}</span>
                          <span className={cn(
                            "ml-2 text-[10px] font-medium uppercase tracking-wide",
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

        <motion.div {...stagger(7)} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-200">Risk Metrics</h3>
                {topBt && <p className="text-[12px] text-slate-500 mt-0.5 font-mono">{topBt.symbol}</p>}
              </div>
              {topBt && (
                <Badge
                  label={topBt.status}
                  variant="success"
                />
              )}
            </CardHeader>
            {topBt ? (
              <div className="px-5 py-1">
                <MetricRow label="Total Return"    value={formatPercent(topBt.total_return_pct ?? 0)}   color={(topBt.total_return_pct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"} />
                <MetricRow label="Sharpe Ratio"    value={formatNumber(topBt.sharpe_ratio ?? 0)} />
                <MetricRow label="Max Drawdown"    value={formatPercent(topBt.max_drawdown_pct ?? 0)}   color="text-red-400" />
                <MetricRow label="Final Capital"   value={formatCurrency(topBt.final_capital ?? topBt.initial_capital)} />
                <MetricRow label="Total Trades"    value={String(topBt.trade_count ?? "—")} />
                <MetricRow label="Initial Capital" value={formatCurrency(topBt.initial_capital)} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-44 gap-2">
                <p className="text-[13px] text-slate-600">No backtest results</p>
                <Link to="/backtests" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Run a backtest →
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

      </div>

      {/* ── Recent Backtests ── */}
      <motion.div {...stagger(8)}>
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-[14px] font-semibold text-slate-200">Recent Backtests</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">SMA 50/200 Crossover Strategy</p>
            </div>
            <Link to="/backtests" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors shrink-0">
              Run backtest →
            </Link>
          </CardHeader>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-[13px] text-slate-600">No backtests yet</p>
              <Link to="/backtests" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                Run your first backtest →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className={cn(TH, "text-left")}>Symbol</th>
                    <th className={cn(TH, "text-right")}>Period</th>
                    <th className={cn(TH, "text-right")}>Capital</th>
                    <th className={cn(TH, "text-right")}>Return</th>
                    <th className={cn(TH, "text-right")}>Sharpe</th>
                    <th className={cn(TH, "text-right")}>Drawdown</th>
                    <th className={cn(TH, "text-right")}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 7).map((bt, i) => (
                    <tr key={bt.id ?? i} className="hover:bg-white/[0.02] transition-colors">
                      <td className={cn(TD, "text-left font-mono font-semibold text-slate-100")}>{bt.symbol}</td>
                      <td className={cn(TD, "text-right text-slate-500 text-[12px] tabular-nums")}>
                        {bt.start_date.slice(0, 7)} – {bt.end_date.slice(0, 7)}
                      </td>
                      <td className={cn(TD, "text-right text-slate-400 tabular-nums")}>{formatCurrency(bt.initial_capital)}</td>
                      <td className={cn(
                        TD, "text-right font-semibold tabular-nums",
                        (bt.total_return_pct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400",
                      )}>
                        {bt.total_return_pct != null ? formatPercent(bt.total_return_pct) : "—"}
                      </td>
                      <td className={cn(TD, "text-right text-slate-400 tabular-nums")}>
                        {bt.sharpe_ratio != null ? bt.sharpe_ratio.toFixed(2) : "—"}
                      </td>
                      <td className={cn(TD, "text-right text-slate-400 tabular-nums")}>
                        {bt.max_drawdown_pct != null ? formatPercent(bt.max_drawdown_pct) : "—"}
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

    </motion.div>
  );
}
