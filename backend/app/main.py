import logging
import os
import re
import tempfile
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

from .ai_scam_analyser import ai_available, analyse_with_ai, model_name
from .fusion import fuse
from .scam_detector import detect_signals, detect_signals_for_text


logger = logging.getLogger("cyber_rakshak.call_scanner")

MAX_UPLOAD_BYTES = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm", ".ogg", ".mp4"}
SUPPORTED_LANGUAGES = {"auto", "hi", "en"}

# Indian fraud vocabulary that Whisper otherwise tends to garble.
DOMAIN_PROMPT = (
    "OTP, UPI, KYC, CBI, RBI, TRAI, AnyDesk, बैंक, खाता, ओटीपी, पिन, "
    "पुलिस, गिरफ्तार, वारंट, पार्सल, कस्टम, लिंक, पेमेंट, ट्रांसफर"
)

# Long Whisper segments are re-split into readable lines for the timeline UI.
MAX_LINE_SECONDS = 9.0
PAUSE_SPLIT_SECONDS = 0.6
SENTENCE_ENDINGS = ("।", ".", "?", "!")

app = FastAPI(
    title="Cyber Rakshak Call Scanner",
    description="Local Hindi/English transcription and explainable scam-signal analysis.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:4174",
        "http://127.0.0.1:4174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def model_settings() -> tuple[str, str, str]:
    model_name = os.getenv("WHISPER_MODEL", "large-v3-turbo")
    device = os.getenv("WHISPER_DEVICE", "cpu")
    default_compute = "int8" if device == "cpu" else "float16"
    return model_name, device, os.getenv("WHISPER_COMPUTE_TYPE", default_compute)


@lru_cache(maxsize=1)
def get_model() -> WhisperModel:
    model_name, device, compute_type = model_settings()
    logger.info("Loading Whisper model %s on %s (%s)", model_name, device, compute_type)
    return WhisperModel(model_name, device=device, compute_type=compute_type)


def _split_into_lines(segment: Any) -> list[dict[str, Any]]:
    words = getattr(segment, "words", None)
    if not words:
        return [
            {
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip(),
            }
        ]

    groups: list[list[Any]] = []
    current: list[Any] = []
    for word in words:
        if current:
            gap = word.start - current[-1].end
            span = word.end - current[0].start
            ends_sentence = current[-1].word.strip().endswith(SENTENCE_ENDINGS)
            if gap >= PAUSE_SPLIT_SECONDS or span >= MAX_LINE_SECONDS or ends_sentence:
                groups.append(current)
                current = []
        current.append(word)
    if current:
        groups.append(current)

    lines = []
    for group in groups:
        text = "".join(word.word for word in group).strip()
        if text:
            lines.append(
                {
                    "start": round(group[0].start, 2),
                    "end": round(group[-1].end, 2),
                    "text": text,
                }
            )
    return lines


def _split_english(english: str, segment_count: int) -> list[str]:
    """Distribute a whole-call English translation across the timed segments.

    The LLM returns one continuous English translation, not a per-segment one.
    We split it into sentences and allocate them proportionally so each timeline
    row shows an approximate English line beside its original text. Alignment is
    best-effort - it is a reading aid, not a word-level time map.
    """
    english = (english or "").strip()
    if not english or segment_count <= 0:
        return [""] * max(segment_count, 0)

    sentences = re.findall(r"[^.!?।]+[.!?।]?", english)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return [english] + [""] * (segment_count - 1)

    if segment_count == 1:
        return [" ".join(sentences)]

    # Spread sentences across rows as evenly as possible.
    lines: list[str] = ["" for _ in range(segment_count)]
    for i, sentence in enumerate(sentences):
        row = min(i * segment_count // len(sentences), segment_count - 1)
        lines[row] = f"{lines[row]} {sentence}".strip()
    return lines


@app.get("/health")
def health() -> dict[str, Any]:
    whisper_name, device, compute_type = model_settings()
    llm_ready = ai_available()
    return {
        "status": "ok",
        "model": whisper_name,
        "device": device,
        "compute_type": compute_type,
        "model_loaded": get_model.cache_info().currsize > 0,
        # Lets the UI show whether the semantic layer is live or it is running on
        # rules only. Rules-only is fully functional, just less nuanced.
        "ai_engine": "ollama" if llm_ready else "rules-only",
        "ai_model": model_name() if llm_ready else None,
        "ai_available": llm_ready,
    }


@app.post("/analyse")
async def analyse_call(
    audio: Annotated[UploadFile, File(description="Hindi, English, or Hinglish call audio")],
    language: Annotated[str, Form()] = "auto",
) -> dict[str, Any]:
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Language must be one of: {', '.join(sorted(SUPPORTED_LANGUAGES))}",
        )

    suffix = Path(audio.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file. Use: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    contents = await audio.read(MAX_UPLOAD_BYTES + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded audio file is empty.")
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Audio must be 50 MB or smaller.")

    temp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name

        try:
            model = get_model()
        except Exception as error:
            logger.exception("Whisper model could not be loaded")
            raise HTTPException(
                status_code=503,
                detail=(
                    "The speech model is not available yet. The first run must download it, "
                    "which needs internet access. See the backend terminal for details."
                ),
            ) from error

        try:
            segments_iter, info = model.transcribe(
                temp_path,
                task="transcribe",
                language=None if language == "auto" else language,
                # A wider beam meaningfully improves Hindi/Hinglish accuracy on
                # noisy phone audio. The extra decoding cost is acceptable for the
                # 20-90s clips this tool is designed for.
                beam_size=5,
                vad_filter=True,
                word_timestamps=True,
                initial_prompt=DOMAIN_PROMPT,
                # Whisper loops on the same phrase when phone audio is noisy.
                # no_repeat_ngram_size is what actually stops the loop; the
                # thresholds below discard a chunk that still degrades.
                no_repeat_ngram_size=3,
                condition_on_previous_text=False,
                compression_ratio_threshold=2.0,
                no_speech_threshold=0.5,
                temperature=[0.0, 0.2, 0.4],
            )
            segments = [
                line
                for segment in segments_iter
                for line in _split_into_lines(segment)
            ]
        except Exception as error:
            logger.exception("Transcription failed for %s", audio.filename)
            raise HTTPException(
                status_code=422,
                detail="Could not decode or transcribe this audio file.",
            ) from error

        original_transcript = " ".join(item["text"] for item in segments)

        # PRIMARY intelligence: LLM translates to English and reads the meaning.
        # Returns None when Ollama/Qwen is unavailable, and we fall back to rules.
        ai_result = analyse_with_ai(original_transcript)

        # EXPLAINABILITY / SAFETY layer: deterministic signals over the original
        # transcript. These both feed the fused score and tag individual lines.
        detected, rule_evidence = detect_signals(segments)

        analysis = fuse(ai_result, detected, rule_evidence)

        english_transcript = ai_result.english_transcript if ai_result else ""

        # Attach per-line English + rule signals so the timeline can show both
        # languages and highlight exactly what triggered each warning.
        english_lines = _split_english(english_transcript, len(segments))
        enriched_segments = [
            {
                **segment,
                "original_text": segment["text"],
                "english_text": english_lines[index] if index < len(english_lines) else "",
                "signals": detect_signals_for_text(str(segment["text"])),
            }
            for index, segment in enumerate(segments)
        ]

        return {
            "file_name": audio.filename,
            "language": info.language,
            "language_probability": round(info.language_probability, 3),
            "duration": round(info.duration, 2),
            # Kept for backward compatibility; equals the original transcript.
            "transcript": original_transcript,
            "original_transcript": original_transcript,
            "english_transcript": english_transcript or original_transcript,
            "segments": enriched_segments,
            "analysis": analysis,
        }
    finally:
        await audio.close()
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)
