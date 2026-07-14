"""Pydantic models for TalkQuest. Mirrors the rubric shape in docs/functional-spec.md §4."""

from __future__ import annotations

from pydantic import BaseModel, Field


class Rubric(BaseModel):
    """Explicit, checkable criteria the evaluation step grades against (§4)."""

    required_topic_keywords: list[str] = Field(default_factory=list)
    required_elements: list[str] = Field(default_factory=list)
    min_duration_seconds: int = 0
    min_word_count: int = 0


class Challenge(BaseModel):
    challenge_id: str
    type: str
    topic: str
    instructions: str
    rubric: Rubric


class ChallengePublic(BaseModel):
    """What the client is allowed to see — the rubric internals stay server-side."""

    challenge_id: str
    type: str
    topic: str
    instructions: str

    @classmethod
    def from_challenge(cls, c: Challenge) -> "ChallengePublic":
        return cls(
            challenge_id=c.challenge_id,
            type=c.type,
            topic=c.topic,
            instructions=c.instructions,
        )


class Checks(BaseModel):
    topic_ok: bool


class Feedback(BaseModel):
    """Every result carries one strength + one improvement, encouraging tone (§7)."""

    strength: str = Field(description="One specific thing the speaker did well.")
    improvement: str = Field(description="One specific, actionable thing to improve.")


class EvalResult(BaseModel):
    """Structured output returned by the Claude rubric-evaluation step (§6)."""

    passed: bool
    matched_elements: list[str] = Field(
        default_factory=list,
        description="Which of the rubric's required_elements were satisfied.",
    )
    feedback: Feedback


class SubmitResponse(BaseModel):
    passed: bool
    transcript: str
    checks: Checks
    matched_elements: list[str]
    feedback: Feedback
