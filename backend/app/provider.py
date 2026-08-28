"""Cloud LLM/STT client. Groq (free) is preferred; OpenAI still works if a key is set."""

from __future__ import annotations

import os
from typing import Any

GROQ_BASE_URL = "https://api.groq.com/openai/v1"


def groq_configured() -> bool:
    return bool(os.getenv("GROQ_API_KEY", "").strip())


def openai_configured() -> bool:
    return bool(os.getenv("OPENAI_API_KEY", "").strip())


def cloud_configured() -> bool:
    return groq_configured() or openai_configured()


def provider_name() -> str:
    if groq_configured():
        return "groq"
    if openai_configured():
        return "openai"
    return "none"


def whisper_model() -> str:
    if groq_configured():
        return os.getenv("OPENAI_WHISPER_MODEL") or os.getenv("GROQ_WHISPER_MODEL") or "whisper-large-v3"
    return os.getenv("OPENAI_WHISPER_MODEL", "whisper-1")


def analysis_model() -> str:
    if groq_configured():
        return os.getenv("OPENAI_ANALYSIS_MODEL") or os.getenv("GROQ_ANALYSIS_MODEL") or "llama-3.3-70b-versatile"
    return os.getenv("OPENAI_ANALYSIS_MODEL", "gpt-4o-mini")


def openai_client() -> Any:
    from openai import OpenAI

    if groq_configured():
        return OpenAI(api_key=os.environ["GROQ_API_KEY"].strip(), base_url=GROQ_BASE_URL)

    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("Set GROQ_API_KEY (free) or OPENAI_API_KEY.")
    base = os.getenv("OPENAI_BASE_URL", "").strip()
    if base:
        return OpenAI(api_key=key, base_url=base)
    return OpenAI(api_key=key)
