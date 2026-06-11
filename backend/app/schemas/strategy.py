from pydantic import BaseModel
from typing import Any
from uuid import UUID


class StrategyCreate(BaseModel):
    name: str
    type: str
    parameters: dict[str, Any] = {}


class StrategyUpdate(BaseModel):
    name: str | None = None
    parameters: dict[str, Any] | None = None
    is_active: bool | None = None


class StrategyResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    type: str
    parameters: dict[str, Any]
    is_active: bool
