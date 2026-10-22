import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getHealth, type HealthResponse } from "@/services/api";
import { getPreferences, savePreferences, DEFAULT_PREFS } from "@/utils/storage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const EASE = [0.16, 1, 0.3, 1] as const;

const inputCls =
  "h-8 px-3 rounded-md bg-white/[0.03] border border-white/[0.08] text-slate-200 text-[13px] w-full " +
  "placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.04] transition-colors";

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4 border-b border-white/[0.05] last:border-0">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-200">{label}</p>
        {desc && <p className="text-[12px] text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

type Conn = "checking" | "up" | "down";

export default function Settings() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [conn,   setConn]   = useState<Conn>("checking");
  const [prefs,  setPrefs]  = useState(getPreferences);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    getHealth()
      .then((h) => { setHealth(h); setConn("up"); })
      .catch(() => setConn("down"));
  }, []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const next = {
      defaultCapital: Math.max(100, Number(prefs.defaultCapital) || DEFAULT_PREFS.defaultCapital),
      defaultYears:   Math.min(20, Math.max(2, Number(prefs.defaultYears) || DEFAULT_PREFS.defaultYears)),
    };
    setPrefs(next);
    savePreferences(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const status = (ok: boolean | undefined) =>
    conn === "checking" ? <Badge label="Checking" />
      : ok ? <Badge label="Connected" variant="success" />
      : <Badge label="Not configured" variant="warning" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="max-w-2xl space-y-7"
    >
      <div>
        <h1 className="text-[16px] font-semibold text-slate-100">Settings</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">Connection status and your local defaults.</p>
      </div>

      <section>
        <h2 className="text-[12px] font-medium text-slate-500 mb-2.5">Backend</h2>
        <Card>
          <Row label="API server" desc="FastAPI service the dashboard talks to (proxied at /api).">
            {conn === "checking" ? <Badge label="Checking" />
              : conn === "up" ? <Badge label="Online" variant="success" />
              : <Badge label="Offline" variant="danger" />}
          </Row>
          <Row label="Alpaca paper trading" desc="Set ALPACA_API_KEY and ALPACA_SECRET_KEY in backend/.env.">
            {status(health?.alpaca)}
          </Row>
          <Row label="Supabase persistence" desc="Without it, backtest history is kept in memory until restart.">
            {status(health?.supabase)}
          </Row>
        </Card>
        {conn === "down" && (
          <p className="text-[12px] text-red-400/90 mt-2.5">
            Cannot reach the API. Start it with <span className="font-mono">uvicorn main:app --port 8000</span> from the backend folder.
          </p>
        )}
      </section>

      <form onSubmit={save}>
        <h2 className="text-[12px] font-medium text-slate-500 mb-2.5">Backtesting defaults</h2>
        <Card>
          <Row label="Initial capital" desc="Starting balance pre-filled on the Backtesting page.">
            <input
              type="number" min={100} step={100} className={inputCls + " w-36 text-right tabular-nums"}
              value={prefs.defaultCapital}
              onChange={(e) => setPrefs({ ...prefs, defaultCapital: Number(e.target.value) })}
            />
          </Row>
          <Row label="History window (years)" desc="How far back the default date range starts. Minimum 2.">
            <input
              type="number" min={2} max={20} className={inputCls + " w-36 text-right tabular-nums"}
              value={prefs.defaultYears}
              onChange={(e) => setPrefs({ ...prefs, defaultYears: Number(e.target.value) })}
            />
          </Row>
        </Card>
        <div className="flex items-center gap-3 mt-3">
          <Button type="submit" size="md">Save defaults</Button>
          {saved && <span className="text-[12px] text-emerald-400">Saved</span>}
        </div>
      </form>

      <p className="text-[12px] text-slate-600 leading-relaxed">
        API keys live in <span className="font-mono">backend/.env</span> and are never sent to the browser.
      </p>
    </motion.div>
  );
}
