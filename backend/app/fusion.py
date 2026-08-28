"""Combine the LLM semantic reading with the deterministic rule engine.

Two numbers, deliberately kept separate because they answer different questions:

* AI Scam Likelihood - "How strongly does this conversation resemble known scam
  behaviour?" Comes from the Qwen semantic pass.
* Behavioural Risk Score - "How dangerous is the behaviour happening right now?"
  Comes from the weighted rule signals (authority + fear + payment ...).

The final score fuses the two, then a set of hard overrides guarantee that the
classic high-danger combinations can never be scored as safe, even if one layer
under-reads the call.
"""

from __future__ import annotations

from typing import Any, Optional

from .ai_scam_analyser import ScamAIResult, scam_label_for
from .scam_detector import SIGNALS

# How much each layer contributes when both are present.
AI_WEIGHT = 0.65
RULE_WEIGHT = 0.35

# The rule signals an LLM behavioural flag maps onto, so the two layers can
# reinforce each other's evidence.
FLAG_TO_SIGNAL = {
    "authority_impersonation": "authority_impersonation",
    "fear_or_threat": "fear",
    "urgency": "urgency",
    "isolation": "isolation",
    "payment_request": "payment_request",
    "credential_request": "credential_request",
    "remote_access_request": "remote_access_request",
}


def _risk_level(score: int) -> str:
    if score >= 70:
        return "CRITICAL"
    if score >= 50:
        return "HIGH"
    if score >= 30:
        return "MEDIUM"
    return "LOW"


def _rule_score(detected: set[str]) -> int:
    return min(sum(SIGNALS[s].weight for s in detected), 100)


def _actions_for(level: str) -> tuple[str, list[str]]:
    if level == "CRITICAL":
        return "HANG_UP_NOW", [
            "Hang up now and stop responding.",
            "Do not transfer money or share OTP, PIN, CVV, or banking details.",
            "Do not install apps or allow screen sharing.",
            "Verify independently using an official phone number.",
            "If money was sent, call 1930 immediately and contact your bank.",
        ]
    if level in {"HIGH", "MEDIUM"}:
        return "VERIFY_INDEPENDENTLY", [
            "Pause the conversation and do not make a payment.",
            "Verify the caller through an independently found official number.",
            "Do not share credentials or install remote-access software.",
        ]
    return "STAY_ALERT", [
        "No strong scam pattern was found, but this is not a guarantee of safety.",
        "Never share OTP, PIN, CVV, passwords, or remote screen access.",
        "Verify unexpected requests through an official channel.",
    ]


def _combined_flags(ai: ScamAIResult, detected: set[str]) -> dict[str, bool]:
    """Union of LLM behavioural flags and rule detections."""
    return {
        flag: getattr(ai, flag) or (signal in detected)
        for flag, signal in FLAG_TO_SIGNAL.items()
    }


def _apply_overrides(score: int, scam_type: str, flags: dict[str, bool]) -> tuple[int, str]:
    """Hard safety floors for unambiguous high-danger combinations.

    These raise the *score*; they must not relabel a call that has already been
    classified. The flags cannot tell a fake police officer apart from a fake
    "fraud department" agent, so a type is only assigned when none was decided.
    """
    unclassified = not scam_type or scam_type == "LEGITIMATE_OR_UNKNOWN"

    # Digital arrest shape: impersonation + threat + (isolation or payment).
    if flags["authority_impersonation"] and flags["fear_or_threat"] and (
        flags["isolation"] or flags["payment_request"]
    ):
        return max(score, 85), "DIGITAL_ARREST" if unclassified else scam_type

    # Full account takeover kit: credentials + remote access.
    if flags["credential_request"] and flags["remote_access_request"]:
        return max(score, 90), "REMOTE_ACCESS" if unclassified else scam_type

    # Fake fraud-department / card-verification call: impersonation plus a
    # request for a card, OTP, PIN, or security code.
    if flags["credential_request"] and flags["authority_impersonation"]:
        return max(score, 80), "FAKE_CUSTOMER_CARE" if unclassified else scam_type

    return score, scam_type


def fuse(
    ai: Optional[ScamAIResult],
    detected: set[str],
    rule_evidence: list[dict[str, Any]],
) -> dict[str, Any]:
    """Produce the final ``analysis`` object the API returns.

    ``ai`` may be ``None`` when the LLM is unavailable; the rule engine then drives
    the result on its own so the product degrades gracefully instead of failing.
    """
    rule_score = _rule_score(detected)

    if ai is not None:
        flags = _combined_flags(ai, detected)
        likelihood = ai.scam_likelihood
        fused = int(round(likelihood * AI_WEIGHT + rule_score * RULE_WEIGHT))
        scam_type = ai.scam_type
        summary = ai.summary
        confidence = ai.confidence
        threats = [t.model_dump() for t in ai.threats]
        engine = "ai+rules"
    else:
        # Rules-only mode. Likelihood mirrors the rule score so the UI still has a
        # sensible dual read-out.
        flags = {flag: (signal in detected) for flag, signal in FLAG_TO_SIGNAL.items()}
        likelihood = rule_score
        fused = rule_score
        scam_type = _rule_only_type(detected)
        summary = ""
        confidence = 60 if detected else 40
        threats = []
        engine = "rules"

    fused, scam_type = _apply_overrides(fused, scam_type, flags)
    fused = max(0, min(fused, 100))
    level = _risk_level(fused)
    action, actions = _actions_for(level)

    # Build threats from rule evidence when the LLM gave none (rules-only mode).
    if not threats:
        threats = _threats_from_rule_evidence(rule_evidence)

    signal_results = [
        {
            "id": signal_id,
            "label": definition.label,
            "detected": (signal_id in detected)
            or flags.get(_signal_to_flag(signal_id), False),
            "weight": definition.weight,
        }
        for signal_id, definition in SIGNALS.items()
    ]

    label = scam_label_for(scam_type) if scam_type else "Suspicious call"
    if not detected and (ai is None or ai.scam_likelihood < 25):
        label = "No strong scam pattern"

    return {
        "engine": engine,
        "scam_type": scam_type,
        "scam_label": label,
        "scam_likelihood": max(0, min(likelihood, 100)),
        "risk_score": fused,
        "risk_level": level,
        "confidence": confidence,
        "summary": summary,
        "recommended_action": action,
        "recommended_actions": actions,
        "signals": signal_results,
        "threats": threats,
        "evidence": rule_evidence,
        "disclaimer": "Automated screening can make mistakes. Verify through official channels.",
    }


def _signal_to_flag(signal_id: str) -> str:
    for flag, signal in FLAG_TO_SIGNAL.items():
        if signal == signal_id:
            return flag
    return signal_id


def _rule_only_type(detected: set[str]) -> str:
    """Best-effort scam category from rule signals alone (LLM-unavailable path)."""
    if {"credential_request", "authority_impersonation"}.issubset(detected):
        return "FAKE_CUSTOMER_CARE"
    if {"authority_impersonation", "fear"}.issubset(detected) and (
        "isolation" in detected or "payment_request" in detected
    ):
        return "DIGITAL_ARREST"
    if "remote_access_request" in detected:
        return "REMOTE_ACCESS"
    if "credential_request" in detected:
        return "BANK_KYC"
    if "payment_request" in detected:
        return "INVESTMENT_SCAM"
    if {"authority_impersonation", "fear"}.issubset(detected):
        return "FAKE_CUSTOMER_CARE"
    return "LEGITIMATE_OR_UNKNOWN"


def _threats_from_rule_evidence(evidence: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Turn deduplicated rule evidence into the same threat shape the UI expects."""
    seen: set[str] = set()
    threats: list[dict[str, Any]] = []
    for item in evidence:
        label = item["signal_label"]
        if label in seen:
            continue
        seen.add(label)
        threats.append(
            {
                "type": label,
                "severity": min(SIGNALS[item["signal"]].weight * 4, 100),
                "evidence": item["text"],
                "explanation": "",
            }
        )
    return threats
