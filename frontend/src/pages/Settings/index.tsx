import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const inputCls =
  "h-8 px-3 rounded-lg bg-white/[0.03] border border-[#ffffff09] text-slate-400 text-[13px] w-full " +
  "focus:outline-none cursor-not-allowed opacity-60";
const labelCls = "text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 mb-1.5 block select-none";

interface SettingRow { label: string; value: string; desc?: string }

const SECTIONS: { title: string; rows: SettingRow[] }[] = [
  {
    title: "Alpaca Connection",
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
        <h2 className="text-[15px] font-semibold text-slate-200">Settings</h2>
        <p className="text-[13px] text-slate-600 mt-1">
          Platform configuration. Editable settings are coming in a future release.
        </p>
      </div>

      {SECTIONS.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: si * 0.06, ease: EASE }}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 mb-3">
            {section.title}
          </h3>

          <div className="rounded-xl border border-[#ffffff08] bg-white/[0.02] divide-y divide-[#ffffff05]">
            {section.rows.map((row) => (
              <div key={row.label} className="px-5 py-4 flex items-start gap-6">
                <div className="flex-1 min-w-0">
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
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, delay: 0.3, ease: EASE }}
        className="px-4 py-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/[0.10]"
      >
        <p className="text-[12px] text-amber-600/80">
          API keys and sensitive configuration are managed via environment variables on the backend server.
          They are never exposed to the frontend.
        </p>
      </motion.div>
    </motion.div>
  );
}
