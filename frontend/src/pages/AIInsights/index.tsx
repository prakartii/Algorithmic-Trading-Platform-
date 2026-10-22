import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getPortfolio } from "@/services/api";
import { getLastBacktest } from "@/utils/storage";
import { generateInsights, type Severity } from "@/utils/insights";
import type { PortfolioResponse } from "@/types";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

const SEVERITY: Record<Severity, { label: string; variant: "danger" | "warning" | "default" | "success"; dot: string }> = {
  alert:    { label: "Alert",   variant: "danger",  dot: "bg-red-400" },
  warning:  { label: "Warning", variant: "warning", dot: "bg-amber-400" },
  info:     { label: "Info",    variant: "default", dot: "bg-slate-500" },
  positive: { label: "Good",    variant: "success", dot: "bg-emerald-400" },
};

export default function AIInsights() {
  const bt = useMemo(() => getLastBacktest(), []);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolio()
      .then((p) => setPortfolio(p as PortfolioResponse))
      .catch(() => setPortfolio(null))
      .finally(() => setLoading(false));
  }, []);

  const insights = useMemo(() => generateInsights(portfolio, bt), [portfolio, bt]);
  const counts = useMemo(() => {
    const c: Record<Severity, number> = { alert: 0, warning: 0, info: 0, positive: 0 };
    insights.forEach((i) => { c[i.severity] += 1; });
    return c;
  }, [insights]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        <h1 className="text-[16px] font-semibold text-slate-100">Insights</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Rule-based observations from your live paper portfolio and latest backtest.
        </p>
        {insights.length > 0 && (
          <div className="flex items-center gap-4 mt-3 text-[12px] text-slate-500">
            {(Object.keys(counts) as Severity[]).filter((k) => counts[k] > 0).map((k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={cn("w-[6px] h-[6px] rounded-full", SEVERITY[k].dot)} />
                {counts[k]} {SEVERITY[k].label.toLowerCase()}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {insights.length === 0 ? (
        <Card className="px-6 py-12 text-center">
          <p className="text-[14px] font-medium text-slate-300">Nothing to report yet</p>
          <p className="text-[13px] text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Insights appear once you have a backtest result or open paper positions.
          </p>
          <div className="flex justify-center gap-2 mt-5">
            <Link to="/backtests" className="h-8 px-3.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[13px] font-medium flex items-center transition-colors">
              Run a backtest
            </Link>
            <Link to="/paper-trading" className="h-8 px-3.5 rounded-md bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-[13px] font-medium flex items-center border border-white/[0.08] transition-colors">
              Place an order
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {insights.map((ins, i) => (
            <motion.div
              key={ins.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.05 + i * 0.04, ease: EASE }}
            >
              <Card className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className={cn("mt-[7px] w-[6px] h-[6px] rounded-full shrink-0", SEVERITY[ins.severity].dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13.5px] font-medium text-slate-100">{ins.title}</p>
                      <Badge label={SEVERITY[ins.severity].label} variant={SEVERITY[ins.severity].variant} />
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed mt-1">{ins.detail}</p>
                    <p className="text-[11px] text-slate-700 mt-2">{ins.category}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
