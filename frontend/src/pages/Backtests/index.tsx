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

// ── Constants ─────────────────────────────────────────────────────────────────

const TODAY          = new Date().toISOString().slice(0, 10);
const FIVE_YEARS_AGO = new Date(Date.now() - 5 * 365.25 * 864e5).toISOString().slice(0, 10);
const EASE           = [0.16, 1, 0.3, 1] as const;

const TH = "px-4 py-2.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-600 whitespace-nowrap";
const TD = "px-4 py-2.5 text-[13px] border-b border-[#ffffff04] last-of-type:border-0";

// ── Input styles ──────────────────────────────────────────────────────────────

const inputCls =
  "h-8 px-3 rounded-lg bg-white/[0.03] border border-[#ffffff09] text-slate-100 text-[13px] w-full " +
  "focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-colors placeholder:text-slate-700";

const labelCls = "text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 mb-1.5 block select-none";

// ── Metric row ────────────────────────────────────────────────────────────────

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#ffffff05] last:border-0">
      <span className="text-[12px] text-slate-500">{label}</span>
      <span className={cn("text-[13px] font-semibold tabular-nums", color ?? "text-slate-200")}>
        {value}
      </span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface FormState {
  symbol: string; start_date: string; end_date: string; initial_capital: string;
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
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >

      {/* ── Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-[13px] font-semibold text-slate-200">Run Backtest</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">50 / 200 SMA Crossover Strategy</p>
            </div>
            <Badge label="SMA Crossover" variant="blue" />
          </CardHeader>

          <div className="p-5">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className={labelCls}>Symbol</label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                  placeholder="AAPL"
                  maxLength={10}
                  required
                  className={cn(inputCls, "font-mono")}
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
                <label className={labelCls}>Capital ($)</label>
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
                <Button type="submit" loading={running} className="w-full h-8">
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

      {/* ── Running ── */}
      {running && (
        <div className="flex items-center justify-center gap-3 h-40 text-slate-500 text-[13px]">
          <Spinner />
          Running backtest — this may take a moment…
        </div>
      )}

      {/* ── Results ── */}
      {result && !running && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-200">
                  {result.symbol} — Equity Curve
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {result.start_date.slice(0, 7)} → {result.end_date.slice(0, 7)} ·{" "}
                  {formatCurrency(result.initial_capital)} initial
                </p>
              </div>
              <Badge
                label={formatPercent(result.total_return_pct)}
                variant={result.total_return_pct >= 0 ? "success" : "danger"}
              />
            </CardHeader>
            <div className="p-4 pt-3">
              <EquityCurveChart
                data={result.equity_curve}
                initialCapital={result.initial_capital}
                height={280}
              />
            </div>
          </Card>

          {/* Metrics */}
          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-slate-200">Performance</h3>
              <span className="text-[11px] font-mono text-slate-600">{result.symbol}</span>
            </CardHeader>
            <div className="px-5 py-1">
              <MetricRow label="Total Return"    value={formatPercent(result.total_return_pct)}  color={result.total_return_pct >= 0 ? "text-emerald-400" : "text-red-400"} />
              <MetricRow label="CAGR"            value={formatPercent(result.cagr_pct)}           color={result.cagr_pct >= 0 ? "text-emerald-400" : "text-red-400"} />
              <MetricRow label="Final Value"     value={formatCurrency(result.final_value)}       color="text-slate-100" />
              <MetricRow label="Sharpe Ratio"    value={formatNumber(result.sharpe_ratio)} />
              <MetricRow label="Sortino Ratio"   value={formatNumber(result.sortino_ratio)} />
              <MetricRow label="Max Drawdown"    value={formatPercent(result.max_drawdown_pct)}  color="text-red-400" />
              <MetricRow label="Volatility"      value={formatPercent(result.volatility_pct)} />
              <MetricRow label="Win Rate"        value={formatPercent(result.win_rate_pct)} />
              <MetricRow label="Profit Factor"   value={formatNumber(result.profit_factor)} />
              <MetricRow label="Total Trades"    value={String(result.trade_count)} />
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── History ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.08, ease: EASE }}
      >
        <Card title="Backtest History">
          {histLoad ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : history.length === 0 ? (
            <div className="flex justify-center py-12 text-[13px] text-slate-600">
              No completed backtests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ffffff07]">
                    {["Symbol","Start","End","Capital","Return","Sharpe","Drawdown","Trades","Status"].map((h) => (
                      <th key={h} className={cn(TH, h === "Symbol" ? "text-left" : h === "Status" ? "text-center" : "text-right")}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((bt, i) => (
                    <tr key={bt.id ?? i} className="hover:bg-white/[0.015] transition-colors">
                      <td className={cn(TD, "text-left font-mono font-semibold text-slate-200")}>{bt.symbol}</td>
                      <td className={cn(TD, "text-right text-slate-600 tabular-nums text-[11px]")}>{bt.start_date.slice(0,7)}</td>
                      <td className={cn(TD, "text-right text-slate-600 tabular-nums text-[11px]")}>{bt.end_date.slice(0,7)}</td>
                      <td className={cn(TD, "text-right text-slate-400 tabular-nums")}>{formatCurrency(bt.initial_capital)}</td>
                      <td className={cn(TD, "text-right font-semibold tabular-nums", (bt.total_return_pct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {bt.total_return_pct != null ? formatPercent(bt.total_return_pct) : "—"}
                      </td>
                      <td className={cn(TD, "text-right text-slate-400 tabular-nums")}>
                        {bt.sharpe_ratio != null ? bt.sharpe_ratio.toFixed(2) : "—"}
                      </td>
                      <td className={cn(TD, "text-right text-slate-400 tabular-nums")}>
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
