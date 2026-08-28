"""Speech-to-text for call scan.

Railway uses Groq Whisper (free) or OpenAI Whisper. Local laptops can still use
faster-whisper when that package is installed and no cloud key is set.
"""

from __future__ import annotations

import logging
from pathlib import Path
from types import SimpleNamespace
from typing import Any

from .provider import openai_client, whisper_model

logger = logging.getLogger("cyber_rakshak.call_scanner")

DOMAIN_PROMPT = (
    "OTP, UPI, KYC, CBI, RBI, TRAI, AnyDesk, बैंक, खाता, ओटीपी, पिन, "
    "पुलिस, गिरफ्तार, वारंट, पार्सल, कस्टम, लिंक, पेमेंट, ट्रांसफर"
)


def transcribe_openai(temp_path: str, language: str) -> tuple[list[dict[str, Any]], Any]:
    with Path(temp_path).open("rb") as audio_file:
        kwargs: dict[str, Any] = {
            "model": whisper_model(),
            "file": audio_file,
            "response_format": "verbose_json",
            "prompt": DOMAIN_PROMPT,
        }
        if language in {"hi", "en"}:
            kwargs["language"] = language
        transcription = openai_client().audio.transcriptions.create(**kwargs)

    duration = float(getattr(transcription, "duration", 0) or 0)
    raw_segments = list(getattr(transcription, "segments", None) or [])
    if not raw_segments and getattr(transcription, "text", "").strip():
        raw_segments = [
            SimpleNamespace(start=0.0, end=duration, text=transcription.text),
        ]

    segments = [
        {
            "start": round(float(getattr(item, "start", 0) or 0), 2),
            "end": round(float(getattr(item, "end", 0) or 0), 2),
            "text": str(getattr(item, "text", "")).strip(),
        }
        for item in raw_segments
        if str(getattr(item, "text", "")).strip()
    ]

    info = SimpleNamespace(
        language=getattr(transcription, "language", None) or (language if language != "auto" else "en"),
        language_probability=1.0,
        duration=round(duration, 2),
    )
    return segments, info
