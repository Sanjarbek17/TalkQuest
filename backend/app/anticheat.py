"""Cheap-first anti-cheat checks (docs/functional-spec.md §5).

Only the two cheapest layers are in the MVP slice:
  §5.1 code phrase  — primary defense against reused/old recordings
  §5.3 topic match  — transcript must relate to the challenge topic

Timestamp (§5.2) and voice-consistency (§5.4) checks are deferred.
"""

from __future__ import annotations

from .schemas import Challenge, Checks


def code_phrase_ok(transcript: str, code_phrase: str) -> bool:
    return code_phrase.lower() in transcript.lower()


def topic_ok(transcript: str, keywords: list[str]) -> bool:
    if not keywords:
        return True
    low = transcript.lower()
    return any(kw.lower() in low for kw in keywords)


def run_checks(transcript: str, challenge: Challenge) -> Checks:
    return Checks(
        code_phrase_ok=code_phrase_ok(transcript, challenge.code_phrase),
        topic_ok=topic_ok(transcript, challenge.rubric.required_topic_keywords),
    )
