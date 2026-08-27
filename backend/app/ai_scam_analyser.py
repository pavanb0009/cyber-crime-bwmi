"""Semantic scam analysis powered by a local open-source LLM (Qwen3 via Ollama).

This module is the *primary* intelligence layer. It does two things in one pass:

1. Translation  - Hindi / Hinglish / other Indian-language transcript -> English.
2. Semantic analysis - understands the *meaning* and manipulation pattern of the
   conversation instead of matching a fixed keyword list.

Design goals
------------
* Structured output. We force the model to answer with a JSON schema derived from a
  Pydantic model, so the rest of the pipeline gets typed, predictable data.
* Never break the demo. If Ollama is not installed, not running, or the model is not
  pulled, ``analyse_with_ai`` returns ``None`` and the caller falls back to the
  deterministic rule engine. The app keeps working with reduced intelligence rather
  than erroring out on stage.
* Deterministic. ``temperature=0`` so the same call produces the same result.

Setup (once, on the machine that runs the backend)::

    # https://ollama.com/download
    ollama pull qwen3:4b        # ~2.5 GB, good for a laptop
    # or, if you have the memory:
    ollama pull qwen3:8b        # ~5.2 GB, stronger semantic classification

Then start the backend as usual. Point it at a different model with::

    OLLAMA_MODEL=qwen3:8b uvicorn app.main:app --port 8000
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Optional

from pydantic import BaseModel, Field, ValidationError, model_validator

logger = logging.getLogger("cyber_rakshak.ai_analyser")

# The scam taxonomy the model is allowed to choose from. Kept in sync with the
# labels the frontend knows how to render.
SCAM_CATEGORIES = (
    "DIGITAL_ARREST",
    "BANK_KYC",
    "FAKE_CUSTOMER_CARE",
    "INVESTMENT_SCAM",
    "COURIER_CUSTOMS",
    "CEO_BOSS_SCAM",
    "REMOTE_ACCESS",
    "OTP_PHISHING",
    "LOAN_SCAM",
    "JOB_SCAM",
    "LEGITIMATE_OR_UNKNOWN",
)

# Human-readable labels for each machine category.
SCAM_LABELS: dict[str, str] = {
    "DIGITAL_ARREST": "Digital arrest scam",
    "BANK_KYC": "Fake bank / KYC scam",
    "FAKE_CUSTOMER_CARE": "Fake customer-care scam",
    "INVESTMENT_SCAM": "Investment / trading scam",
    "COURIER_CUSTOMS": "Courier / customs scam",
    "CEO_BOSS_SCAM": "CEO / boss impersonation scam",
    "REMOTE_ACCESS": "Remote-access scam",
    "OTP_PHISHING": "OTP phishing",
    "LOAN_SCAM": "Loan scam",
    "JOB_SCAM": "Job / task scam",
    "LEGITIMATE_OR_UNKNOWN": "No strong scam pattern",
}


class Threat(BaseModel):
    """A single piece of evidence the model found in the conversation."""

    # Rendered directly as a heading in the UI, so it must be a human-readable
    # label ("Authority impersonation"), never a machine token ("do_not_tell").
    type: str = Field(description="Human-readable name of the tactic in Title Case, e.g. 'Authority impersonation', 'Isolation or control', 'Payment request'. Never use snake_case.")
    severity: int = Field(ge=0, le=100, description="How serious this tactic is on a 0-100 scale. A demand for money, OTP, or remote access is above 80.")
    evidence: str = Field(description="A short English quote or paraphrase from the call showing this tactic.")
    explanation: str = Field(description="One sentence on why this matters.")


class ScamAIResult(BaseModel):
    """The structured object the LLM must return."""

    english_transcript: str = Field(description="Faithful English translation of the whole call.")

    scam_type: str = Field(description=f"One of: {', '.join(SCAM_CATEGORIES)}")
    scam_likelihood: int = Field(ge=0, le=100, description="How strongly the call resembles known scam behaviour.")
    confidence: int = Field(ge=0, le=100, description="Model confidence in its own reading of the call.")
    summary: str = Field(description="Two-sentence plain-English summary of what the caller is doing.")

    # Behavioural flags - these feed the deterministic override rules.
    # Deliberately required (no defaults): Ollama constrains generation to this
    # schema, and any field with a default is one the model is free to omit -
    # which it does, leaving the Scam DNA panel empty.
    authority_impersonation: bool = Field(description="Caller claims to be police, CBI, ED, RBI, TRAI, customs, bank, or courier staff.")
    fear_or_threat: bool = Field(description="Caller threatens arrest, FIR, warrant, or account suspension.")
    urgency: bool = Field(description="Caller pressures the citizen to act immediately.")
    isolation: bool = Field(description="Caller tells the citizen not to disconnect or not to tell anyone.")
    payment_request: bool = Field(description="Caller asks for a transfer, deposit, or UPI payment.")
    credential_request: bool = Field(description="Caller asks for OTP, PIN, CVV, or a password.")
    remote_access_request: bool = Field(description="Caller asks to install an app, share the screen, or open a link.")

    threats: list[Threat] = Field(description="One entry per tactic found, each quoting real evidence. Empty list only if the call is genuinely clean.")

    @model_validator(mode="after")
    def _normalise_threat_severity(self) -> "ScamAIResult":
        """Rescale severities when the model answers on a 1-5 scale.

        Smaller models often ignore the 0-100 range and reply 1-5, which renders
        as an absurd "4/100" next to a CRITICAL verdict. If every severity sits
        at the bottom of the range, treat it as a 5-point scale and stretch it.
        """
        severities = [t.severity for t in self.threats]
        if severities and max(severities) <= 5:
            logger.info("Rescaling 1-5 threat severities %s to 0-100.", severities)
            for threat in self.threats:
                threat.severity = min(threat.severity * 20, 100)
        return self
    immediate_action: str = Field(description="One short piece of protective advice addressed TO THE CITIZEN, e.g. 'Hang up and call your bank on its official number.' Never repeat what the caller demanded.")


SYSTEM_PROMPT = """You are Cyber Rakshak's cyber-fraud analysis engine.
You analyse phone-call transcripts involving citizens in India.

Your job has two stages.

STAGE 1 - TRANSLATION
If the transcript is Hindi, Hinglish, or another Indian language, produce an accurate,
natural English translation. Do not invent information. If it is already English, copy it.

STAGE 2 - ANALYSIS
Analyse the conversation for social-engineering and cyber-fraud behaviour.

Look specifically for:
1. Authority impersonation - CBI, police, ED, RBI, TRAI, customs, bank officials,
   courier companies, government officers.
2. Fear or threats - arrest, FIR, warrant, drugs, illegal parcel, Aadhaar misuse,
   money laundering, account suspension.
3. Urgency - act immediately, account will close, pay now, deadline today.
4. Isolation or control - do not disconnect, do not tell family, stay on video,
   keep this confidential.
5. Financial extraction - transfer funds, safe account, verification money,
   security deposit, UPI payment.
6. Credential theft - OTP, PIN, CVV, passwords.
7. Device compromise - AnyDesk, TeamViewer, screen sharing, APK installation,
   suspicious links.

Choose the scam category that matches the caller's actual method. Do not default to
DIGITAL_ARREST just because the call is a scam - it is a specific, narrow pattern.

DIGITAL_ARREST - Poses as police/CBI/ED/court, alleges a crime against the citizen,
  threatens arrest, and keeps them on the line. Requires a law-enforcement threat.
BANK_KYC - Poses as the bank about KYC, account blocking, or card expiry.
FAKE_CUSTOMER_CARE - Poses as support or a "fraud department" for a bank, card,
  wallet, or company, and offers to "protect" or "verify" the account.
INVESTMENT_SCAM - Promises guaranteed or unusually high returns.
COURIER_CUSTOMS - Claims a parcel was seized, or contains drugs or contraband.
CEO_BOSS_SCAM - Poses as a senior colleague demanding a secret, urgent payment.
REMOTE_ACCESS - Pushes the citizen to install an app or grant screen control.
OTP_PHISHING - Primary aim is to capture an OTP, PIN, CVV, or card number.
LOAN_SCAM - Offers an instant loan requiring an advance fee.
JOB_SCAM - Offers a job or paid tasks requiring a deposit.
LEGITIMATE_OR_UNKNOWN - No scam behaviour, or an awareness/warning message.

IMPORTANT RULES
- Quote or paraphrase real evidence from the transcript in every threat you list.
- Name each threat with a readable Title Case label, e.g. "Authority impersonation".
- severity is on a 0-100 scale, NOT 1-5. Use 80-100 for demands for money,
  card numbers, OTP/PIN, or remote access; 50-79 for authority impersonation,
  threats, or isolation; 20-49 for mild urgency. Never answer 1, 2, 3, 4 or 5.
- immediate_action is advice for the CITIZEN to stay safe. Never restate the
  caller's demand there. "Transfer the money now" is a scam instruction, not advice.
- Set every behavioural boolean explicitly to true or false.
- Do NOT classify a call as fraudulent simply because scam-related words are discussed.
- A caller WARNING someone about a scam, or an awareness message, is NOT the scammer;
  treat that as LEGITIMATE_OR_UNKNOWN with low likelihood.
- If there is genuinely no scam behaviour, use LEGITIMATE_OR_UNKNOWN and a low
  scam_likelihood (below 25).
- scam_likelihood reflects how strongly the CONVERSATION resembles scam behaviour,
  not a statistical probability.

Return ONLY the requested JSON. No preamble, no markdown fences, no commentary.
"""


def model_name() -> str:
    return os.getenv("OLLAMA_MODEL", "qwen3:4b")


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


# Ollama defaults to a 4096-token window. A Hindi transcript tokenises poorly
# (many tokens per character), so a few minutes of speech plus the system prompt
# silently overflows it and the model returns truncated or empty output.
def context_size() -> int:
    return _int_env("OLLAMA_NUM_CTX", 8192)


# Hard ceiling on the transcript we send, so a long recording degrades with a
# warning instead of quietly overflowing the context window.
MAX_TRANSCRIPT_CHARS = 6000


def _chat(ollama: Any, messages: list[dict[str, str]]) -> Any:
    """Call Ollama with reasoning disabled.

    Qwen3 reasons by default and puts that reasoning in a separate ``thinking``
    field. On a call transcript it happily writes 12k+ characters of reasoning,
    which makes the request take minutes and often leaves ``content`` empty.
    We only want the structured verdict, so thinking is switched off.

    ``think`` is not supported by every Ollama build or model, so a rejection is
    retried without it rather than failing the request.
    """
    kwargs: dict[str, Any] = {
        "model": model_name(),
        "messages": messages,
        "format": ScamAIResult.model_json_schema(),
        "options": {
            "temperature": 0,
            "num_ctx": context_size(),
            "num_predict": _int_env("OLLAMA_NUM_PREDICT", 2048),
        },
    }

    try:
        return ollama.chat(think=False, **kwargs)
    except Exception as error:  # noqa: BLE001
        message = str(error).lower()
        if "think" not in message:
            raise
        logger.info("Model/server rejected think=False (%s); retrying without it.", error)
        return ollama.chat(**kwargs)


def _strip_think(raw: str) -> str:
    """Qwen3 can emit <think>...</think> reasoning before the JSON. Remove it."""
    if "</think>" in raw:
        raw = raw.rsplit("</think>", 1)[-1]
    raw = raw.strip()
    # Remove accidental ```json fences.
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1] if "\n" in raw else raw
        raw = raw.rsplit("```", 1)[0]
    return raw.strip()


def ai_available() -> bool:
    """Return True if the Ollama server is reachable and the model is present."""
    try:
        import ollama
    except Exception:
        logger.info("ollama python client not installed; AI layer disabled.")
        return False

    try:
        listed = ollama.Client().list()
        models = listed.get("models", []) if isinstance(listed, dict) else getattr(listed, "models", [])
        available = set()
        for item in models:
            name = item.get("model", "") if isinstance(item, dict) else getattr(item, "model", "")
            if name:
                available.add(name)
        wanted = model_name()
        ok = wanted in available or any(name.startswith(wanted.split(":")[0] + ":") or name == wanted.split(":")[0] for name in available)
        if not ok:
            logger.warning("Ollama is running but model %s is not pulled. Run: ollama pull %s", wanted, wanted)
        return ok
    except Exception as error:  # noqa: BLE001 - any failure means "fall back to rules"
        logger.info("Ollama not reachable (%s); AI layer disabled, using rules only.", error)
        return False


def analyse_with_ai(transcript: str) -> Optional[ScamAIResult]:
    """Run translation + semantic analysis. Returns ``None`` if the LLM is unavailable.

    A ``None`` return is the signal for the caller to fall back to the rule engine.
    """
    transcript = (transcript or "").strip()
    if not transcript:
        return None
    if not ai_available():
        return None

    if len(transcript) > MAX_TRANSCRIPT_CHARS:
        logger.warning(
            "Transcript is %d chars; analysing the first %d to stay inside the context window.",
            len(transcript),
            MAX_TRANSCRIPT_CHARS,
        )
        transcript = transcript[:MAX_TRANSCRIPT_CHARS]

    try:
        import ollama

        response = _chat(
            ollama,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": transcript},
            ],
        )
        message = response["message"]
        content = _strip_think(message.get("content") or "")

        if not content.strip():
            # Almost always means the model spent its output budget on reasoning
            # or the context window overflowed, rather than a real parse problem.
            logger.warning(
                "LLM returned empty content (done_reason=%s, thinking=%d chars, "
                "prompt_tokens=%s, num_ctx=%s); falling back to rules.",
                response.get("done_reason"),
                len(message.get("thinking") or ""),
                response.get("prompt_eval_count"),
                context_size(),
            )
            return None

        result = ScamAIResult.model_validate_json(content)
        # Normalise an unexpected category to the safe default.
        if result.scam_type not in SCAM_CATEGORIES:
            result.scam_type = "LEGITIMATE_OR_UNKNOWN"
        return result
    except (ValidationError, json.JSONDecodeError) as error:
        logger.warning("LLM returned unparseable JSON, falling back to rules: %s", error)
        return None
    except Exception as error:  # noqa: BLE001
        logger.warning("LLM analysis failed, falling back to rules: %s", error)
        return None


def scam_label_for(scam_type: str) -> str:
    return SCAM_LABELS.get(scam_type, "Suspicious call")
