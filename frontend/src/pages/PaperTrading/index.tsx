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
const TH   = "px-4 py-2.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-600 whitespace-nowrap";
const TD   = "px-4 py-3 text-[13px] border-b border-[#ffffff04] last-of-type:border-0";

const inputCls =
  "h-8 px-3 rounded-lg bg-white/[0.03] border border-[#ffffff09] text-slate-100 text-[13px] w-full " +
  "focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-colors placeholder:text-slate-700";
const labelCls = "text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 mb-1.5 block select-none";

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
      // Refresh portfolio
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
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >

      {/* ── Stats ── */}
      {p && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Portfolio Value", value: formatCurrency(p.portfolio_value), positive: undefined },
            { label: "Cash",            value: formatCurrency(p.cash),            positive: undefined },
            { label: "Buying Power",    value: formatCurrency(p.buying_power),    positive: undefined },
            { label: "Unrealized P&L",  value: formatCurrency(p.unrealized_pnl), positive: p.unrealized_pnl >= 0 ? true : false },
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Order form ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.16, ease: EASE }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-slate-200">New Order</h3>
              <Badge label="PAPER" variant="blue" />
            </CardHeader>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Symbol */}
              <div>
                <label className={labelCls}>Symbol</label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                  placeholder="AAPL, BTCUSD…"
                  maxLength={10}
                  required
                  className={cn(inputCls, "font-mono")}
                />
              </div>

              {/* Side toggle */}
              <div>
                <label className={labelCls}>Side</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["buy", "sell"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, side: s }))}
                      className={cn(
                        "h-8 rounded-lg text-[12px] font-semibold border transition-all",
                        form.side === s
                          ? s === "buy"
                            ? "bg-emerald-500/[0.12] text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/[0.12] text-red-400 border-red-500/30"
                          : "bg-white/[0.03] text-slate-500 border-[#ffffff08] hover:border-[#ffffff12] hover:text-slate-300",
                      )}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order type toggle */}
              <div>
                <label className={labelCls}>Order Type</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["market", "limit"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, order_type: t }))}
                      className={cn(
                        "h-8 rounded-lg text-[12px] font-semibold border transition-all",
                        form.order_type === t
                          ? "bg-blue-500/[0.10] text-blue-400 border-blue-500/30"
                          : "bg-white/[0.03] text-slate-500 border-[#ffffff08] hover:border-[#ffffff12] hover:text-slate-300",
                      )}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className={labelCls}>
                  Quantity {form.side === "sell" && <span className="text-slate-700 normal-case">(leave blank to close all)</span>}
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  placeholder={form.side === "buy" ? "Required" : "Optional"}
                  min={0}
                  step="any"
                  required={form.side === "buy"}
                  className={inputCls}
                />
              </div>

              {/* Limit price */}
              {form.order_type === "limit" && (
                <div>
                  <label className={labelCls}>Limit Price ($)</label>
                  <input
                    type="number"
                    value={form.limit_price}
                    onChange={(e) => setForm((f) => ({ ...f, limit_price: e.target.value }))}
                    placeholder="e.g. 150.00"
                    min={0}
                    step="any"
                    required
                    className={inputCls}
                  />
                </div>
              )}

              {/* Feedback */}
              {orderErr && (
                <div className="px-3.5 py-2.5 rounded-lg bg-red-500/[0.07] border border-red-500/20 text-red-400 text-[12px]">
                  {orderErr}
                </div>
              )}
              {orderOk && (
                <div className="px-3.5 py-2.5 rounded-lg bg-emerald-500/[0.07] border border-emerald-500/20 text-emerald-400 text-[12px]">
                  {orderOk}
                </div>
              )}

              <Button
                type="submit"
                loading={placing}
                variant={form.side === "buy" ? "primary" : "danger"}
                className="w-full"
              >
                {form.side === "buy" ? "Buy" : "Sell"} {form.symbol || "—"}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* ── Positions ── */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.2, ease: EASE }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-slate-200">Open Positions</h3>
              <Button size="sm" variant="secondary" onClick={loadPortfolio} disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Refresh"}
              </Button>
            </CardHeader>

            {loading ? (
              <div className="flex justify-center py-16"><Spinner /></div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-[13px] text-slate-600">{error}</p>
                <button onClick={loadPortfolio} className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">Retry</button>
              </div>
            ) : !p || p.positions.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-[13px] text-slate-600">
                No open positions
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
                      <th className={cn(TH, "text-right")}>Current</th>
                      <th className={cn(TH, "text-right")}>Value</th>
                      <th className={cn(TH, "text-right")}>P&amp;L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.positions.map((pos) => (
                      <tr key={pos.symbol} className="hover:bg-white/[0.015] transition-colors">
                        <td className={cn(TD, "font-mono font-bold text-slate-100")}>{pos.symbol}</td>
                        <td className={cn(TD, "text-right")}>
                          <span className={cn("text-[10px] font-semibold uppercase", pos.side === "long" ? "text-emerald-500" : "text-red-500")}>
                            {pos.side}
                          </span>
                        </td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{pos.quantity}</td>
                        <td className={cn(TD, "text-right text-slate-500 tabular-nums")}>{formatCurrency(pos.avg_cost)}</td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{formatCurrency(pos.current_price)}</td>
                        <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{formatCurrency(pos.market_value)}</td>
                        <td className={cn(TD, "text-right font-semibold tabular-nums", pos.unrealized_pnl_pct >= 0 ? "text-emerald-400" : "text-red-400")}>
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

      </div>

      {/* ── Order log ── */}
      {orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <Card title="Order Log (this session)">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ffffff07]">
                    {["Order ID","Symbol","Side","Qty","Type","Limit","Status","Submitted"].map((h) => (
                      <th key={h} className={cn(TH, h === "Symbol" ? "text-left" : "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_id} className="hover:bg-white/[0.015] transition-colors">
                      <td className={cn(TD, "text-right font-mono text-slate-600 text-[11px]")}>
                        {o.order_id.slice(0, 8)}…
                      </td>
                      <td className={cn(TD, "text-left font-mono font-semibold text-slate-200")}>{o.symbol}</td>
                      <td className={cn(TD, "text-right")}>
                        <span className={cn("text-[10px] font-semibold uppercase", o.side === "buy" ? "text-emerald-400" : "text-red-400")}>
                          {o.side}
                        </span>
                      </td>
                      <td className={cn(TD, "text-right text-slate-300 tabular-nums")}>{o.quantity}</td>
                      <td className={cn(TD, "text-right text-slate-500")}>{o.order_type}</td>
                      <td className={cn(TD, "text-right text-slate-500 tabular-nums")}>
                        {o.limit_price ? formatCurrency(o.limit_price) : "—"}
                      </td>
                      <td className={cn(TD, "text-right")}>
                        <Badge label={o.status} variant={o.status === "filled" ? "success" : "warning"} />
                      </td>
                      <td className={cn(TD, "text-right text-slate-600 text-[11px]")}>
                        {new Date(o.submitted_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
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
