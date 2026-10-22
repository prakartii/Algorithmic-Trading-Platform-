import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface Command {
  id:       string;
  label:    string;
  hint:     string;
  path:     string;
  keywords?: string;
}

const COMMANDS: Command[] = [
  { id: "dashboard",  label: "Dashboard",     hint: "Go to",  path: "/" },
  { id: "portfolio",  label: "Portfolio",     hint: "Go to",  path: "/portfolio",     keywords: "holdings positions pnl" },
  { id: "strategies", label: "Strategies",    hint: "Go to",  path: "/strategies",    keywords: "library sma momentum" },
  { id: "backtests",  label: "Backtesting",   hint: "Go to",  path: "/backtests",     keywords: "run backtest simulate equity" },
  { id: "paper",      label: "Paper Trading", hint: "Go to",  path: "/paper-trading", keywords: "order buy sell trade" },
  { id: "analytics",  label: "Analytics",     hint: "Go to",  path: "/analytics",     keywords: "drawdown returns risk" },
  { id: "insights",   label: "AI Insights",   hint: "Go to",  path: "/ai-insights",   keywords: "signals alerts" },
  { id: "settings",   label: "Settings",      hint: "Go to",  path: "/settings",      keywords: "config api" },
  { id: "new-bt",     label: "Run a backtest",  hint: "Action", path: "/backtests" },
  { id: "new-order",  label: "Place a paper order", hint: "Action", path: "/paper-trading" },
];

interface Props {
  open:    boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query,  setQuery]  = useState("");
  const [cursor, setCursor] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) => `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  function run(cmd: Command | undefined) {
    if (!cmd) return;
    navigate(cmd.path);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); run(results[cursor]); }
    else if (e.key === "Escape") onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-label="Command palette"
            className="w-full max-w-[520px] rounded-xl border border-white/[0.08] bg-[#101113] shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a command or search…"
              className="w-full h-12 px-4 bg-transparent text-[14px] text-slate-100 placeholder:text-slate-600 border-b border-white/[0.06] outline-none"
            />
            <ul className="max-h-[320px] overflow-y-auto p-1.5">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-[13px] text-slate-600">No results</li>
              )}
              {results.map((cmd, i) => (
                <li key={cmd.id}>
                  <button
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => run(cmd)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 h-9 rounded-md text-left text-[13px]",
                      i === cursor ? "bg-white/[0.07] text-slate-100" : "text-slate-400",
                    )}
                  >
                    <span>{cmd.label}</span>
                    <span className="text-[11px] text-slate-600">{cmd.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
