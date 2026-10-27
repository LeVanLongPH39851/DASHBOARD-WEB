"""Offline by default: importing test subjects must never load production secrets."""
import os
import socket

import pytest

for name in ("DORIS_HOST", "DORIS_DATABASE", "DORIS_USER", "DORIS_PASSWORD", "LLM_API_KEY", "LLM_API_KEYS", "LLM_BASE_URL", "REDIS_URL"):
    os.environ[name] = ""
os.environ["DORIS_PORT"] = "0"


@pytest.fixture(autouse=True)
def block_network(monkeypatch):
    def blocked(*args, **kwargs):
        raise AssertionError("Network is disabled in offline tests")
    monkeypatch.setattr(socket.socket, "connect", blocked)
    monkeypatch.setattr(socket, "create_connection", blocked)


def pytest_sessionfinish(session, exitstatus):
    """Machine-readable technical gate, produced by pytest rather than hand edited."""
    import json
    from pathlib import Path
    from src.core.text_to_sql.catalog import RatingCatalog
    from src.core.text_to_sql.runtime.service import ChatService, catalog_version, workflow_version
    from src.core.text_to_sql.runtime.skills import SkillRegistry
    reporter = session.config.pluginmanager.get_plugin("terminalreporter")
    catalog = RatingCatalog.load()
    path = Path("artifacts/regression.json")
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps({"exit_status": int(exitstatus), "total": session.testscollected,
        "passed": len(reporter.stats.get("passed", [])) if reporter else 0,
        "deselected": len(reporter.stats.get("deselected", [])) if reporter else 0,
        "versions": {"workflow": workflow_version(), "catalog": catalog_version(catalog),
                     "skills": SkillRegistry(catalog).version, "prompt": ChatService._prompt_version()}}, indent=2))
