from __future__ import annotations

from dataclasses import dataclass

from alpaca.common.exceptions import APIError
from alpaca.trading.client import TradingClient
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.trading.requests import LimitOrderRequest, MarketOrderRequest

from app.core.config import settings


# ── domain errors ─────────────────────────────────────────────────────────────

class AlpacaOrderError(Exception):
    """Alpaca rejected or could not submit the order."""


class PositionNotFoundError(Exception):
    """No open position exists for the requested symbol."""


# ── result contracts ──────────────────────────────────────────────────────────

@dataclass(frozen=True)
class OrderResult:
    order_id: str
    client_order_id: str
    symbol: str
    side: str               # "buy" | "sell"
    quantity: float
    order_type: str         # "market" | "limit"
    limit_price: float | None
    status: str
    submitted_at: str


@dataclass(frozen=True)
class PositionData:
    symbol: str
    quantity: float
    avg_cost: float
    current_price: float
    market_value: float
    unrealized_pnl: float
    unrealized_pnl_pct: float
    side: str               # "long" | "short"


@dataclass(frozen=True)
class PortfolioSummary:
    portfolio_value: float
    equity: float
    cash: float
    buying_power: float
    unrealized_pnl: float
    day_pnl: float
    positions: list[PositionData]


# ── service ───────────────────────────────────────────────────────────────────

class AlpacaService:
    """
    Thin, typed wrapper around the Alpaca paper-trading API.
    One client instance is created at construction; reuse it across requests.
    """

    def __init__(self) -> None:
        self._client = TradingClient(
            api_key=settings.alpaca_api_key,
            secret_key=settings.alpaca_secret_key,
            paper=True,
        )

    # ── orders ────────────────────────────────────────────────────────────────

    def buy(
        self,
        symbol: str,
        quantity: float,
        limit_price: float | None = None,
    ) -> OrderResult:
        """
        Submit a buy order. Defaults to market order; pass limit_price for limit.
        quantity must be a positive number of shares (fractional shares supported).
        """
        return self._submit(symbol, quantity, OrderSide.BUY, limit_price)

    def sell(
        self,
        symbol: str,
        quantity: float | None = None,
        limit_price: float | None = None,
    ) -> OrderResult:
        """
        Submit a sell order.
        Passing quantity=None closes the entire position for the symbol.
        """
        if quantity is None:
            qty = self._position_qty(symbol)
        else:
            qty = quantity

        return self._submit(symbol, qty, OrderSide.SELL, limit_price)

    # ── portfolio ─────────────────────────────────────────────────────────────

    def get_positions(self) -> list[PositionData]:
        """Return all open positions."""
        try:
            raw = self._client.get_all_positions()
        except APIError as exc:
            raise AlpacaOrderError(f"Failed to fetch positions: {exc}") from exc

        return [self._parse_position(p) for p in raw]

    def get_portfolio(self) -> PortfolioSummary:
        """Return account-level portfolio summary including all open positions."""
        try:
            account   = self._client.get_account()
            positions = self.get_positions()
        except APIError as exc:
            raise AlpacaOrderError(f"Failed to fetch portfolio: {exc}") from exc

        unrealized_pnl = sum(p.unrealized_pnl for p in positions)

        return PortfolioSummary(
            portfolio_value=_f(account.portfolio_value),
            equity=_f(account.equity),
            cash=_f(account.cash),
            buying_power=_f(account.buying_power),
            unrealized_pnl=round(unrealized_pnl, 2),
            day_pnl=_f(account.equity) - _f(account.last_equity),
            positions=positions,
        )

    # ── private ───────────────────────────────────────────────────────────────

    def _submit(
        self,
        symbol: str,
        quantity: float,
        side: OrderSide,
        limit_price: float | None,
    ) -> OrderResult:
        if quantity <= 0:
            raise AlpacaOrderError("quantity must be positive.")

        try:
            if limit_price is not None:
                request = LimitOrderRequest(
                    symbol=symbol.upper(),
                    qty=quantity,
                    side=side,
                    time_in_force=TimeInForce.DAY,
                    limit_price=limit_price,
                )
            else:
                request = MarketOrderRequest(
                    symbol=symbol.upper(),
                    qty=quantity,
                    side=side,
                    time_in_force=TimeInForce.DAY,
                )

            order = self._client.submit_order(request)

        except APIError as exc:
            raise AlpacaOrderError(
                f"Alpaca rejected {side.value} {quantity} {symbol}: {exc}"
            ) from exc

        return OrderResult(
            order_id=str(order.id),
            client_order_id=str(order.client_order_id),
            symbol=str(order.symbol),
            side=order.side.value,
            quantity=float(order.qty),
            order_type=order.order_type.value,
            limit_price=float(order.limit_price) if order.limit_price else None,
            status=order.status.value,
            submitted_at=order.submitted_at.isoformat() if order.submitted_at else "",
        )

    def _position_qty(self, symbol: str) -> float:
        """Resolve current quantity for a symbol — used when sell(qty=None)."""
        try:
            position = self._client.get_open_position(symbol.upper())
            return abs(float(position.qty))
        except APIError as exc:
            raise PositionNotFoundError(
                f"No open position found for '{symbol}'."
            ) from exc

    @staticmethod
    def _parse_position(p) -> PositionData:
        return PositionData(
            symbol=str(p.symbol),
            quantity=float(p.qty),
            avg_cost=_f(p.avg_entry_price),
            current_price=_f(p.current_price),
            market_value=_f(p.market_value),
            unrealized_pnl=_f(p.unrealized_pl),
            unrealized_pnl_pct=_f(p.unrealized_plpc) * 100,
            side=p.side.value,
        )


# ── helpers ───────────────────────────────────────────────────────────────────

def _f(val) -> float:
    """Convert Alpaca's string/Decimal fields to a rounded float."""
    try:
        return round(float(val), 2)
    except (TypeError, ValueError):
        return 0.0
