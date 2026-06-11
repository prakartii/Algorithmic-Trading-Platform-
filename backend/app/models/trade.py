from dataclasses import dataclass


@dataclass
class Trade:
    id: str
    user_id: str
    symbol: str
    side: str
    quantity: float
    price: float
    status: str = "filled"
    source: str = "paper"
