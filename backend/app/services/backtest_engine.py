from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
import vectorbt as vbt


# ── domain errors ────────────────────────────────────────────────────────────

class InsufficientDataError(Exception):
    """Fewer bars than the slow-SMA window requires."""


class NoTradesGeneratedError(Exception):
    """Price series produced zero crossover signals."""


# ── result contract ───────────────────────────────────────────────────────────

@dataclass(frozen=True)
class BacktestResult:
    symbol: str
    start_date: str
    end_date: str
    initial_capital: float
    final_value: float
    total_return_pct: float
    cagr_pct: float
    sharpe_ratio: float
    max_drawdown_pct: float
    trade_count: int
    trade_pnls: list[float]    # per-trade realised P&L for RiskEngine
    equity_curve: list[dict]   # [{date: str, value: float}]


# ── engine ───────────────────────────────────────────────────────────────────

class BacktestEngine:
    """
    Golden-cross / death-cross strategy using 50-day and 200-day SMAs.

    Entry  : 50 SMA crosses above 200 SMA
    Exit   : 50 SMA crosses below 200 SMA
    """

    FAST_WINDOW: int = 50
    SLOW_WINDOW: int = 200
    MIN_BARS: int = 252          # 1 trading year above slow window

    def __init__(
        self,
        initial_capital: float = 10_000.0,
        commission: float = 0.001,       # 0.1 % per trade
    ) -> None:
        if initial_capital <= 0:
            raise ValueError("initial_capital must be positive.")
        if not 0 <= commission < 1:
            raise ValueError("commission must be in [0, 1).")

        self.initial_capital = initial_capital
        self.commission = commission

    # ── public ───────────────────────────────────────────────────────────────

    def run(self, prices: pd.Series, symbol: str = "UNKNOWN") -> BacktestResult:
        """
        Run a backtest on a daily close-price Series.

        Parameters
        ----------
        prices : pd.Series
            DatetimeIndex, float close prices, no NaNs (gaps are forward-filled).
        symbol : str
            Ticker label stored in the result for display purposes.
        """
        prices = self._prepare(prices)

        fast_ma = vbt.MA.run(prices, window=self.FAST_WINDOW, short_name="fast")
        slow_ma = vbt.MA.run(prices, window=self.SLOW_WINDOW, short_name="slow")

        entries = fast_ma.ma_crossed_above(slow_ma)
        exits   = fast_ma.ma_crossed_below(slow_ma)

        portfolio = vbt.Portfolio.from_signals(
            close=prices,
            entries=entries,
            exits=exits,
            init_cash=self.initial_capital,
            fees=self.commission,
            freq="D",
            sl_stop=None,
            tp_stop=None,
        )

        stats       = portfolio.stats()
        trade_count = int(self._extract(stats, "Total Trades", 0))

        if trade_count == 0:
            raise NoTradesGeneratedError(
                f"No SMA crossover signals for '{symbol}' in "
                f"{prices.index[0].date()} – {prices.index[-1].date()}. "
                "Extend the date range."
            )

        equity      = portfolio.value()
        final_value = float(equity.iloc[-1])
        years       = len(prices) / 252

        total_return_pct = self._extract(stats, "Total Return [%]")
        cagr_pct         = self._cagr(total_return_pct, years)
        sharpe           = self._extract(stats, "Sharpe Ratio")
        max_dd_pct       = self._extract(stats, "Max Drawdown [%]")
        
        trade_pnls = []

        try:
            trade_pnls = [
                round(float(p), 4)
                for p in portfolio.trades.records["pnl"].tolist()
            ]
        except Exception:
            pass

        return BacktestResult(
            symbol=symbol,
            start_date=prices.index[0].strftime("%Y-%m-%d"),
            end_date=prices.index[-1].strftime("%Y-%m-%d"),
            initial_capital=self.initial_capital,
            final_value=round(final_value, 2),
            total_return_pct=self._fmt(total_return_pct),
            cagr_pct=self._fmt(cagr_pct),
            sharpe_ratio=self._fmt(sharpe),
            max_drawdown_pct=self._fmt(max_dd_pct),
            trade_count=trade_count,
            trade_pnls=trade_pnls,
            equity_curve=self._build_equity_curve(equity),
        )

    # ── private helpers ───────────────────────────────────────────────────────

    def _prepare(self, prices: pd.Series) -> pd.Series:
        if not isinstance(prices.index, pd.DatetimeIndex):
            prices.index = pd.to_datetime(prices.index)

        prices = prices.sort_index().ffill().bfill()
        prices = prices[prices > 0]                    # drop zero/negative prices

        if prices.empty:
            raise InsufficientDataError("Price series is empty after cleaning.")

        if len(prices) < self.MIN_BARS:
            raise InsufficientDataError(
                f"Need ≥{self.MIN_BARS} trading days to compute a "
                f"{self.SLOW_WINDOW}-day SMA. Got {len(prices)}."
            )

        return prices

    @staticmethod
    def _cagr(total_return_pct: float, years: float) -> float:
        if years <= 0 or total_return_pct <= -100:
            return 0.0
        return ((1 + total_return_pct / 100) ** (1 / years) - 1) * 100

    @staticmethod
    def _extract(stats: pd.Series, key: str, default: float = 0.0) -> float:
        val = stats.get(key, default)
        return default if pd.isna(val) else float(val)

    @staticmethod
    def _fmt(val: float, precision: int = 4) -> float:
        return round(val if not np.isnan(val) else 0.0, precision)

    @staticmethod
    def _build_equity_curve(value: pd.Series) -> list[dict]:
        return [
            {"date": idx.strftime("%Y-%m-%d"), "value": round(float(v), 2)}
            for idx, v in value.items()
            if not np.isnan(v)
        ]
