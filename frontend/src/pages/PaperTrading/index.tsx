import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { placePaperTrade, getPortfolio } from "@/services/api";
import type { PortfolioResponse, OrderResponse } from "@/types";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const TH   = "px-4 py-3 text-[11px] font-medium tracking-[0.07em] uppercase text-slate-500 whitespace-nowrap";
const TD   = "px-4 py-[11px] text-[13px] border-b border-white/[0.04] last:border-0";

const inputCls =
  "h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-100 text-[13px] w-full " +
  "focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors placeholder:text-slate-700";

const labelCls = "text-[11px] font-medium uppercase tracking-[0.09em] text-slate-500 mb-1.5 block select-none";

interface OrderForm {
  symbol:      string;
  side:        "buy" | "sell";
  quantity:    string;
  limit_price: string;
  order_type:  "market" | "limit";
}

export default function PaperTrading() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [orders,    setOrders]    = useState<OrderResponse[]>([]);
  const [placing,   setPlacing]   = useState(false);
  const [orderErr,  setOrderErr]  = useState<string | null>(null);
  const [orderOk,   setOrderOk]   = useState<string | null>(null);

  const [form, setForm] = useState<OrderForm>({
    symbol: "", side: "buy", quantity: "", limit_price: "", order_type: "market",
  });

  const loadPortfolio = useCallback(() => {
    setLoading(true);
    setError(null);
    getPortfolio()
      .then((d) => setPortfolio(d as PortfolioResponse))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadPortfolio(); }, [loadPortfolio]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.symbol.trim()) return;

    setPlacing(true);
    setOrderErr(null);
    setOrderOk(null);

    try {
      const qty   = parseFloat(form.quantity) || undefined;
      const limit = form.order_type === "limit" && form.limit_price ? parseFloat(form.limit_price) : undefined;

      const result = await placePaperTrade({
        symbol:      form.symbol.toUpperCase(),
        side:        form.side,
        quantity:    qty,
        limit_price: limit,
      }) as OrderResponse;

      setOrders((prev) => [result, ...prev]);
      setOrderOk(`Order ${result.order_id.slice(0, 8)}… submitted — ${result.status}`);
      setForm((f) => ({ ...f, symbol: "", quantity: "", limit_price: "" }));
      getPortfolio().then((d) => setPortfolio(d as PortfolioResponse)).catch(() => {});
    } catch (err: unknown) {
      setOrderErr(err instanceof Error ? err.message : "Order failed.");
    } finally {
      setPlacing(false);
    }
  }

  const p = portfolio;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="space-y-5"
    >

      {/* ── Stats ── */}
      {p && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Portfolio Value", value: formatCurrency(p.portfolio_value), positive: undefined },
            { label: "Cash",            value: formatCurrency(p.cash),            positive: undefined },
            { label: "Buying Power",    value: formatCurrency(p.buying_power),    positive: undefined },
            { label: "Unrealized P&L",  value: formatCurrency(p.unrealized_pnl), positive: p.unrealized_pnl !== 0 ? p.unrealized_pnl >= 0 : undefined },
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Order form ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.20, ease: EASE }}
        >
          <Card className="h-full">
            <CardHeader>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-200">New Order</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">Paper trading · no real capital at risk</p>
              </div>
              <Badge label="PAPER" variant="blue" />
            </CardHeader>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              {/* Symbol */}
              <div>
                <label className={labelCls}>Ticker Symbol</label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                  placeholder="AAPL, MSFT, TSLA…"
                  maxLength={10}
                  required
                  className={cn(inputCls, "font-mono font-semibold tracking-wide")}
                />
              </div>

              {/* Side */}
              <div>
                <label className={labelCls}>Order Side</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["buy", "sell"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, side: s }))}
                      className={cn(
                        "h-9 rounded-lg text-[13px] font-semibold border transition-all",
                        form.side === s
                          ? s === "buy"
                            ? "bg-emerald-500/[0.14] text-emerald-400 border-emerald-500/35"
                            : "bg-red-500/[0.14] text-red-400 border-red-500/35"
                          : "bg-white/[0.03] text-slate-500 border-white/[0.08] hover:border-white/[0.14] hover:text-slate-300",
                      )}
                    >
                      {s === "buy" ? "Buy / Long" : "Sell / Short"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order type */}
              <div>
                <label className={labelCls}>Order Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["market", "limit"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, order_type: t }))}
                      className={cn(
                        "h-9 rounded-lg text-[13px] font-semibold border transition-all",
                        form.order_type === t
                          ? "bg-blue-500/[0.12] text-blue-400 border-blue-500/35"
                          : "bg-white/[0.03] text-slate-500 border-white/[0.08] hover:border-white/[0.14] hover:text-slate-300",
                      )}
                    >
                      {t === "market" ? "Market" : "Limit"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className={labelCls}>
                  Quantity
                  {form.side === "sell" && (
                    <span className="ml-1 text-slate-700 normal-case font-normal">(blank = close all)</span>
                  )}
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  placeholder={form.side === "buy" ? "Number of shares" : "Shares to sell"}
                  min={0}
                  step="any"
                  required={form.side === "buy"}
                  className={inputCls}
                />
              </div>

              {/* Limit price */}
              {form.order_type === "limit" && (
                <div>
                  <label className={labelCls}>Limit Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[13px]">$</span>
                    <input
                      type="number"
                      value={form.limit_price}
                      onChange={(e) => setForm((f) => ({ ...f, limit_price: e.target.value }))}
                      placeholder="0.00"
                      min={0}
                      step="any"
                      required
                      className={cn(inputCls, "pl-7")}
                    />
                  </div>
                </div>
              )}

              {/* Feedback */}
              {orderErr && (
                <div className="px-3.5 py-2.5 rounded-lg bg-red-500/[0.07] border border-red-500/20 text-red-400 text-[13px]">
                  {orderErr}
                </div>
              )}
              {orderOk && (
                <div className="px-3.5 py-2.5 rounded-lg bg-emerald-500/[0.07] border border-emerald-500/20 text-emerald-400 text-[13px]">
                  {orderOk}
                </div>
              )}

              <Button
                type="submit"
                loading={placing}
                variant={form.side === "buy" ? "primary" : "danger"}
                className="w-full h-10 text-[13px]"
              >
                {placing ? "Submitting…" : (
                  <span>
                    {form.side === "buy" ? "Buy" : "Sell"}
                    {form.symbol ? ` ${form.symbol}` : ""}
                    {form.quantity ? ` · ${form.quantity} shares` : ""}
                  </span>
                )}
              </Button>

              <p className="text-[11px] text-slate-700 text-center leading-relaxed">
                Paper trading only · All orders are simulated
              </p>
            </form>
          </Card>
        </motion.div>

        {/* ── Positions ── */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.24, ease: EASE }}
        >
          <Card className="h-full">
            <CardHeader>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-200">Open Positions</h3>
                {p && p.unrealized_pnl !== 0 && (
                  <p className={cn(
                    "text-[12px] font-semibold tabular-nums mt-0.5",
                    p.unrealized_pnl >= 0 ? "text-emerald-400" : "text-red-400",
                  )}>
                    {p.unrealized_pnl >= 0 ? "+" : ""}{formatCurrency(p.unrealized_pnl)} unrealized
                  </p>
                )}
              </div>
              <Button size="sm" variant="secondary" onClick={loadPortfolio} disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Refresh"}
              </Button>
            </CardHeader>

            {loading ? (
              <div className="flex justify-center py-16"><Spinner /></div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-[13px] text-slate-600">{error}</p>
                <button onClick={loadPortfolio} className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Retry
                </button>
              </div>
            ) : !p || p.positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 gap-2">
                <p className="text-[13px] text-slate-600">No open positions</p>
                <p className="text-[12px] text-slate-700">Place a buy order to open a position</p>
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
                      <th className={cn(TH, "text-right")}>Current</th>
                      <th className={cn(TH, "text-right")}>Value</th>
                      <th className={cn(TH, "text-right")}>P&amp;L</th>
                      <th className={cn(TH, "text-right")}>P&amp;L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.positions.map((pos) => (
                      <tr key={pos.symbol} className="hover:bg-white/[0.02] transition-colors">
                        <td className={cn(TD, "font-mono font-bold text-slate-100")}>{pos.symbol}</td>
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

                <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                  <span className="text-[11px] text-slate-600 uppercase tracking-wider">Portfolio</span>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-600 block">Cash</span>
                      <span className="text-[13px] font-semibold text-slate-300 tabular-nums">{formatCurrency(p.cash)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-600 block">Total Value</span>
                      <span className="text-[13px] font-semibold text-slate-100 tabular-nums">{formatCurrency(p.portfolio_value)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

      </div>

      {/* ── Order log ── */}
      {orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: EASE }}
        >
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-200">Order History</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">This session · {orders.length} order{orders.length !== 1 ? "s" : ""}</p>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Order ID", "Symbol", "Side", "Qty", "Type", "Limit", "Status", "Time"].map((h) => (
                      <th key={h} className={cn(TH, h === "Symbol" ? "text-left" : "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className={cn(TD, "text-right font-mono text-slate-600 text-[11px]")}>
                        {o.order_id.slice(0, 8)}…
                      </td>
                      <td className={cn(TD, "text-left font-mono font-bold text-slate-100")}>{o.symbol}</td>
                      <td className={cn(TD, "text-right")}>
                        <span className={cn(
                          "text-[10px] font-semibold uppercase tracking-[0.06em]",
                          o.side === "buy" ? "text-emerald-400" : "text-red-400",
                        )}>
                          {o.side}
                        </span>
                      </td>
                      <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{o.quantity}</td>
                      <td className={cn(TD, "text-right text-slate-500 capitalize")}>{o.order_type}</td>
                      <td className={cn(TD, "text-right text-slate-500 tabular-nums")}>
                        {o.limit_price ? formatCurrency(o.limit_price) : "—"}
                      </td>
                      <td className={cn(TD, "text-right")}>
                        <Badge
                          label={o.status}
                          variant={o.status === "filled" ? "success" : o.status === "pending" ? "warning" : "default"}
                        />
                      </td>
                      <td className={cn(TD, "text-right text-slate-600 text-[12px] tabular-nums")}>
                        {new Date(o.submitted_at).toLocaleTimeString("en-US", {
                          hour: "2-digit", minute: "2-digit", second: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

    </motion.div>
  );
}
