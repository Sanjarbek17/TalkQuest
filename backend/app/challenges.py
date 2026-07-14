"""The one hardcoded challenge for the MVP thin slice.

Daily rotation / authoring / storage are deferred (see docs/functional-spec.md §10).
"""

from __future__ import annotations

from .schemas import Challenge, Rubric

TODAYS_CHALLENGE = Challenge(
    challenge_id="demo-weekend-001",
    type="prompt_response",
    topic="What you did last weekend",
    instructions=(
        "Record yourself speaking about what you did last weekend and upload the audio. "
        "Speak naturally in full sentences for at least 30 seconds."
    ),
    rubric=Rubric(
        required_topic_keywords=[
            "weekend",
            "did",
            "went",
            "saturday",
            "sunday",
        ],
        required_elements=[
            "Described at least one specific activity from the weekend",
            "Used past tense to talk about completed actions",
            "Spoke in complete sentences rather than single words",
        ],
        min_duration_seconds=30,
        min_word_count=40,
    ),
)


def get_todays_challenge() -> Challenge:
    return TODAYS_CHALLENGE
