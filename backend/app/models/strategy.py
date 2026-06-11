from dataclasses import dataclass, field
from typing import Any


@dataclass
class Strategy:
    id: str
    user_id: str
    name: str
    type: str
    parameters: dict[str, Any] = field(default_factory=dict)
    is_active: bool = True
