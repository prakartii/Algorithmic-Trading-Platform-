import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { runBacktest, getBacktests } from "@/services/api";
import { saveLastBacktest } from "@/utils/storage";
import type { BacktestResponse, BacktestListItem } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import EquityCurveChart from "@/components/charts/EquityCurveChart";
import { formatCurrency, formatPercent, formatNumber } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const TODAY          = new Date().toISOString().slice(0, 10);
const FIVE_YEARS_AGO = new Date(Date.now() - 5 * 365.25 * 864e5).toISOString().slice(0, 10);
const EASE           = [0.16, 1, 0.3, 1] as const;

const TH = "px-4 py-3 text-[11px] font-medium tracking-[0.07em] uppercase text-slate-500 whitespace-nowrap";
const TD = "px-4 py-[11px] text-[13px] border-b border-white/[0.04] last:border-0";

const inputCls =
  "h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-100 text-[13px] w-full " +
  "focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors placeholder:text-slate-700";

const labelCls = "text-[11px] font-medium uppercase tracking-[0.09em] text-slate-500 mb-1.5 block select-none";

interface FormState {
  symbol: string; start_date: string; end_date: string; initial_capital: string;
}

interface MetricCardProps {
  label:    string;
  value:    string;
  sub?:     string;
  color?:   string;
  positive?: boolean;
}

function MetricCard({ label, value, sub, color, positive }: MetricCardProps) {
  return (
    <div className="bg-[#0e0e15] border border-white/[0.07] rounded-xl p-4">
      <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-slate-500 mb-2 leading-none">{label}</p>
      <p className={cn("text-[22px] font-bold tabular-nums leading-none tracking-tight", color ?? "text-slate-100")}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-slate-600 mt-1.5 leading-none">{sub}</p>}
      {positive !== undefined && (
        <div className={cn(
          "mt-2 h-[2px] rounded-full w-8",
          positive ? "bg-emerald-500/50" : "bg-red-500/50",
        )} />
      )}
    </div>
  );
}

export default function Backtests() {
  const [form, setForm] = useState<FormState>({
    symbol: "AAPL", start_date: FIVE_YEARS_AGO, end_date: TODAY, initial_capital: "10000",
  });
  const [running,  setRunning]  = useState(false);
  const [result,   setResult]   = useState<BacktestResponse | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [history,  setHistory]  = useState<BacktestListItem[]>([]);
  const [histLoad, setHistLoad] = useState(true);

  useEffect(() => {
    getBacktests(20)
      .then((d) => setHistory(d as BacktestListItem[]))
      .catch(() => {})
      .finally(() => setHistLoad(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRunning(true);
    setRunError(null);
    setResult(null);
    try {
      const data = await runBacktest({
        symbol:          form.symbol.toUpperCase(),
        start_date:      form.start_date,
        end_date:        form.end_date,
        initial_capital: parseFloat(form.initial_capital) || 10_000,
      }) as BacktestResponse;
      setResult(data);
      saveLastBacktest(data);
      getBacktests(20).then((d) => setHistory(d as BacktestListItem[])).catch(() => {});
    } catch (err: unknown) {
      setRunError(err instanceof Error ? err.message : "Backtest failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="space-y-5"
    >

      {/* ── Strategy config ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE }}
      >
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-[14px] font-semibold text-slate-200">Run Backtest</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                SMA 50/200 Golden Cross — Buy when 50-day SMA crosses above 200-day SMA
              </p>
            </div>
            <Badge label="SMA Crossover" variant="blue" />
          </CardHeader>

          <div className="p-5">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className={labelCls}>Symbol</label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                  placeholder="AAPL"
                  maxLength={10}
                  required
                  className={cn(inputCls, "font-mono font-semibold")}
                />
              </div>

              <div>
                <label className={labelCls}>Start Date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>End Date</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Initial Capital</label>
                <input
                  type="number"
                  value={form.initial_capital}
                  onChange={(e) => setForm((f) => ({ ...f, initial_capital: e.target.value }))}
                  min={1000}
                  step={1000}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <Button type="submit" loading={running} className="w-full h-9 text-[13px]">
                  {running ? "Running…" : "Run Backtest"}
                </Button>
              </div>
            </form>

            {runError && (
              <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/[0.07] border border-red-500/20 text-red-400 text-[13px]">
                {runError}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* ── Running indicator ── */}
      {running && (
        <div className="flex items-center justify-center gap-3 h-44 bg-[#0e0e15] border border-white/[0.07] rounded-xl">
          <Spinner />
          <div>
            <p className="text-[13px] text-slate-400 font-medium">Running backtest…</p>
            <p className="text-[12px] text-slate-600 mt-0.5">Fetching {form.symbol} data and simulating strategy</p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {result && !running && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="space-y-5"
        >
          {/* 5 key metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard
              label="Total Return"
              value={formatPercent(result.total_return_pct)}
              sub={`${formatCurrency(result.initial_capital)} → ${formatCurrency(result.final_value)}`}
              color={result.total_return_pct >= 0 ? "text-emerald-400" : "text-red-400"}
              positive={result.total_return_pct >= 0}
            />
            <MetricCard
              label="Sharpe Ratio"
              value={formatNumber(result.sharpe_ratio)}
              sub={`Sortino: ${formatNumber(result.sortino_ratio)}`}
              color={result.sharpe_ratio >= 1 ? "text-emerald-400" : result.sharpe_ratio >= 0 ? "text-slate-100" : "text-red-400"}
            />
            <MetricCard
              label="Win Rate"
              value={formatPercent(result.win_rate_pct)}
              sub={`${result.trade_count} total trades`}
              color={result.win_rate_pct >= 50 ? "text-emerald-400" : "text-amber-400"}
            />
            <MetricCard
              label="Max Drawdown"
              value={formatPercent(result.max_drawdown_pct)}
              sub={`Vol: ${formatPercent(result.volatility_pct)}`}
              color="text-red-400"
              positive={false}
            />
            <MetricCard
              label="Profit Factor"
              value={formatNumber(result.profit_factor)}
              sub={`CAGR: ${formatPercent(result.cagr_pct)}`}
              color={result.profit_factor >= 1.5 ? "text-emerald-400" : result.profit_factor >= 1 ? "text-slate-100" : "text-red-400"}
            />
          </div>

          {/* Equity curve */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-200">
                  {result.symbol} — Equity Curve
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  {result.start_date.slice(0, 10)} → {result.end_date.slice(0, 10)} · {formatCurrency(result.initial_capital)} initial capital
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  label={formatPercent(result.total_return_pct)}
                  variant={result.total_return_pct >= 0 ? "success" : "danger"}
                />
                <Badge
                  label={`Sharpe ${result.sharpe_ratio.toFixed(2)}`}
                  variant={result.sharpe_ratio >= 1 ? "blue" : "default"}
                />
              </div>
            </CardHeader>
            <div className="px-4 pt-4 pb-3">
              <EquityCurveChart
                data={result.equity_curve}
                initialCapital={result.initial_capital}
                height={300}
              />
            </div>
          </Card>

          {/* Detailed metrics */}
          <Card>
            <CardHeader>
              <h3 className="text-[14px] font-semibold text-slate-200">Detailed Performance</h3>
              <span className="text-[12px] font-mono text-slate-500">{result.symbol}</span>
            </CardHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-white/[0.05]">
              {[
                { label: "Total Return",  value: formatPercent(result.total_return_pct),  color: result.total_return_pct >= 0 ? "text-emerald-400" : "text-red-400" },
                { label: "CAGR",          value: formatPercent(result.cagr_pct),           color: result.cagr_pct >= 0 ? "text-emerald-400" : "text-red-400" },
                { label: "Sharpe Ratio",  value: formatNumber(result.sharpe_ratio),        color: "" },
                { label: "Sortino Ratio", value: formatNumber(result.sortino_ratio),       color: "" },
                { label: "Final Value",   value: formatCurrency(result.final_value),       color: "text-slate-100" },
                { label: "Max Drawdown",  value: formatPercent(result.max_drawdown_pct),  color: "text-red-400" },
                { label: "Volatility",    value: formatPercent(result.volatility_pct),    color: "" },
                { label: "Win Rate",      value: formatPercent(result.win_rate_pct),       color: "" },
                { label: "Profit Factor", value: formatNumber(result.profit_factor),       color: "" },
                { label: "Total Trades",  value: String(result.trade_count),              color: "" },
              ].map((m) => (
                <div key={m.label} className="px-4 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-slate-500 leading-none mb-2">{m.label}</p>
                  <p className={cn("text-[15px] font-semibold tabular-nums leading-none", m.color || "text-slate-200")}>{m.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── History ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.08, ease: EASE }}
      >
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-[14px] font-semibold text-slate-200">Backtest History</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">{history.length} run{history.length !== 1 ? "s" : ""}</p>
            </div>
          </CardHeader>

          {histLoad ? (
            <div className="flex justify-center py-14"><Spinner /></div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <p className="text-[13px] text-slate-600">No backtests yet.</p>
              <p className="text-[12px] text-slate-700">Configure a backtest above and click Run.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Symbol", "Start", "End", "Capital", "Return", "Sharpe", "Drawdown", "Trades", "Status"].map((h) => (
                      <th key={h} className={cn(TH, h === "Symbol" ? "text-left" : h === "Status" ? "text-center" : "text-right")}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((bt, i) => (
                    <tr key={bt.id ?? i} className="hover:bg-white/[0.02] transition-colors">
                      <td className={cn(TD, "text-left font-mono font-semibold text-slate-100")}>{bt.symbol}</td>
                      <td className={cn(TD, "text-right text-slate-500 tabular-nums text-[12px]")}>{bt.start_date.slice(0, 10)}</td>
                      <td className={cn(TD, "text-right text-slate-500 tabular-nums text-[12px]")}>{bt.end_date.slice(0, 10)}</td>
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
                      <td className={cn(TD, "text-right text-red-400 tabular-nums")}>
                        {bt.max_drawdown_pct != null ? formatPercent(bt.max_drawdown_pct) : "—"}
                      </td>
                      <td className={cn(TD, "text-right text-slate-500")}>{bt.trade_count ?? "—"}</td>
                      <td className={cn(TD, "text-center")}>
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
