"""Per-intent rotating log files.

Usage:
    from src.core.text_to_sql.intent_logger import get_intent_logger

    logger = get_intent_logger("data_query")
    logger.info("question=%r | success=%s | source=%s | error=%r", ...)

Log files:
    logs/data_query.log
    logs/definition.log
    logs/no_scope.log
"""

from __future__ import annotations

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path


_LOG_DIR = Path("logs")
_MAX_BYTES = 10 * 1024 * 1024   # 10 MB
_BACKUP_COUNT = 5
_DATE_FORMAT = "%Y-%m-%dT%H:%M:%S"
_FORMAT = "%(asctime)s | %(levelname)s | %(message)s"

_VALID_INTENTS = frozenset(("data_query", "definition", "no_scope"))


def get_intent_logger(
    intent: str,
    log_dir: str | Path = _LOG_DIR,
) -> logging.Logger:
    """
    Trả về (và cache) logger ghi vào file riêng theo intent level.

    Args:
        intent  : Một trong "data_query", "definition", "no_scope".
        log_dir : Thư mục chứa log files (mặc định: logs/ trong working dir).

    Returns:
        logging.Logger đã được cấu hình RotatingFileHandler.
    """
    if intent not in _VALID_INTENTS:
        intent = "data_query"

    logger_name = f"intent.{intent}"
    logger = logging.getLogger(logger_name)

    # Chỉ thêm handler nếu chưa có (tránh duplicate handlers khi reload)
    if not logger.handlers:
        log_path = Path(log_dir)
        log_path.mkdir(parents=True, exist_ok=True)

        handler = RotatingFileHandler(
            log_path / f"{intent}.log",
            maxBytes=_MAX_BYTES,
            backupCount=_BACKUP_COUNT,
            encoding="utf-8",
        )
        handler.setFormatter(logging.Formatter(_FORMAT, datefmt=_DATE_FORMAT))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        logger.propagate = False

    return logger
