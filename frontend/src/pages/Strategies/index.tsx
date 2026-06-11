import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface Strategy {
  name:        string;
  tag:         string;
  description: string;
  params:      { label: string; value: string }[];
  available:   boolean;
}

const STRATEGIES: Strategy[] = [
  {
    name: "SMA Golden Cross",
    tag:  "Trend Following",
    description:
      "Buys when the 50-day simple moving average crosses above the 200-day SMA, " +
      "and exits when it crosses back below. A classic long-only trend filter used " +
      "across equities and commodities.",
    params: [
      { label: "Fast Window",  value: "50 days"  },
      { label: "Slow Window",  value: "200 days" },
      { label: "Min History",  value: "252 bars" },
      { label: "Order Type",   value: "Market"   },
    ],
    available: true,
  },
  {
    name: "Momentum (12-1)",
    tag:  "Momentum",
    description:
      "Ranks assets by their trailing 12-month return, excluding the most recent month " +
      "to avoid short-term mean-reversion. Buys top performers and rebalances monthly.",
    params: [
      { label: "Lookback",   value: "12 months" },
      { label: "Skip Last",  value: "1 month"   },
      { label: "Rebalance",  value: "Monthly"   },
      { label: "Universe",   value: "S&P 500"   },
    ],
    available: false,
  },
];

export default function Strategies() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {STRATEGIES.map((s) => (
          <Card key={s.name}>
            <div className="p-5">

              {/* Header */}
              <div className="flex items-start justify-between mb-3 gap-3">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-100">{s.name}</h3>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">
                    {s.tag}
                  </p>
                </div>
                <Badge
                  label={s.available ? "Available" : "Coming Soon"}
                  variant={s.available ? "success" : "warning"}
                />
              </div>

              {/* Description */}
              <p className="text-[13px] text-slate-400 leading-relaxed mb-4">{s.description}</p>

              {/* Params grid */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {s.params.map((param) => (
                  <div
                    key={param.label}
                    className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
                      {param.label}
                    </p>
                    <p className="text-[13px] font-semibold text-slate-300 mt-0.5 tabular-nums">
                      {param.value}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                variant={s.available ? "primary" : "secondary"}
                size="sm"
                disabled={!s.available}
                onClick={() => s.available && navigate("/backtests")}
              >
                {s.available ? "Run Backtest →" : "Not yet implemented"}
              </Button>

            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
