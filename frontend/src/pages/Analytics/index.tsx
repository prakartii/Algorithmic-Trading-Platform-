import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1] as const;

function BarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-blue-400/60">
      <rect x="4"  y="18" width="5" height="10" rx="1.5" fill="currentColor" opacity=".5" />
      <rect x="12" y="11" width="5" height="17" rx="1.5" fill="currentColor" opacity=".7" />
      <rect x="20" y="6"  width="5" height="22" rx="1.5" fill="currentColor" />
      <path d="M3 28h26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".2" />
    </svg>
  );
}

const PLANNED = [
  { label: "P&L Attribution",     desc: "Break down returns by strategy, sector, and time period." },
  { label: "Drawdown Analysis",    desc: "Visualise peak-to-trough periods with recovery timelines." },
  { label: "Rolling Metrics",      desc: "90-day rolling Sharpe, Sortino, and Calmar ratios." },
  { label: "Correlation Matrix",   desc: "Cross-asset correlation heatmap for your portfolio." },
  { label: "Factor Exposure",      desc: "Decompose returns into Fama-French and momentum factors." },
  { label: "Benchmark Comparison", desc: "Side-by-side alpha vs SPY/QQQ with information ratio." },
];

export default function Analytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05, ease: EASE }}
        className="mb-6 p-4 rounded-2xl bg-blue-500/[0.07] border border-blue-500/[0.12]"
      >
        <BarIcon />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.1, ease: EASE }}
        className="mb-10 max-w-md"
      >
        <h1 className="text-[22px] font-bold text-slate-100 mb-2">Analytics</h1>
        <p className="text-[14px] text-slate-500 leading-relaxed">
          Deep portfolio analytics are in development. Run backtests and place paper trades to generate data —
          the insights will surface here automatically.
        </p>
      </motion.div>

      {/* Planned features */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.14, ease: EASE }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl w-full mb-10"
      >
        {PLANNED.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.18 + i * 0.04, ease: EASE }}
            className="text-left px-4 py-3.5 rounded-xl bg-white/[0.025] border border-[#ffffff08]"
          >
            <p className="text-[12px] font-semibold text-slate-300 mb-1">{f.label}</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, delay: 0.4, ease: EASE }}
        className="flex items-center gap-3"
      >
        <Link
          to="/backtests"
          className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors"
        >
          Run a Backtest →
        </Link>
        <Link
          to="/"
          className="h-8 px-4 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] text-slate-300 text-[13px] font-medium flex items-center transition-colors border border-[#ffffff08]"
        >
          Go to Dashboard
        </Link>
      </motion.div>
    </motion.div>
  );
}
