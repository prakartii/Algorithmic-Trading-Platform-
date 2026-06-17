import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Strategy {
  name:        string;
  tag:         string;
  description: string;
  params:      { label: string; value: string }[];
  available:   boolean;
  metrics?:    { label: string; value: string; color?: string }[];
}

const STRATEGIES: Strategy[] = [
  {
    name: "SMA Golden Cross",
    tag:  "Trend Following",
    description:
      "Enters long when the 50-day SMA crosses above the 200-day SMA and exits " +
      "when it crosses back below. A classic long-only trend filter applicable " +
      "across equities and commodities.",
    params: [
      { label: "Fast Window",  value: "50 days"  },
      { label: "Slow Window",  value: "200 days" },
      { label: "Min History",  value: "252 bars" },
      { label: "Order Type",   value: "Market"   },
    ],
    metrics: [
      { label: "Typical CAGR",   value: "8–14%",  color: "text-emerald-400" },
      { label: "Max Drawdown",   value: "−20–35%", color: "text-red-400"    },
      { label: "Win Rate",       value: "~60%",   color: "text-slate-300"  },
    ],
    available: true,
  },
  {
    name: "Momentum (12-1)",
    tag:  "Cross-Sectional Momentum",
    description:
      "Ranks assets by their trailing 12-month return, skipping the most recent " +
      "month to avoid short-term reversal. Buys top decile performers and " +
      "rebalances monthly across the S&P 500 universe.",
    params: [
      { label: "Lookback",     value: "12 months" },
      { label: "Skip Last",    value: "1 month"   },
      { label: "Rebalance",    value: "Monthly"   },
      { label: "Universe",     value: "S&P 500"   },
    ],
    metrics: [
      { label: "Typical CAGR",   value: "10–18%",  color: "text-emerald-400" },
      { label: "Max Drawdown",   value: "−30–50%", color: "text-red-400"    },
      { label: "Sharpe",         value: "~0.7",   color: "text-slate-300"  },
    ],
    available: false,
  },
];

export default function Strategies() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-[18px] font-bold text-slate-100">Strategy Library</h2>
        <p className="text-[13px] text-slate-500 mt-1.5">
          Select a strategy to backtest against historical data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {STRATEGIES.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: i * 0.07, ease: EASE }}
          >
            <Card className="h-full flex flex-col">
              <div className="p-6 flex-1 flex flex-col">

                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-100 leading-tight">{s.name}</h3>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-600 mt-1 font-medium">
                      {s.tag}
                    </p>
                  </div>
                  <Badge
                    label={s.available ? "Available" : "Coming Soon"}
                    variant={s.available ? "success" : "warning"}
                  />
                </div>

                <p className="text-[13px] text-slate-400 leading-relaxed mb-5">{s.description}</p>

                {/* Params grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {s.params.map((p) => (
                    <div key={p.label} className="bg-white/[0.02] border border-white/[0.07] rounded-lg px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-[0.10em] text-slate-600 font-medium leading-none mb-1.5">{p.label}</p>
                      <p className="text-[13px] font-semibold text-slate-300 tabular-nums leading-none">{p.value}</p>
                    </div>
                  ))}
                </div>

                {/* Historical metrics */}
                {s.metrics && (
                  <div className="border border-white/[0.06] rounded-lg mb-5 overflow-hidden">
                    {s.metrics.map((m, idx) => (
                      <div key={m.label} className={`flex items-center justify-between px-3.5 py-2.5 ${idx < s.metrics!.length - 1 ? "border-b border-white/[0.05]" : ""}`}>
                        <span className="text-[12px] text-slate-500">{m.label}</span>
                        <span className={`text-[12px] font-semibold tabular-nums ${m.color ?? "text-slate-400"}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto">
                  <Button
                    variant={s.available ? "primary" : "secondary"}
                    size="sm"
                    disabled={!s.available}
                    onClick={() => s.available && navigate("/backtests")}
                    className="w-full"
                  >
                    {s.available ? "Backtest this strategy →" : "Not yet available"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
