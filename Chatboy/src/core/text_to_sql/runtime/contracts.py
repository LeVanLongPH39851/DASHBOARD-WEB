"""Versioned transport contracts, independent of FastAPI and the CLI."""
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, TypeAdapter

from .errors import ERROR_HTTP

QuestionText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]
AnswerText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]


class QuestionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    type: Literal["question"] = "question"
    question: QuestionText


class ClarificationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    type: Literal["clarification"]
    clarification_id: Annotated[str, StringConstraints(pattern=r"^[a-f0-9]{32}$")]
    revision: int = Field(ge=1, le=2)
    answers: dict[str, AnswerText] = Field(min_length=1, max_length=20)


ChatRequest = Annotated[QuestionRequest | ClarificationRequest, Field(discriminator="type")]
REQUEST_ADAPTER = TypeAdapter(ChatRequest)


def wire_value(value):
    if isinstance(value, Decimal):
        if not value.is_finite():
            raise ValueError("non_finite_json")
        return str(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, float):
        import math
        if not math.isfinite(value):
            raise ValueError("non_finite_json")
    if isinstance(value, dict):
        return {k: wire_value(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [wire_value(v) for v in value]
    return value


class ChatResult(BaseModel):
    request_id: str
    status: Literal["answered", "needs_clarification", "no_data", "unsupported", "failed"]
    intent: Literal["data_query", "definition", "no_scope"] | None = None
    reply: str
    data: dict | None = None
    evidence: dict = Field(default_factory=dict)
    clarification: dict | None = None
    error: dict | None = None
    meta: dict = Field(default_factory=dict)

    @property
    def http_status(self):
        return ERROR_HTTP.get(self.error["code"], 500) if self.error else 200

    def as_v2(self):
        return wire_value(self.model_dump(mode="python"))

    def as_legacy(self):
        payload = self.as_v2()
        data = payload["data"]
        if data:
            decimals = [c["name"] for c in data.get("columns", []) if c["type"] == "decimal"]
            for row in data.get("rows", []):
                for alias in decimals:
                    if row.get(alias) is not None:
                        row[alias] = Decimal(str(row[alias]))
        return {"success": self.status == "answered", "intent": self.intent, "reply": self.reply,
                "data": data, "error": self.error, "status": self.status,
                "clarification": self.clarification, "request_id": self.request_id,
                "data_status": self.meta.get('data_status')}
