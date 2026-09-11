"""Audit and Request logger for tracking user questions, full pipeline JSON logs, and LLM output."""

from __future__ import annotations

import json
import logging
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any


_LOG_DIR = Path("logs")
_MAX_BYTES = 20 * 1024 * 1024  # 20 MB per file
_BACKUP_COUNT = 10


_VALID_INTENTS = frozenset(("data_query", "definition", "no_scope"))


class RequestLogger:
    """Handles logging of user questions, full JSON pipeline diagnostics, and LLM output separated by intent."""

    def __init__(self, log_dir: str | Path = _LOG_DIR):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self._dir_key = abs(hash(str(self.log_dir.resolve())))
        self._loggers: dict[str, tuple[logging.Logger, logging.Logger]] = {}

        # Pre-initialize 3 intent loggers + global
        for intent_name in ("data_query", "definition", "no_scope", "requests"):
            self._get_or_create_intent_loggers(intent_name)

    def _create_rotating_logger(self, name: str, filename: Path, formatter: logging.Formatter) -> logging.Logger:
        logger = logging.getLogger(name)
        if not logger.handlers:
            handler = RotatingFileHandler(
                filename,
                maxBytes=_MAX_BYTES,
                backupCount=_BACKUP_COUNT,
                encoding="utf-8",
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            logger.setLevel(logging.INFO)
            logger.propagate = False
        return logger

    def _get_or_create_intent_loggers(self, intent: str) -> tuple[logging.Logger, logging.Logger]:
        if intent not in self._loggers:
            jsonl_logger = self._create_rotating_logger(
                name=f"request_logger.jsonl.{self._dir_key}.{intent}",
                filename=self.log_dir / f"{intent}.jsonl",
                formatter=logging.Formatter("%(message)s"),
            )
            text_logger = self._create_rotating_logger(
                name=f"request_logger.text.{self._dir_key}.{intent}",
                filename=self.log_dir / f"{intent}.log",
                formatter=logging.Formatter("%(asctime)s | %(message)s", datefmt="%Y-%m-%dT%H:%M:%S"),
            )
            self._loggers[intent] = (jsonl_logger, text_logger)
        return self._loggers[intent]

    def log_interaction(
        self,
        question: str,
        full_log: dict[str, Any],
        llm_output: str | None,
        intent: str = "data_query",
        success: bool = True,
        error: str | None = None,
    ) -> None:
        """Ghi log tương tác gồm câu hỏi, full log JSON và output của LLM theo từng intent."""
        if intent not in _VALID_INTENTS:
            intent = "data_query"

        timestamp = datetime.now().isoformat()

        record = {
            "timestamp": timestamp,
            "question": question,
            "intent": intent,
            "success": success,
            "error": error,
            "full_log": full_log,
            "llm_output": llm_output or "",
        }

        jsonl_record = json.dumps(record, ensure_ascii=False, default=str)
        full_log_str = json.dumps(full_log, ensure_ascii=False, default=str)
        escaped_question = question.replace("\n", " ")
        escaped_llm_output = (llm_output or "").replace("\n", " \\n ")
        text_message = (
            f"QUESTION: {escaped_question} | "
            f"FULL_LOG: {full_log_str} | "
            f"LLM_OUTPUT: {escaped_llm_output}"
        )

        # 1. Ghi vào file log riêng của intent (logs/data_query.log, logs/definition.log, logs/no_scope.log)
        intent_jsonl_logger, intent_text_logger = self._get_or_create_intent_loggers(intent)
        intent_jsonl_logger.info(jsonl_record)
        intent_text_logger.info(text_message)

        # 2. Đồng thời ghi vào tổng hợp requests.jsonl & requests.log
        all_jsonl_logger, all_text_logger = self._get_or_create_intent_loggers("requests")
        all_jsonl_logger.info(jsonl_record)
        all_text_logger.info(text_message)

    def close(self) -> None:
        """Close and remove all handlers."""
        for jsonl_logger, text_logger in self._loggers.values():
            for h in list(jsonl_logger.handlers):
                h.close()
                jsonl_logger.removeHandler(h)
            for h in list(text_logger.handlers):
                h.close()
                text_logger.removeHandler(h)
        self._loggers.clear()


_DEFAULT_LOGGER: RequestLogger | None = None


def get_request_logger(log_dir: str | Path = _LOG_DIR) -> RequestLogger:
    """Singleton getter for RequestLogger."""
    global _DEFAULT_LOGGER
    if _DEFAULT_LOGGER is None:
        _DEFAULT_LOGGER = RequestLogger(log_dir=log_dir)
    return _DEFAULT_LOGGER


def log_request(
    question: str,
    full_log: dict[str, Any],
    llm_output: str | None,
    intent: str = "data_query",
    success: bool = True,
    error: str | None = None,
) -> None:
    """Tiện ích ghi log câu hỏi | full log JSON | output LLM."""
    get_request_logger().log_interaction(
        question=question,
        full_log=full_log,
        llm_output=llm_output,
        intent=intent,
        success=success,
        error=error,
    )
