from __future__ import annotations

import json
import logging
import os
import re
import threading
from typing import Any
from urllib import error, request

from dotenv import load_dotenv

load_dotenv()

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
        timeout_seconds: int = 60,
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
        self.timeout_seconds = timeout_seconds
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
            timeout_seconds=int(os.getenv("LLM_TIMEOUT_SECONDS", "60")),
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
        total_keys = len(self.api_keys)
        last_error = None

        # Thử lần lượt từng key nếu gặp lỗi rate limit / quota
        for attempt in range(total_keys):
            current_key = self.api_key
            headers = {
                "Authorization": f"Bearer {current_key}",
                "Content-Type": "application/json",
            }
            http_request = request.Request(
                endpoint,
                data=body,
                headers=headers,
                method="POST",
            )

            try:
                with request.urlopen(http_request, timeout=self.timeout_seconds) as response:
                    response_body = response.read().decode("utf-8")
                return json.loads(response_body)
            except error.HTTPError as exc:
                error_body = exc.read().decode("utf-8", errors="replace")
                last_error = f"Status {exc.code}: {error_body}"

                # Kiểm tra lỗi rate limit, hết quota hoặc token không hợp lệ
                is_rate_limit = (
                    exc.code in (429, 401, 403)
                    or "resource_exhausted" in error_body.lower()
                    or "quota" in error_body.lower()
                    or "rate limit" in error_body.lower()
                )

                if is_rate_limit and total_keys > 1 and attempt < total_keys - 1:
                    masked = self._mask_key(current_key)
                    logger.warning(
                        f"[LLM Connector] API key {masked} (Key {attempt + 1}/{total_keys}) "
                        f"chạm rate limit hoặc lỗi quota ({exc.code}). Tự động chuyển sang key tiếp theo..."
                    )
                    self._rotate_key(failed_key=current_key)
                    continue

                raise RuntimeError(
                    f" --- [LLM Connector] - LLM request failed with status {exc.code}: {error_body}"
                ) from exc
            except error.URLError as exc:
                last_error = f"URLError: {exc.reason}"
                if total_keys > 1 and attempt < total_keys - 1:
                    logger.warning(
                        f"[LLM Connector] Lỗi kết nối ({exc.reason}), thử lại với API key tiếp theo..."
                    )
                    self._rotate_key(failed_key=current_key)
                    continue
                raise RuntimeError(
                    f" --- [LLM Connector] - LLM request could not reach endpoint: {exc.reason}"
                ) from exc

        raise RuntimeError(
            f" --- [LLM Connector] - Toàn bộ {total_keys} API keys đều thất bại hoặc chạm rate limit: {last_error}"
        )

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
            raise RuntimeError(f" --- [LLM Connector] - Unexpected LLM response format: {response}") from exc

        if isinstance(content, str):
            return content

        if isinstance(content, list):
            text_parts = [
                part.get("text", "")
                for part in content
                if isinstance(part, dict) and part.get("type") == "text"
            ]
            return "".join(text_parts).strip()

        raise RuntimeError(f" --- [LLM Connector] - Unsupported content format returned by LLM: {content}")
