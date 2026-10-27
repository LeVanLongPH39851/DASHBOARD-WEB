from __future__ import annotations

import json
import logging
import os
import re
import threading
from typing import Any
from urllib import error, request

from src.core.text_to_sql.runtime.context import CURRENT_CONTEXT, RequestContext, stage
from src.core.text_to_sql.runtime.errors import WorkflowError

logger = logging.getLogger(__name__)


def _parse_api_keys(raw: str | None) -> list[str]:
    """Phân tích chuỗi API keys theo duy nhất định dạng: LLM_API_KEY="key1,key2,key3"."""
    if not raw:
        return []
    return [k.strip() for k in raw.strip().split(",") if k.strip()]


class LLMClient:

    def __init__(
        self,
        api_key: str | None = None,
        model: str = "",
        base_url: str = "https://api.openai.com/v1",
        timeout_seconds: int = 8,
        transport=None,
        api_keys: list[str] | str | None = None,
    ) -> None:
        raw_keys = api_keys if api_keys is not None else api_key
        if isinstance(raw_keys, str):
            self.api_keys = _parse_api_keys(raw_keys)
        elif isinstance(raw_keys, list):
            self.api_keys = [str(k).strip() for k in raw_keys if str(k).strip()]
        else:
            self.api_keys = []

        if not self.api_keys:
            raise ValueError("LLMClient requires at least one valid API key.")

        self.model = model
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = min(timeout_seconds, 8)
        self.transport = transport or request.urlopen
        self.current_key_index = 0
        self._lock = threading.Lock()

    @property
    def api_key(self) -> str:
        """Trả về API key đang hoạt động hiện tại."""
        with self._lock:
            return self.api_keys[self.current_key_index]

    @api_key.setter
    def api_key(self, value: str) -> None:
        with self._lock:
            keys = _parse_api_keys(value)
            if keys:
                self.api_keys = keys
                self.current_key_index = 0

    @staticmethod
    def _mask_key(key: str) -> str:
        if len(key) <= 8:
            return "***"
        return f"{key[:4]}...{key[-4:]}"

    def _rotate_key(self, failed_key: str | None = None) -> str:
        with self._lock:
            if failed_key is None or self.api_keys[self.current_key_index] == failed_key:
                prev_idx = self.current_key_index
                self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
                masked_prev = self._mask_key(self.api_keys[prev_idx])
                masked_next = self._mask_key(self.api_keys[self.current_key_index])
                logger.warning(
                    f"[LLM Connector] Đã đổi API key: {masked_prev} (Key {prev_idx + 1}/{len(self.api_keys)}) "
                    f"-> {masked_next} (Key {self.current_key_index + 1}/{len(self.api_keys)})"
                )
            return self.api_keys[self.current_key_index]

    @classmethod
    def from_env(cls) -> "LLMClient":
        raw_keys = os.getenv("LLM_API_KEYS") or os.getenv("LLM_API_KEY")
        if not raw_keys:
            raise RuntimeError("Missing environment variable: LLM_API_KEY")

        api_keys = _parse_api_keys(raw_keys)
        if not api_keys:
            raise RuntimeError("No valid API keys found in LLM_API_KEY")

        model = os.getenv("LLM_MODEL")
        if not model:
            raise RuntimeError("Missing environment variable: LLM_MODEL")

        return cls(
            api_keys=api_keys,
            model=model,
            base_url=os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/"),
            timeout_seconds=int(os.getenv("LLM_TIMEOUT_SECONDS", "8")),
        )

    # ____________________________ OPEN AI / GEMINI API ____________________________ #
    def chat(
        self,
        messages: list[dict[str, Any]],
        temperature: float = 0.0,
        max_tokens: int | None = None,
        extra_body: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if extra_body:
            payload.update(extra_body)

        endpoint = f"{self.base_url}/chat/completions"
        body = json.dumps(payload).encode("utf-8")
        ctx = CURRENT_CONTEXT.get() or RequestContext()
        while True:
            timeout = min(self.timeout_seconds, ctx.llm_attempt())
            current_key = self.api_key
            http_request = request.Request(endpoint, data=body, headers={
                "Authorization": f"Bearer {current_key}", "Content-Type": "application/json",
            }, method="POST")
            try:
                with ctx.stage("llm", model_id=self.model):
                    with self.transport(http_request, timeout=timeout) as response:
                        payload = json.loads(response.read().decode("utf-8"))
                    ctx.emit("llm_usage", outcome="ok", model_id=self.model,
                             token_usage=payload.get("usage"))
                    return payload
            except (error.URLError, TimeoutError, OSError) as exc:
                retryable = not isinstance(exc, error.HTTPError) or exc.code == 429 or exc.code >= 500
                if retryable and ctx.retry():
                    self._rotate_key(current_key)
                    continue
                raise WorkflowError("dependency_unavailable", "Dịch vụ mô hình đang không khả dụng.", retryable=retryable) from exc
            except (ValueError, KeyError, TypeError) as exc:
                raise WorkflowError("invalid_result", "Dịch vụ mô hình trả sai cấu trúc kết quả.") from exc

    def complete_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.0,
        max_tokens: int | None = None,
        extra_body: dict[str, Any] | None = None,
    ) -> str:
        messages: list[dict[str, Any]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = self.chat(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            extra_body=extra_body,
        )

        try:
            content = response["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise WorkflowError("invalid_result", "Dịch vụ mô hình thiếu nội dung trả lời.") from exc

        if isinstance(content, str):
            return content

        if isinstance(content, list):
            text_parts = [
                part.get("text", "")
                for part in content
                if isinstance(part, dict) and part.get("type") == "text"
            ]
            return "".join(text_parts).strip()

        raise WorkflowError("invalid_result", "Dịch vụ mô hình trả kiểu nội dung không hợp lệ.")
