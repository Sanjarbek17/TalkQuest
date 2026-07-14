"""Rubric evaluation via Claude, returning strict structured JSON (docs/functional-spec.md §6).

We force structured output with messages.parse() + a Pydantic schema so the result is
machine-parseable — "completed" is a checklist against the rubric, never a vibe.
"""

from __future__ import annotations

import json

import anthropic

from .schemas import Challenge, EvalResult

MODEL = "claude-opus-4-8"

_SYSTEM = (
    "You are an encouraging English-speaking coach. You grade a spoken-conversation "
    "transcript against an explicit rubric. Be fair and specific. 'passed' is true only "
    "when the required elements are genuinely met. Feedback must name exactly one thing "
    "done well and one specific, actionable thing to improve — supportive tone, never a "
    "red-pen grammar dump."
)


def _client() -> anthropic.Anthropic:
    # Raises a clear error if ANTHROPIC_API_KEY (or an `ant` profile) is missing.
    return anthropic.Anthropic()


def evaluate(transcript: str, challenge: Challenge, duration_seconds: float) -> EvalResult:
    rubric = challenge.rubric
    word_count = len(transcript.split())

    user_content = (
        f"CHALLENGE TOPIC: {challenge.topic}\n"
        f"INSTRUCTIONS: {challenge.instructions}\n\n"
        "RUBRIC:\n"
        f"- required_elements: {json.dumps(rubric.required_elements)}\n"
        f"- min_duration_seconds: {rubric.min_duration_seconds}\n"
        f"- min_word_count: {rubric.min_word_count}\n\n"
        "MEASURED:\n"
        f"- duration_seconds: {duration_seconds:.1f}\n"
        f"- word_count: {word_count}\n\n"
        "TRANSCRIPT:\n"
        f'"""{transcript}"""\n\n'
        "Decide `passed`, list which required_elements were met in `matched_elements`, "
        "and give `feedback`."
    )

    response = _client().messages.parse(
        model=MODEL,
        max_tokens=1024,
        system=_SYSTEM,
        messages=[{"role": "user", "content": user_content}],
        output_format=EvalResult,
    )
    return response.parsed_output
