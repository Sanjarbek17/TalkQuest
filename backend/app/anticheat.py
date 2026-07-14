"""Cheap-first anti-cheat checks (docs/functional-spec.md §5).

The MVP slice keeps only the topic-match layer:
  §5.3 topic match  — transcript must relate to the challenge topic

The code-phrase layer (§5.1) was dropped for the solo-speaking MVP (see docs/decisions.md).
Timestamp (§5.2) and voice-consistency (§5.4) checks are deferred.
"""

from __future__ import annotations

from .schemas import Challenge, Checks


def topic_ok(transcript: str, keywords: list[str]) -> bool:
    if not keywords:
        return True
    low = transcript.lower()
    return any(kw.lower() in low for kw in keywords)


def run_checks(transcript: str, challenge: Challenge) -> Checks:
    return Checks(
        topic_ok=topic_ok(transcript, challenge.rubric.required_topic_keywords),
    )
