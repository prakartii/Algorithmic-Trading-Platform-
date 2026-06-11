import { useState, useEffect } from "react";
import { getPortfolio, getBacktests } from "@/services/api";
import type { PortfolioResponse, BacktestListItem } from "@/types";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatPercent, formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

export default function Dashboard() {
  const [portfolio,        setPortfolio]        = useState<PortfolioResponse | null>(null);
  const [recentBacktests,  setRecentBacktests]  = useState<BacktestListItem[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPortfolio(), getBacktests(5)])
      .then(([p, b]) => {
        setPortfolio(p as PortfolioResponse);
        setRecentBacktests(b as BacktestListItem[]);
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
        <div className="text-center">
          <p className="text-red-400 font-semibold">Failed to load dashboard</p>
          <p className="text-slate-500 text-[13px] mt-1">{error ?? "Unknown error"}</p>
          <p className="text-slate-600 text-[12px] mt-2">
            Make sure the FastAPI backend is running at{" "}
            <span className="font-mono text-slate-500">localhost:8000</span>
          </p>
        </div>
      </div>
    );
  }

  const p = portfolio;
  const dayPnlPct = p.equity > 0 ? (p.day_pnl / p.equity) * 100 : 0;

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(p.portfolio_value)}
          neutral
        />
        <StatCard
          label="Equity"
          value={formatCurrency(p.equity)}
          neutral
        />
        <StatCard
          label="Cash"
          value={formatCurrency(p.cash)}
          subValue={`Buying power: ${formatCurrency(p.buying_power)}`}
          neutral
        />
        <StatCard
          label="Day P&L"
          value={formatCurrency(p.day_pnl)}
          subValue={`${dayPnlPct >= 0 ? "+" : ""}${dayPnlPct.toFixed(2)}% today`}
          positive={p.day_pnl >= 0}
        />
      </div>

      {/* ── Lower panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Open positions */}
        <Card>
          <CardHeader>
            <h3 className="text-[13px] font-semibold text-slate-200">Open Positions</h3>
            <Badge label={String(p.position_count)} />
          </CardHeader>
          {p.positions.length === 0 ? (
            <div className="py-12 text-center text-slate-600 text-[13px]">
              No open positions.{" "}
              <a href="/portfolio" className="text-blue-400 hover:underline">
                Go to Portfolio →
              </a>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#ffffff06]">
                  {(["Symbol", "Qty", "Market Value", "P&L %"] as const).map((h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-5 py-3 text-[11px] font-semibold tracking-widest uppercase text-slate-600",
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
                    <td className="px-5 py-3 font-mono font-semibold text-slate-200">{pos.symbol}</td>
                    <td className="px-5 py-3 text-right text-slate-400 tabular-nums">{pos.quantity}</td>
                    <td className="px-5 py-3 text-right text-slate-300 tabular-nums">
                      {formatCurrency(pos.market_value)}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-3 text-right tabular-nums font-semibold",
                        pos.unrealized_pnl_pct >= 0 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {formatPercent(pos.unrealized_pnl_pct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Recent backtests */}
        <Card>
          <CardHeader>
            <h3 className="text-[13px] font-semibold text-slate-200">Recent Backtests</h3>
          </CardHeader>
          {recentBacktests.length === 0 ? (
            <div className="py-12 text-center text-slate-600 text-[13px]">
              No backtests yet.{" "}
              <a href="/backtests" className="text-blue-400 hover:underline">
                Run one →
              </a>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#ffffff06]">
                  {(["Symbol", "Period", "Return", "Sharpe"] as const).map((h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-5 py-3 text-[11px] font-semibold tracking-widest uppercase text-slate-600",
                        h === "Symbol" ? "text-left" : "text-right",
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBacktests.map((bt, i) => (
                  <tr
                    key={bt.id ?? i}
                    className="border-b border-[#ffffff04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 font-mono font-semibold text-slate-200">{bt.symbol}</td>
                    <td className="px-5 py-3 text-right text-slate-500 text-[12px]">
                      {formatDate(bt.start_date).slice(0, 7)} – {formatDate(bt.end_date).slice(0, 7)}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-3 text-right tabular-nums font-semibold",
                        (bt.total_return_pct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {bt.total_return_pct != null ? formatPercent(bt.total_return_pct) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-300 tabular-nums">
                      {bt.sharpe_ratio != null ? bt.sharpe_ratio.toFixed(2) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

      </div>
    </div>
  );
}
