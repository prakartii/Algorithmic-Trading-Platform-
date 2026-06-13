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
  metrics?:    { label: string; value: string }[];
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
      { label: "Typical CAGR",   value: "8–14%"  },
      { label: "Max Drawdown",   value: "−20–35%" },
      { label: "Win Rate",       value: "~60%"   },
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
      { label: "Typical CAGR",   value: "10–18%"  },
      { label: "Max Drawdown",   value: "−30–50%" },
      { label: "Sharpe",         value: "~0.7"    },
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
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h2 className="text-[15px] font-semibold text-slate-200">Strategy Library</h2>
        <p className="text-[13px] text-slate-600 mt-1">
          Select a strategy to backtest against historical data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {STRATEGIES.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.06, ease: EASE }}
          >
            <Card className="h-full flex flex-col">
              <div className="p-5 flex-1">

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-100 leading-tight">{s.name}</h3>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-600 mt-1 font-semibold">
                      {s.tag}
                    </p>
                  </div>
                  <Badge
                    label={s.available ? "Available" : "Coming Soon"}
                    variant={s.available ? "success" : "warning"}
                  />
                </div>

                {/* Description */}
                <p className="text-[13px] text-slate-400 leading-relaxed mb-5">{s.description}</p>

                {/* Params */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {s.params.map((p) => (
                    <div key={p.label} className="bg-white/[0.025] border border-[#ffffff07] rounded-lg px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-700 font-semibold">{p.label}</p>
                      <p className="text-[13px] font-semibold text-slate-300 mt-0.5 tabular-nums">{p.value}</p>
                    </div>
                  ))}
                </div>

                {/* Historical metrics */}
                {s.metrics && (
                  <div className="border border-[#ffffff06] rounded-lg divide-y divide-[#ffffff05] mb-5">
                    {s.metrics.map((m) => (
                      <div key={m.label} className="flex items-center justify-between px-3.5 py-2">
                        <span className="text-[11px] text-slate-600">{m.label}</span>
                        <span className="text-[12px] font-semibold text-slate-400 tabular-nums">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant={s.available ? "primary" : "secondary"}
                  size="sm"
                  disabled={!s.available}
                  onClick={() => s.available && navigate("/backtests")}
                  className="w-full"
                >
                  {s.available ? "Run Backtest →" : "Not yet available"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
