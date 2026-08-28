import logging
import os
import re
import tempfile
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware


def _load_local_env() -> None:
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.is_file():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_local_env()

from .ai_scam_analyser import ai_available, analyse_with_ai, model_name
from .fusion import fuse
from .scam_detector import detect_signals, detect_signals_for_text
from .provider import cloud_configured, provider_name, whisper_model
from .transcribe import DOMAIN_PROMPT, transcribe_openai


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cyber_rakshak.call_scanner")

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm", ".ogg", ".mp4"}
SUPPORTED_LANGUAGES = {"auto", "hi", "en"}
LOCAL_ORIGINS = [
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:4174",
    "http://127.0.0.1:4174",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

MAX_LINE_SECONDS = 9.0
PAUSE_SPLIT_SECONDS = 0.6
SENTENCE_ENDINGS = ("।", ".", "?", "!")

app = FastAPI(
    title="CyberDesk Call Scanner",
    description="Hindi/English transcription and explainable scam-signal analysis.",
    version="0.2.0",
)


def cors_origins() -> list[str]:
    extra = [
        origin.strip().rstrip("/")
        for origin in os.getenv("CORS_ORIGINS", "").split(",")
        if origin.strip()
    ]
    return [*LOCAL_ORIGINS, *extra]


app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def max_upload_bytes() -> int:
    # OpenAI Whisper rejects files over 25 MB.
    return 25 * 1024 * 1024 if cloud_configured() else 50 * 1024 * 1024


def model_settings() -> tuple[str, str, str]:
    whisper = os.getenv("WHISPER_MODEL", "large-v3-turbo")
    device = os.getenv("WHISPER_DEVICE", "cpu")
    default_compute = "int8" if device == "cpu" else "float16"
    return whisper, device, os.getenv("WHISPER_COMPUTE_TYPE", default_compute)


@lru_cache(maxsize=1)
def get_local_model() -> Any:
    from faster_whisper import WhisperModel

    whisper, device, compute_type = model_settings()
    logger.info("Loading Whisper model %s on %s (%s)", whisper, device, compute_type)
    return WhisperModel(whisper, device=device, compute_type=compute_type)


def transcribe_audio_file(temp_path: str, language: str) -> tuple[list[dict[str, Any]], Any]:
    try:
        if cloud_configured():
            return transcribe_openai(temp_path, language)
        return transcribe_local(temp_path, language)
    except HTTPException:
        raise
    except ImportError as error:
        logger.exception("Speech backend is not installed")
        missing = "openai" if "openai" in str(error).lower() else "faster-whisper"
        raise HTTPException(
            status_code=503,
            detail=(
                f"Python package '{missing}' is not installed in this environment. "
                "From the project root run: source .venv/bin/activate && pip install -r backend/requirements.txt"
            ),
        ) from error
    except Exception as error:
        logger.exception("Transcription failed")
        message = str(error)
        if "api key" in message.lower() or "authentication" in message.lower():
            raise HTTPException(
                status_code=503,
                detail="API key is missing or invalid. Set GROQ_API_KEY (free) on the API service.",
            ) from error
        raise HTTPException(
            status_code=422,
            detail="Could not decode or transcribe this audio file.",
        ) from error


async def save_upload(audio: UploadFile, language: str) -> tuple[bytes, str]:
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Language must be one of: {', '.join(sorted(SUPPORTED_LANGUAGES))}",
        )
    suffix = Path(audio.filename or "voice.webm").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file. Use: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )
    limit = max_upload_bytes()
    contents = await audio.read(limit + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded audio file is empty.")
    if len(contents) > limit:
        raise HTTPException(
            status_code=413,
            detail=f"Audio must be {limit // (1024 * 1024)} MB or smaller.",
        )
    return contents, suffix


def transcribe_local(temp_path: str, language: str) -> tuple[list[dict[str, Any]], Any]:
    model = get_local_model()
    segments_iter, info = model.transcribe(
        temp_path,
        task="transcribe",
        language=None if language == "auto" else language,
        beam_size=5,
        vad_filter=True,
        word_timestamps=True,
        initial_prompt=DOMAIN_PROMPT,
        no_repeat_ngram_size=3,
        condition_on_previous_text=False,
        compression_ratio_threshold=2.0,
        no_speech_threshold=0.5,
        temperature=[0.0, 0.2, 0.4],
    )
    segments = [line for segment in segments_iter for line in _split_into_lines(segment)]
    return segments, info


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
    english = (english or "").strip()
    if not english or segment_count <= 0:
        return [""] * max(segment_count, 0)

    sentences = re.findall(r"[^.!?।]+[.!?।]?", english)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return [english] + [""] * (segment_count - 1)

    if segment_count == 1:
        return [" ".join(sentences)]

    lines: list[str] = ["" for _ in range(segment_count)]
    for i, sentence in enumerate(sentences):
        row = min(i * segment_count // len(sentences), segment_count - 1)
        lines[row] = f"{lines[row]} {sentence}".strip()
    return lines


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "cyberdesk-call-scanner", "health": "/health"}


@app.get("/health")
def health() -> dict[str, Any]:
    llm_ready = ai_available()
    cloud = cloud_configured()
    whisper_name, device, compute_type = model_settings()
    return {
        "status": "ok",
        "transcription": f"{provider_name()}-whisper" if cloud else "faster-whisper",
        "model": whisper_model() if cloud else whisper_name,
        "device": provider_name() if cloud else device,
        "compute_type": None if cloud else compute_type,
        "model_loaded": True if cloud else get_local_model.cache_info().currsize > 0,
        "ai_engine": provider_name() if cloud else ("ollama" if llm_ready else "rules-only"),
        "ai_model": model_name() if llm_ready else None,
        "ai_available": llm_ready,
    }


@app.post("/transcribe")
async def transcribe_only(
    audio: Annotated[UploadFile, File(description="Hindi, English, or Hinglish speech")],
    language: Annotated[str, Form()] = "auto",
) -> dict[str, Any]:
    contents, suffix = await save_upload(audio, language)
    temp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name
        segments, info = transcribe_audio_file(temp_path, language)
        transcript = " ".join(item["text"] for item in segments).strip()
        return {
            "transcript": transcript,
            "language": getattr(info, "language", language),
            "duration": round(float(getattr(info, "duration", 0) or 0), 2),
        }
    finally:
        await audio.close()
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)


@app.post("/analyse")
async def analyse_call(
    audio: Annotated[UploadFile, File(description="Hindi, English, or Hinglish call audio")],
    language: Annotated[str, Form()] = "auto",
) -> dict[str, Any]:
    contents, suffix = await save_upload(audio, language)
    temp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name

        segments, info = transcribe_audio_file(temp_path, language)
        original_transcript = " ".join(item["text"] for item in segments)
        ai_result = analyse_with_ai(original_transcript)
        detected, rule_evidence = detect_signals(segments)
        analysis = fuse(ai_result, detected, rule_evidence)
        english_transcript = ai_result.english_transcript if ai_result else ""
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
            "language_probability": round(float(info.language_probability or 1), 3),
            "duration": round(float(info.duration or 0), 2),
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
