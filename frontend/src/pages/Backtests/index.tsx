import { useState, useEffect } from "react";
import { runBacktest, getBacktests } from "@/services/api";
import type { BacktestResponse, BacktestListItem } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import EquityCurveChart from "@/components/charts/EquityCurveChart";
import { formatCurrency, formatPercent, formatDate, formatNumber } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const TODAY          = new Date().toISOString().slice(0, 10);
const FIVE_YEARS_AGO = new Date(Date.now() - 5 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10);

interface FormState {
  symbol:          string;
  start_date:      string;
  end_date:        string;
  initial_capital: string;
}

function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#ffffff04] last:border-0">
      <span className="text-[12px] text-slate-500">{label}</span>
      <span className={cn("text-[13px] font-semibold tabular-nums", highlight ? "text-slate-100" : "text-slate-300")}>
        {value}
      </span>
    </div>
  );
}

export default function Backtests() {
  const [form, setForm] = useState<FormState>({
    symbol:          "AAPL",
    start_date:      FIVE_YEARS_AGO,
    end_date:        TODAY,
    initial_capital: "10000",
  });
  const [running,        setRunning]        = useState(false);
  const [result,         setResult]         = useState<BacktestResponse | null>(null);
  const [runError,       setRunError]       = useState<string | null>(null);
  const [history,        setHistory]        = useState<BacktestListItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    getBacktests(20)
      .then((data) => setHistory(data as BacktestListItem[]))
      .catch(() => { /* history is non-critical */ })
      .finally(() => setHistoryLoading(false));
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
      });
      setResult(data as BacktestResponse);
      // refresh history in background
      getBacktests(20)
        .then((d) => setHistory(d as BacktestListItem[]))
        .catch(() => {});
    } catch (err: unknown) {
      setRunError(err instanceof Error ? err.message : "Backtest failed.");
    } finally {
      setRunning(false);
    }
  }

  const field = "flex flex-col gap-1.5";
  const inputCls =
    "h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-100 text-[13px] " +
    "focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-colors";
  const labelCls = "text-[11px] font-semibold uppercase tracking-widest text-slate-500";

  return (
    <div className="space-y-6">

      {/* ── Form ── */}
      <Card>
        <CardHeader>
          <h3 className="text-[13px] font-semibold text-slate-200">Run Backtest</h3>
          <Badge label="50 / 200 SMA Crossover" />
        </CardHeader>
        <div className="p-5">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end"
          >
            <div className={field}>
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

            <div className={field}>
              <label className={labelCls}>Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                required
                className={cn(inputCls, "[color-scheme:dark]")}
              />
            </div>

            <div className={field}>
              <label className={labelCls}>End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                required
                className={cn(inputCls, "[color-scheme:dark]")}
              />
            </div>

            <div className={field}>
              <label className={labelCls}>Capital ($)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.initial_capital}
                  onChange={(e) => setForm((f) => ({ ...f, initial_capital: e.target.value }))}
                  min={1000}
                  step={1000}
                  required
                  className={cn(inputCls, "flex-1 tabular-nums")}
                />
                <Button type="submit" loading={running} size="sm" className="h-9 shrink-0">
                  Run
                </Button>
              </div>
            </div>
          </form>

          {runError && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
              {runError}
            </div>
          )}
        </div>
      </Card>

      {/* ── Running indicator ── */}
      {running && (
        <div className="flex items-center justify-center gap-3 h-40 text-slate-500 text-[13px]">
          <Spinner />
          Running backtest — this may take a few seconds…
        </div>
      )}

      {/* ── Results ── */}
      {result && !running && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <span className="text-[13px] font-semibold text-slate-200">
                {result.symbol} — Equity Curve
              </span>
              <Badge
                label={formatPercent(result.total_return_pct)}
                variant={result.total_return_pct >= 0 ? "success" : "danger"}
              />
            </CardHeader>
            <div className="pt-4 pb-2">
              <EquityCurveChart
                data={result.equity_curve}
                initialCapital={result.initial_capital}
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-slate-200">Performance</h3>
            </CardHeader>
            <div className="px-5 py-1">
              <MetricRow label="Total Return"    value={formatPercent(result.total_return_pct)} highlight />
              <MetricRow label="CAGR"            value={formatPercent(result.cagr_pct)} />
              <MetricRow label="Sharpe Ratio"    value={formatNumber(result.sharpe_ratio)} />
              <MetricRow label="Sortino Ratio"   value={formatNumber(result.sortino_ratio)} />
              <MetricRow label="Max Drawdown"    value={formatPercent(result.max_drawdown_pct)} />
              <MetricRow label="Volatility"      value={formatPercent(result.volatility_pct)} />
              <MetricRow label="Win Rate"        value={formatPercent(result.win_rate_pct)} />
              <MetricRow label="Profit Factor"   value={formatNumber(result.profit_factor)} />
              <MetricRow label="Trades"          value={String(result.trade_count)} />
              <MetricRow label="Initial Capital" value={formatCurrency(result.initial_capital)} />
              <MetricRow label="Final Value"     value={formatCurrency(result.final_value)} highlight />
            </div>
          </Card>
        </div>
      )}

      {/* ── History ── */}
      <Card title="Backtest History">
        {historyLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-600 text-[13px]">
            No completed backtests yet. Run one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#ffffff06]">
                  {(["Symbol","Start","End","Capital","Return","Sharpe","Drawdown","Trades","Status"] as const).map((h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-slate-600",
                        h === "Symbol" ? "text-left" : h === "Status" ? "text-center" : "text-right",
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((bt, i) => (
                  <tr
                    key={bt.id ?? i}
                    className="border-b border-[#ffffff04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-slate-200">{bt.symbol}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{formatDate(bt.start_date)}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{formatDate(bt.end_date)}</td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                      {formatCurrency(bt.initial_capital)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right tabular-nums font-semibold",
                        (bt.total_return_pct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {bt.total_return_pct != null ? formatPercent(bt.total_return_pct) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                      {bt.sharpe_ratio != null ? bt.sharpe_ratio.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                      {bt.max_drawdown_pct != null ? formatPercent(bt.max_drawdown_pct) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {bt.trade_count ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        label={bt.status}
                        variant={
                          bt.status === "completed"
                            ? "success"
                            : bt.status === "failed"
                            ? "danger"
                            : "warning"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
}
