from dataclasses import dataclass


@dataclass
class Position:
    id: str
    user_id: str
    symbol: str
    quantity: float
    avg_cost: float
    current_price: float = 0.0
    status: str = "open"
    source: str = "paper"
