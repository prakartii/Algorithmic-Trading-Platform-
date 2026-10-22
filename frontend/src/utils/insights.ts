import type { BacktestResponse, PortfolioResponse } from "@/types";
import { rollingVolatility } from "@/utils/analytics";

export type Severity = "alert" | "warning" | "info" | "positive";

export interface Insight {
  id:       string;
  severity: Severity;
  category: "Portfolio" | "Strategy" | "Market regime";
  title:    string;
  detail:   string;
}

const ORDER: Record<Severity, number> = { alert: 0, warning: 1, info: 2, positive: 3 };

function portfolioInsights(p: PortfolioResponse): Insight[] {
  const out: Insight[] = [];
  const total = p.portfolio_value;
  if (total <= 0) return out;

  const top = [...p.positions].sort((a, b) => b.market_value - a.market_value)[0];
  if (top) {
    const weight = (top.market_value / total) * 100;
    if (weight > 40) {
      out.push({
        id: "concentration", severity: "warning", category: "Portfolio",
        title: `${top.symbol} is ${weight.toFixed(0)}% of the portfolio`,
        detail: "A single position above 40% makes results depend on one name. Consider trimming or diversifying.",
      });
    }
  }

  const cashPct = (p.cash / total) * 100;
  if (cashPct > 70) {
    out.push({
      id: "cash-drag", severity: "info", category: "Portfolio",
      title: `${cashPct.toFixed(0)}% of the portfolio is idle cash`,
      detail: "Large cash balances dilute returns. Deploy gradually or confirm the allocation is intentional.",
    });
  }

  const dayPct = p.equity > 0 ? (p.day_pnl / p.equity) * 100 : 0;
  if (dayPct <= -2) {
    out.push({
      id: "day-loss", severity: "alert", category: "Portfolio",
      title: `Down ${Math.abs(dayPct).toFixed(2)}% today`,
      detail: "Intraday loss exceeds 2% of equity. Review open positions before adding risk.",
    });
  } else if (dayPct >= 2) {
    out.push({
      id: "day-gain", severity: "positive", category: "Portfolio",
      title: `Up ${dayPct.toFixed(2)}% today`,
      detail: "Strong session. Consider whether any winners should be rebalanced back to target weight.",
    });
  }

  for (const pos of p.positions) {
    if (pos.unrealized_pnl_pct <= -10) {
      out.push({
        id: `loser-${pos.symbol}`, severity: "warning", category: "Portfolio",
        title: `${pos.symbol} is ${Math.abs(pos.unrealized_pnl_pct).toFixed(1)}% under water`,
        detail: "Unrealised loss beyond 10%. Decide on a stop level or re-validate the original thesis.",
      });
    }
  }
  return out;
}

function strategyInsights(bt: BacktestResponse): Insight[] {
  const out: Insight[] = [];
  const tag = bt.symbol;

  if (bt.sharpe_ratio >= 1) {
    out.push({
      id: "sharpe-good", severity: "positive", category: "Strategy",
      title: `${tag}: Sharpe ${bt.sharpe_ratio.toFixed(2)} is solid`,
      detail: "Risk-adjusted return above 1.0 over this window. Validate on other periods before trusting it.",
    });
  } else if (bt.sharpe_ratio < 0.5) {
    out.push({
      id: "sharpe-weak", severity: "warning", category: "Strategy",
      title: `${tag}: Sharpe ${bt.sharpe_ratio.toFixed(2)} is weak`,
      detail: "Returns barely compensate for the volatility taken. Try a different symbol or window.",
    });
  }

  if (bt.max_drawdown_pct <= -30) {
    out.push({
      id: "deep-dd", severity: "warning", category: "Strategy",
      title: `${tag}: ${Math.abs(bt.max_drawdown_pct).toFixed(1)}% max drawdown`,
      detail: "A drawdown this deep is hard to sit through. Size positions so this loss is tolerable.",
    });
  }

  if (bt.trade_count < 5) {
    out.push({
      id: "small-sample", severity: "info", category: "Strategy",
      title: `Only ${bt.trade_count} trade${bt.trade_count === 1 ? "" : "s"} in the sample`,
      detail: "The 50/200 crossover trades rarely. Metrics from so few trades are statistically fragile.",
    });
  }

  if (bt.win_rate_pct < 45 && bt.profit_factor > 1.5) {
    out.push({
      id: "trend-profile", severity: "info", category: "Strategy",
      title: "Classic trend-following profile",
      detail: `Win rate ${bt.win_rate_pct.toFixed(0)}% with profit factor ${bt.profit_factor.toFixed(2)}: few big winners carry the result.`,
    });
  }

  if (bt.total_return_pct < 0) {
    out.push({
      id: "negative-return", severity: "alert", category: "Strategy",
      title: `${tag}: strategy lost ${Math.abs(bt.total_return_pct).toFixed(1)}%`,
      detail: "The crossover whipsawed over this window. Compare against buy-and-hold before deploying.",
    });
  }
  return out;
}

function regimeInsight(bt: BacktestResponse): Insight[] {
  const vol = rollingVolatility(bt.equity_curve, 60);
  if (vol.length < 20) return [];

  const now = vol[vol.length - 1].value;
  const sorted = vol.map((v) => v.value).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  if (median <= 0) return [];

  const ratio = now / median;
  if (ratio > 1.4) {
    return [{
      id: "regime-high", severity: "warning", category: "Market regime",
      title: "Volatility is elevated",
      detail: `Latest 60-day volatility is ${now.toFixed(1)}%, ${((ratio - 1) * 100).toFixed(0)}% above its median for this run.`,
    }];
  }
  if (ratio < 0.7) {
    return [{
      id: "regime-low", severity: "info", category: "Market regime",
      title: "Volatility is compressed",
      detail: `Latest 60-day volatility is ${now.toFixed(1)}%, well below its median. Quiet regimes often precede larger moves.`,
    }];
  }
  return [{
    id: "regime-normal", severity: "info", category: "Market regime",
    title: "Volatility is in a normal range",
    detail: `Latest 60-day volatility is ${now.toFixed(1)}%, close to its median of ${median.toFixed(1)}%.`,
  }];
}

export function generateInsights(
  portfolio: PortfolioResponse | null,
  backtest: BacktestResponse | null,
): Insight[] {
  return [
    ...(portfolio ? portfolioInsights(portfolio) : []),
    ...(backtest ? [...strategyInsights(backtest), ...regimeInsight(backtest)] : []),
  ].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
}
