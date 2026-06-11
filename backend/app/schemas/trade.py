from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class TradeCreate(BaseModel):
    symbol: str
    side: str
    quantity: float
    order_type: str = "market"
    limit_price: float | None = None


class TradeResponse(BaseModel):
    id: UUID
    symbol: str
    side: str
    quantity: float
    price: float
    status: str
    source: str
    executed_at: datetime
