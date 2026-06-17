import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const inputCls =
  "h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.07] text-slate-500 text-[13px] w-full " +
  "focus:outline-none cursor-not-allowed opacity-70 select-none";

const labelCls = "text-[11px] font-medium uppercase tracking-[0.09em] text-slate-500 mb-1.5 block select-none";

interface SettingRow { label: string; value: string; desc?: string }

const SECTIONS: { title: string; desc?: string; rows: SettingRow[] }[] = [
  {
    title: "Alpaca Connection",
    desc:  "Paper trading account connected via Alpaca Markets API.",
    rows: [
      { label: "Environment",  value: "Paper Trading",               desc: "Switch to live trading in a future release." },
      { label: "API Key",      value: "•••••••••••••••••PK3AAPL",    desc: "Configured via ALPACA_API_KEY environment variable." },
      { label: "Base URL",     value: "https://paper-api.alpaca.markets", desc: "Alpaca paper trading API endpoint." },
    ],
  },
  {
    title: "Default Order Settings",
    rows: [
      { label: "Default Size",      value: "1 share",        desc: "Override per order on the Paper Trading page." },
      { label: "Stocks TIF",        value: "DAY",            desc: "Time-in-force for equity orders." },
      { label: "Crypto TIF",        value: "GTC",            desc: "Time-in-force for crypto orders (BTCUSD, ETHUSD…)." },
    ],
  },
  {
    title: "Backtesting Defaults",
    rows: [
      { label: "Initial Capital",   value: "$10,000",        desc: "Default starting capital for new backtests." },
      { label: "Date Range",        value: "5 years",        desc: "Rolling window from today." },
    ],
  },
];

export default function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="max-w-xl space-y-8"
    >
      <div>
        <h2 className="text-[18px] font-bold text-slate-100">Settings</h2>
        <p className="text-[13px] text-slate-500 mt-1.5">
          Platform configuration. Editable settings are coming in a future release.
        </p>
      </div>

      {SECTIONS.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: si * 0.07, ease: EASE }}
        >
          <div className="mb-3">
            <h3 className="text-[13px] font-semibold text-slate-300">{section.title}</h3>
            {section.desc && (
              <p className="text-[12px] text-slate-600 mt-0.5">{section.desc}</p>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#0e0e15] divide-y divide-white/[0.05] overflow-hidden">
            {section.rows.map((row) => (
              <div key={row.label} className="px-5 py-4">
                <label className={labelCls}>{row.label}</label>
                <input
                  type="text"
                  value={row.value}
                  readOnly
                  disabled
                  className={inputCls}
                />
                {row.desc && (
                  <p className="text-[11px] text-slate-700 mt-1.5">{row.desc}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, delay: 0.3, ease: EASE }}
        className="px-4 py-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/[0.12]"
      >
        <p className="text-[12px] text-amber-600/80 leading-relaxed">
          API keys and sensitive configuration are managed via environment variables on the backend server.
          They are never exposed to the frontend.
        </p>
      </motion.div>
    </motion.div>
  );
}
