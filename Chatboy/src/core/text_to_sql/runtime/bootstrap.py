"""Explicit application startup; importing modules never reads production .env."""
import os
import logging

import redis
from redis.retry import Retry
from redis.backoff import NoBackoff
from dotenv import load_dotenv

from config.doris_config import DorisDatabase
from config.llm_config import LLMClient
from .clarification import RedisClarificationStore
from .service import ChatService


def build_service(*, no_llm=False, load_env=True):
    if load_env:
        load_dotenv(override=False)
    logging.getLogger("src.core.text_to_sql").setLevel(logging.ERROR)
    llm = None if no_llm else LLMClient.from_env()
    database = DorisDatabase.from_env()
    if not all((database.host, database.database, database.user)):
        raise ValueError("DORIS_HOST, DORIS_DATABASE and DORIS_USER are required")
    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        raise ValueError("REDIS_URL is required for clarification state")
    store = RedisClarificationStore(redis.Redis.from_url(redis_url, socket_connect_timeout=1, socket_timeout=1,
                                                        retry_on_timeout=False, retry=Retry(NoBackoff(), 0)))
    # Connection failures affect clarification/readiness; independent queries remain available.
    return ChatService(llm=llm, executor=database, store=store)
