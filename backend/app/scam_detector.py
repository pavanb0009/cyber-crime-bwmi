import re
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class SignalDefinition:
    label: str
    weight: int
    terms: tuple[str, ...]


SIGNALS: dict[str, SignalDefinition] = {
    "authority_impersonation": SignalDefinition(
        "Authority impersonation",
        20,
        (
            "cbi", "police", "crime branch", "cyber cell", "customs", "rbi",
            "trai", "enforcement directorate", "supreme court", "officer",
            "investigation", "पुलिस", "सीबीआई", "अधिकारी", "जांच", "कस्टम",
            "आरबीआई", "साइबर सेल", "थाना", "इंस्पेक्टर", "विभाग", "कोर्ट",
            "main police", "ham police", "adhikari", "thana", "inspector",
        ),
    ),
    "fear": SignalDefinition(
        "Fear or threat",
        15,
        (
            "arrest", "jail", "money laundering", "illegal parcel", "drugs",
            "criminal case", "warrant", "account freeze", "account blocked",
            "account will be blocked", "गिरफ्तार", "जेल", "मनी लॉन्ड्रिंग",
            "अवैध", "पार्सल", "ड्रग्स", "मुकदमा", "वारंट", "फ्रीज", "ब्लॉक",
            "कार्रवाई", "girftar", "jail bhej", "case hua", "block ho jayega",
        ),
    ),
    "urgency": SignalDefinition(
        "Urgency and pressure",
        10,
        (
            "immediately", "right now", "within 30 minutes", "today", "urgent",
            "hurry", "अभी", "तुरंत", "आज ही", "जल्दी", "तीस मिनट",
            "abhi", "turant", "aaj hi", "jaldi",
        ),
    ),
    "isolation": SignalDefinition(
        "Isolation or control",
        20,
        (
            "don't tell anyone", "do not tell anyone", "do not contact family",
            "don't contact family", "do not disconnect", "don't disconnect",
            "do not cut the call", "stay on video call", "keep this confidential",
            "किसी को मत बताना", "किसी को नहीं बताना", "परिवार से बात मत",
            "फोन मत काटना", "कॉल मत काटना", "लाइन पर रहिए", "गोपनीय",
            "kisi ko mat batana", "phone mat kaatna", "call mat kaatna",
        ),
    ),
    "payment_request": SignalDefinition(
        "Payment request",
        25,
        (
            "transfer money", "safe account", "verification account",
            "security deposit", "bank transfer", "send money", "make payment",
            "upi payment", "ट्रांसफर", "सुरक्षित खाता", "वेरिफिकेशन",
            "सिक्योरिटी डिपॉजिट", "भुगतान", "यूपीआई", "पैसे भेज",
            "पैसा भेज", "रुपये भेज", "जमा कर", "paisa transfer",
            "paise transfer", "payment karo", "upi karo", "paise bhej",
        ),
    ),
    "credential_request": SignalDefinition(
        "Credential request",
        20,
        (
            "share otp", "tell me the otp", "send otp", "share pin", "banking pin",
            "share cvv", "ओटीपी", "पिन बता", "पिन डाल", "सीवीवी",
            "otp batao", "otp share", "pin batao", "cvv batao",
        ),
    ),
    "remote_access_request": SignalDefinition(
        "Remote-access request",
        25,
        (
            "screen sharing", "share your screen", "install application",
            "download apk", "anydesk", "teamviewer", "स्क्रीन शेयर",
            "ऐप इंस्टॉल", "ऐप डाउनलोड", "एपीके", "लिंक पर क्लिक",
            "screen share karo", "app install karo", "apk download",
            "link par click",
        ),
    ),
}

SAFETY_PHRASES = (
    "never ask", "will not ask", "won't ask", "do not share", "don't share",
    "never share", "scam awareness", "beware of", "report a scam",
    # Someone discussing or warning about scams is not running one.
    "warned me", "warned us", "scams", "fraud awareness", "जागरूक",
    "स्कैम के बारे में", "धोखाधड़ी से बचें",
    "मत बताना चाहिए", "कभी नहीं मांगता", "कभी नहीं मांगेंगे", "नहीं मांगते",
    "शेयर न करें", "साझा न करें", "किसी को न बताएं",
    "otp mat batana", "share mat karna", "scam se bache",
)

SCAM_PROFILES: dict[str, dict[str, Any]] = {
    "digital_arrest": {
        "label": "Digital arrest",
        "required": {"authority_impersonation", "fear"},
        "supporting": {"isolation", "payment_request", "urgency"},
    },
    "bank_kyc": {
        "label": "Fake bank / KYC",
        # Bug fix: this used to require only {"urgency"}, so ANY urgent call was
        # labelled "Fake bank / KYC". A KYC scam is defined by the actual extraction
        # attempt (credentials / payment / remote access), with urgency as support.
        "required": {"credential_request"},
        "supporting": {"payment_request", "remote_access_request", "urgency"},
    },
    "remote_access": {
        "label": "Remote-access scam",
        "required": {"remote_access_request"},
        "supporting": {"credential_request", "payment_request", "urgency"},
    },
    "courier_customs": {
        "label": "Courier / customs scam",
        "required": {"authority_impersonation", "fear"},
        "supporting": {"payment_request", "urgency"},
    },
}


def _normalise(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def _contains_term(text: str, term: str) -> bool:
    if re.fullmatch(r"[a-z0-9 ]+", term):
        return re.search(rf"(?<!\w){re.escape(term)}(?!\w)", text) is not None
    return term in text


def _is_safety_context(text: str) -> bool:
    return any(phrase in text for phrase in SAFETY_PHRASES)


def _risk_level(score: int) -> str:
    if score >= 70:
        return "CRITICAL"
    if score >= 50:
        return "HIGH"
    if score >= 30:
        return "MEDIUM"
    return "LOW"


def _scam_type(detected: set[str], transcript: str) -> tuple[str, str]:
    if (
        {"authority_impersonation", "fear"}.issubset(detected)
        and ("courier" in transcript or "parcel" in transcript or "पार्सल" in transcript)
    ):
        return "courier_customs", "Courier / customs scam"

    best_id = "unknown"
    best_label = "Suspicious call"
    best_match = 0
    for profile_id, profile in SCAM_PROFILES.items():
        required = profile["required"]
        if not required.issubset(detected):
            continue
        match = len(required) * 2 + len(profile["supporting"].intersection(detected))
        if match > best_match:
            best_id = profile_id
            best_label = profile["label"]
            best_match = match
    return best_id, best_label


def detect_signals_for_text(text: str) -> list[str]:
    """Return the ids of every rule signal present in a single line of text.

    Used to tag individual transcript segments so the UI can highlight the exact
    line that triggered a warning. Returns an empty list for safety/awareness lines.
    """
    normalised = _normalise(text)
    if not normalised or _is_safety_context(normalised):
        return []
    return [
        signal_id
        for signal_id, definition in SIGNALS.items()
        if any(_contains_term(normalised, term) for term in definition.terms)
    ]


def detect_signals(segments: list[dict[str, Any]]) -> tuple[set[str], list[dict[str, Any]]]:
    """Scan every segment and return (set of detected signal ids, evidence list)."""
    evidence: list[dict[str, Any]] = []
    detected: set[str] = set()
    for segment in segments:
        for signal_id in detect_signals_for_text(str(segment.get("text", ""))):
            detected.add(signal_id)
            evidence.append(
                {
                    "start": round(float(segment["start"]), 2),
                    "end": round(float(segment["end"]), 2),
                    "text": str(segment["text"]).strip(),
                    "signal": signal_id,
                    "signal_label": SIGNALS[signal_id].label,
                }
            )
    return detected, evidence


def analyse_transcript(segments: list[dict[str, Any]]) -> dict[str, Any]:
    detected, evidence = detect_signals(segments)

    raw_score = sum(SIGNALS[signal].weight for signal in detected)
    score = min(raw_score, 100)
    full_transcript = _normalise(" ".join(str(item["text"]) for item in segments))
    scam_id, scam_label = _scam_type(detected, full_transcript)
    level = _risk_level(score)

    if level == "CRITICAL":
        action = "HANG_UP_NOW"
        actions = [
            "Hang up now and stop responding.",
            "Do not transfer money or share OTP, PIN, CVV, or banking details.",
            "Do not install apps or allow screen sharing.",
            "Verify independently using an official phone number.",
            "If money was sent, call 1930 immediately and contact your bank.",
        ]
    elif level in {"HIGH", "MEDIUM"}:
        action = "VERIFY_INDEPENDENTLY"
        actions = [
            "Pause the conversation and do not make a payment.",
            "Verify the caller through an independently found official number.",
            "Do not share credentials or install remote-access software.",
        ]
    else:
        action = "STAY_ALERT"
        actions = [
            "No strong scam pattern was found, but this is not a guarantee of safety.",
            "Never share OTP, PIN, CVV, passwords, or remote screen access.",
            "Verify unexpected requests through an official channel.",
        ]

    signal_results = [
        {
            "id": signal_id,
            "label": definition.label,
            "detected": signal_id in detected,
            "weight": definition.weight,
        }
        for signal_id, definition in SIGNALS.items()
    ]

    return {
        "scam_type": scam_id,
        "scam_label": scam_label if detected else "No strong scam pattern",
        "risk_score": score,
        "risk_level": level,
        "recommended_action": action,
        "signals": signal_results,
        "evidence": evidence,
        "recommended_actions": actions,
        "disclaimer": "Automated screening can make mistakes. Verify through official channels.",
    }
