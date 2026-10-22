import type { EquityPoint } from "@/types";

export interface DrawdownPoint {
  date:  string;
  value: number; // percent, <= 0
}

export interface MonthlyReturn {
  year:   number;
  months: (number | null)[]; // 12 entries, percent
  total:  number;            // calendar-year return, percent
}

export function drawdownSeries(curve: EquityPoint[]): DrawdownPoint[] {
  let peak = -Infinity;
  return curve.map((p) => {
    peak = Math.max(peak, p.value);
    return { date: p.date, value: peak > 0 ? ((p.value - peak) / peak) * 100 : 0 };
  });
}

/** Month-over-month returns, each month measured from the previous month's close. */
export function monthlyReturns(curve: EquityPoint[]): MonthlyReturn[] {
  if (curve.length < 2) return [];

  const lastOfMonth = new Map<string, number>();
  for (const p of curve) lastOfMonth.set(p.date.slice(0, 7), p.value);

  const keys = [...lastOfMonth.keys()].sort();
  const byYear = new Map<number, (number | null)[]>();
  const yearStart = new Map<number, number>();
  const yearEnd = new Map<number, number>();

  let prev = curve[0].value;
  for (const key of keys) {
    const year = Number(key.slice(0, 4));
    const month = Number(key.slice(5, 7)) - 1;
    const close = lastOfMonth.get(key)!;

    if (!byYear.has(year)) {
      byYear.set(year, Array(12).fill(null));
      yearStart.set(year, prev);
    }
    byYear.get(year)![month] = prev > 0 ? ((close - prev) / prev) * 100 : 0;
    yearEnd.set(year, close);
    prev = close;
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, months]) => {
      const start = yearStart.get(year)!;
      const end = yearEnd.get(year)!;
      return { year, months, total: start > 0 ? ((end - start) / start) * 100 : 0 };
    });
}

/** Annualised rolling volatility (percent) over `window` daily returns. */
export function rollingVolatility(curve: EquityPoint[], window = 60): DrawdownPoint[] {
  const rets: number[] = [];
  for (let i = 1; i < curve.length; i++) {
    rets.push(curve[i - 1].value > 0 ? curve[i].value / curve[i - 1].value - 1 : 0);
  }
  const out: DrawdownPoint[] = [];
  for (let i = window; i <= rets.length; i++) {
    const w = rets.slice(i - window, i);
    const mean = w.reduce((a, b) => a + b, 0) / window;
    const variance = w.reduce((a, b) => a + (b - mean) ** 2, 0) / (window - 1);
    out.push({ date: curve[i].date, value: Math.sqrt(variance) * Math.sqrt(252) * 100 });
  }
  return out;
}
