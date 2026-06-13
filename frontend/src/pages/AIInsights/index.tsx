import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1] as const;

function SparkIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-violet-400/70">
      <path
        d="M16 4 L18.5 13.5 L28 16 L18.5 18.5 L16 28 L13.5 18.5 L4 16 L13.5 13.5 Z"
        fill="currentColor"
        opacity=".7"
      />
      <path
        d="M26 6 L27.2 10 L31 11 L27.2 12 L26 16 L24.8 12 L21 11 L24.8 10 Z"
        fill="currentColor"
        opacity=".4"
      />
    </svg>
  );
}

const PLANNED = [
  { label: "Strategy Signals",    desc: "Real-time AI-generated entry/exit signals based on backtest patterns." },
  { label: "Risk Alerts",         desc: "Automated alerts when portfolio concentration or drawdown exceeds thresholds." },
  { label: "Regime Detection",    desc: "Market regime classification: trending, mean-reverting, or volatile." },
  { label: "Optimisation Hints",  desc: "Parameter suggestions to improve Sharpe ratio of your strategies." },
  { label: "News Sentiment",      desc: "Aggregated sentiment score for holdings from financial news sources." },
  { label: "Anomaly Detection",   desc: "Statistical alerts on abnormal price action in held positions." },
];

export default function AIInsights() {
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
        className="mb-6 p-4 rounded-2xl bg-violet-500/[0.07] border border-violet-500/[0.12]"
      >
        <SparkIcon />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.1, ease: EASE }}
        className="mb-10 max-w-md"
      >
        <h1 className="text-[22px] font-bold text-slate-100 mb-2">AI Insights</h1>
        <p className="text-[14px] text-slate-500 leading-relaxed">
          Intelligent signals and strategy recommendations powered by claude-haiku-4-5. Live data integration
          with your portfolio and backtest history is coming next.
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
          to="/paper-trading"
          className="h-8 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors"
        >
          Try Paper Trading →
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
