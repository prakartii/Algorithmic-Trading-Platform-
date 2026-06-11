from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


# ── domain errors ─────────────────────────────────────────────────────────────

class InsufficientEquityDataError(Exception):
    """Equity curve has too few points to compute meaningful risk metrics."""


# ── result contract ───────────────────────────────────────────────────────────

@dataclass(frozen=True)
class RiskMetrics:
    sharpe_ratio: float        # annualised, excess over risk-free rate
    sortino_ratio: float       # annualised, penalises downside only
    volatility_pct: float      # annualised standard deviation of daily returns (%)
    max_drawdown_pct: float    # peak-to-trough decline (negative, e.g. -18.5)
    win_rate_pct: float        # % of trades closed in profit
    profit_factor: float       # gross profit / gross loss  (∞ if no losses)


# ── engine ────────────────────────────────────────────────────────────────────

class RiskEngine:
    """
    Standalone risk analytics computed from an equity curve and trade P&L list.

    Parameters
    ----------
    risk_free_rate : float
        Annual risk-free rate used for Sharpe and Sortino (default 5 %).
    """

    TRADING_DAYS: int = 252
    MIN_POINTS: int = 2

    def __init__(self, risk_free_rate: float = 0.05) -> None:
        if not 0 <= risk_free_rate < 1:
            raise ValueError("risk_free_rate must be in [0, 1).")
        self.risk_free_rate = risk_free_rate

    # ── public ────────────────────────────────────────────────────────────────

    def compute(
        self,
        equity: pd.Series,
        trade_pnls: list[float] | None = None,
    ) -> RiskMetrics:
        """
        Compute all six risk metrics.

        Parameters
        ----------
        equity : pd.Series
            Chronological portfolio values (equity curve). Must have ≥ 2 points.
        trade_pnls : list[float] | None
            Per-trade realised P&L amounts. Required for win_rate and
            profit_factor; both return 0.0 when omitted.
        """
        equity = self._prepare(equity)
        returns = equity.pct_change().dropna()

        pnls = trade_pnls or []

        return RiskMetrics(
            sharpe_ratio=self._sharpe(returns),
            sortino_ratio=self._sortino(returns),
            volatility_pct=self._volatility(returns),
            max_drawdown_pct=self._max_drawdown(equity),
            win_rate_pct=self._win_rate(pnls),
            profit_factor=self._profit_factor(pnls),
        )

    # ── private: data prep ────────────────────────────────────────────────────

    def _prepare(self, equity: pd.Series) -> pd.Series:
        equity = equity.dropna()

        if len(equity) < self.MIN_POINTS:
            raise InsufficientEquityDataError(
                f"Equity curve needs ≥{self.MIN_POINTS} data points. "
                f"Got {len(equity)}."
            )

        if (equity <= 0).any():
            raise InsufficientEquityDataError(
                "Equity curve contains zero or negative values."
            )

        return equity

    # ── private: metrics ──────────────────────────────────────────────────────

    def _sharpe(self, returns: pd.Series) -> float:
        """
        Annualised Sharpe Ratio.
        Uses sample std (ddof=1) to avoid overfitting on short histories.
        """
        if len(returns) < 2:
            return 0.0

        rf_daily = self.risk_free_rate / self.TRADING_DAYS
        excess   = returns - rf_daily
        std      = excess.std(ddof=1)

        if std == 0:
            return 0.0

        return self._fmt((excess.mean() / std) * np.sqrt(self.TRADING_DAYS))

    def _sortino(self, returns: pd.Series) -> float:
        """
        Annualised Sortino Ratio.
        Downside deviation uses all returns below the daily risk-free target,
        including zeros (flat days count as not meeting the target).
        """
        if len(returns) < 2:
            return 0.0

        rf_daily     = self.risk_free_rate / self.TRADING_DAYS
        excess        = returns - rf_daily
        downside      = np.minimum(excess, 0.0)
        downside_var  = np.mean(downside ** 2)

        if downside_var == 0:
            return 0.0

        downside_std = np.sqrt(downside_var)
        return self._fmt((excess.mean() / downside_std) * np.sqrt(self.TRADING_DAYS))

    def _volatility(self, returns: pd.Series) -> float:
        """Annualised volatility expressed as a percentage."""
        if len(returns) < 2:
            return 0.0

        return self._fmt(float(returns.std(ddof=1) * np.sqrt(self.TRADING_DAYS) * 100))

    def _max_drawdown(self, equity: pd.Series) -> float:
        """
        Maximum peak-to-trough drawdown as a negative percentage.
        Uses the running peak so partial recoveries are handled correctly.
        """
        peak     = equity.cummax()
        drawdown = (equity - peak) / peak
        return self._fmt(float(drawdown.min() * 100))

    def _win_rate(self, pnls: list[float]) -> float:
        """Percentage of trades that closed with a positive P&L."""
        if not pnls:
            return 0.0

        wins = sum(1 for p in pnls if p > 0)
        return self._fmt(wins / len(pnls) * 100)

    def _profit_factor(self, pnls: list[float]) -> float:
        """
        Gross profit divided by gross loss.
        Returns 0.0 when there are no trades and inf when there are no losses.
        A ratio > 1.0 means the strategy made more than it lost.
        """
        if not pnls:
            return 0.0

        gross_profit = sum(p for p in pnls if p > 0)
        gross_loss   = abs(sum(p for p in pnls if p < 0))

        if gross_loss == 0:
            return self._fmt(gross_profit) if gross_profit > 0 else 0.0

        return self._fmt(gross_profit / gross_loss)

    # ── utility ───────────────────────────────────────────────────────────────

    @staticmethod
    def _fmt(val: float, precision: int = 4) -> float:
        if np.isnan(val) or np.isinf(val):
            return 0.0
        return round(val, precision)
