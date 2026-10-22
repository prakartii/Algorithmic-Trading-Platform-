import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getBacktests } from "@/services/api";
import { getLastBacktest } from "@/utils/storage";
import { drawdownSeries, monthlyReturns, rollingVolatility } from "@/utils/analytics";
import type { BacktestListItem } from "@/types";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import EquityCurveChart from "@/components/charts/EquityCurveChart";
import LineAreaChart from "@/components/charts/LineAreaChart";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TH = "px-4 py-3 text-[11px] font-medium tracking-[0.07em] uppercase text-slate-500 whitespace-nowrap";
const TD = "px-4 py-[11px] text-[13px] border-b border-white/[0.04] last:border-0";

function cellStyle(v: number | null): React.CSSProperties {
  if (v == null) return {};
  const a = Math.min(Math.abs(v) / 12, 1) * 0.5 + 0.06;
  return { backgroundColor: v >= 0 ? `rgba(16,185,129,${a})` : `rgba(239,68,68,${a})` };
}

function stagger(i: number) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.22, delay: i * 0.04, ease: EASE },
  };
}

export default function Analytics() {
  const bt = useMemo(() => getLastBacktest(), []);
  const [history, setHistory] = useState<BacktestListItem[]>([]);

  useEffect(() => {
    getBacktests(10).then((h) => setHistory(h as BacktestListItem[])).catch(() => setHistory([]));
  }, []);

  const drawdown = useMemo(() => (bt ? drawdownSeries(bt.equity_curve) : []), [bt]);
  const rolling  = useMemo(() => (bt ? rollingVolatility(bt.equity_curve, 60) : []), [bt]);
  const monthly  = useMemo(() => (bt ? monthlyReturns(bt.equity_curve) : []), [bt]);

  if (!bt) {
    return (
      <motion.div
        {...stagger(0)}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <h1 className="text-[18px] font-semibold text-slate-100 mb-2">No analytics yet</h1>
        <p className="text-[13px] text-slate-500 max-w-sm leading-relaxed mb-5">
          Analytics are computed from your most recent backtest. Run one to see drawdowns,
          monthly returns, and rolling volatility.
        </p>
        <Link
          to="/backtests"
          className="h-8 px-3.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[13px] font-medium flex items-center transition-colors"
        >
          Run a backtest
        </Link>
      </motion.div>
    );
  }

  const ret = bt.total_return_pct;

  return (
    <div className="space-y-5">
      <motion.div {...stagger(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-slate-100 font-mono">{bt.symbol}</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {bt.start_date} → {bt.end_date} · SMA 50/200 crossover
          </p>
        </div>
        <Badge label={formatPercent(ret)} variant={ret >= 0 ? "success" : "danger"} />
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "CAGR",          value: formatPercent(bt.cagr_pct),          positive: bt.cagr_pct >= 0 },
          { label: "Sharpe",        value: bt.sharpe_ratio.toFixed(2),          positive: undefined },
          { label: "Sortino",       value: bt.sortino_ratio.toFixed(2),         positive: undefined },
          { label: "Max Drawdown",  value: formatPercent(bt.max_drawdown_pct),  positive: false },
          { label: "Volatility",    value: `${bt.volatility_pct.toFixed(2)}%`,  positive: undefined },
          { label: "Win Rate",      value: `${bt.win_rate_pct.toFixed(1)}%`,    positive: undefined },
          { label: "Profit Factor", value: bt.profit_factor.toFixed(2),         positive: undefined },
          { label: "Trades",        value: String(bt.trade_count),              positive: undefined },
        ].map((c, i) => (
          <motion.div key={c.label} {...stagger(i + 1)}>
            <StatCard {...c} />
          </motion.div>
        ))}
      </div>

      <motion.div {...stagger(9)}>
        <Card>
          <CardHeader>
            <h3 className="text-[14px] font-semibold text-slate-200">Equity curve</h3>
            <span className="text-[12px] text-slate-500 tabular-nums">
              {formatCurrency(bt.initial_capital)} → {formatCurrency(bt.final_value)}
            </span>
          </CardHeader>
          <div className="px-4 pt-4 pb-3">
            <EquityCurveChart data={bt.equity_curve} initialCapital={bt.initial_capital} height={260} />
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div {...stagger(10)}>
          <Card>
            <CardHeader>
              <h3 className="text-[14px] font-semibold text-slate-200">Drawdown</h3>
              <span className="text-[12px] text-red-400 tabular-nums">{formatPercent(bt.max_drawdown_pct)} max</span>
            </CardHeader>
            <div className="px-4 pt-4 pb-3">
              <LineAreaChart data={drawdown} color="#ef4444" label="Drawdown" height={220} />
            </div>
          </Card>
        </motion.div>

        <motion.div {...stagger(11)}>
          <Card>
            <CardHeader>
              <h3 className="text-[14px] font-semibold text-slate-200">Rolling volatility</h3>
              <span className="text-[12px] text-slate-500">60-day, annualised</span>
            </CardHeader>
            <div className="px-4 pt-4 pb-3">
              {rolling.length
                ? <LineAreaChart data={rolling} color="#7c85e0" label="Volatility" height={220} />
                : <p className="text-[13px] text-slate-600 text-center py-16">Not enough data</p>}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div {...stagger(12)}>
        <Card>
          <CardHeader>
            <h3 className="text-[14px] font-semibold text-slate-200">Monthly returns</h3>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className={cn(TH, "text-left")}>Year</th>
                  {MONTHS.map((m) => <th key={m} className={cn(TH, "text-right")}>{m}</th>)}
                  <th className={cn(TH, "text-right")}>Total</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((row) => (
                  <tr key={row.year}>
                    <td className={cn(TD, "font-mono text-slate-300")}>{row.year}</td>
                    {row.months.map((v, i) => (
                      <td
                        key={i}
                        style={cellStyle(v)}
                        className={cn(TD, "text-right tabular-nums text-[12px]", v == null ? "text-slate-700" : "text-slate-200")}
                      >
                        {v == null ? "·" : v.toFixed(1)}
                      </td>
                    ))}
                    <td className={cn(TD, "text-right font-semibold tabular-nums", row.total >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {formatPercent(row.total, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {history.length > 1 && (
        <motion.div {...stagger(13)}>
          <Card>
            <CardHeader>
              <h3 className="text-[14px] font-semibold text-slate-200">Run comparison</h3>
              <span className="text-[12px] text-slate-500">{history.length} recent runs</span>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className={cn(TH, "text-left")}>Symbol</th>
                    <th className={cn(TH, "text-right")}>Return</th>
                    <th className={cn(TH, "text-right")}>Sharpe</th>
                    <th className={cn(TH, "text-right")}>Drawdown</th>
                    <th className={cn(TH, "text-right")}>Trades</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.id ?? i} className="hover:bg-white/[0.02] transition-colors">
                      <td className={cn(TD, "font-mono font-semibold text-slate-100")}>{h.symbol}</td>
                      <td className={cn(TD, "text-right tabular-nums font-semibold", (h.total_return_pct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {h.total_return_pct != null ? formatPercent(h.total_return_pct) : "—"}
                      </td>
                      <td className={cn(TD, "text-right tabular-nums text-slate-400")}>{h.sharpe_ratio?.toFixed(2) ?? "—"}</td>
                      <td className={cn(TD, "text-right tabular-nums text-slate-400")}>{h.max_drawdown_pct != null ? formatPercent(h.max_drawdown_pct) : "—"}</td>
                      <td className={cn(TD, "text-right tabular-nums text-slate-400")}>{h.trade_count ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
