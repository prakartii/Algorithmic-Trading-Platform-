from dataclasses import dataclass, field
from typing import Any


@dataclass
class Backtest:
    id: str
    user_id: str
    strategy_id: str
    symbol: str
    start_date: str
    end_date: str
    initial_capital: float
    status: str = "pending"
    results: dict[str, Any] = field(default_factory=dict)
