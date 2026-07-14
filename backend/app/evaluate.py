"""Rubric evaluation via a local LLM (Ollama), returning strict structured JSON
(docs/functional-spec.md §6).

We force structured output with Ollama's `format` = JSON schema so the result is
machine-parseable — "completed" is a checklist against the rubric, never a vibe.
The whole eval runs on a self-hosted model, so no external API key is needed.
"""

from __future__ import annotations

import json
import os

from ollama import Client

from .schemas import Challenge, EvalResult

# Points at the host's Ollama. In the container this is overridden to
# http://host.docker.internal:11434 (see docker-compose.yml); locally it defaults
# to localhost. OLLAMA_MODEL should be a capable instruct model (e.g. qwen2.5:7b-instruct);
# qwen2.5:0.5b works for wiring but is too small for good feedback.
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:0.5b")

_SYSTEM = (
    "You are an encouraging English-speaking coach. You grade a spoken-conversation "
    "transcript against an explicit rubric. Be fair and specific. 'passed' is true only "
    "when the required elements are genuinely met. Feedback must name exactly one thing "
    "done well and one specific, actionable thing to improve — supportive tone, never a "
    "red-pen grammar dump. Respond with JSON only, matching the requested schema."
)


def _client() -> Client:
    return Client(host=OLLAMA_HOST)


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

    response = _client().chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": _SYSTEM},
            {"role": "user", "content": user_content},
        ],
        format=EvalResult.model_json_schema(),
        options={"temperature": 0},
    )
    return EvalResult.model_validate_json(response["message"]["content"])
