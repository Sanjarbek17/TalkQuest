"""TalkQuest MVP API — the thin vertical slice.

Flow (docs/functional-spec.md §6):
  audio upload -> transcript -> anti-cheat -> rubric eval -> pass/fail + feedback
"""

from __future__ import annotations

import os
import tempfile

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from . import anticheat, evaluate, transcribe
from .challenges import get_todays_challenge
from .schemas import ChallengePublic, Feedback, SubmitResponse

load_dotenv()

app = FastAPI(title="TalkQuest API", version="0.1.0")

# Frontend uses a Vite dev proxy, but keep CORS open for direct curl / other hosts.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/challenge/today", response_model=ChallengePublic)
def todays_challenge() -> ChallengePublic:
    return ChallengePublic.from_challenge(get_todays_challenge())


@app.post("/api/submit", response_model=SubmitResponse)
async def submit(audio: UploadFile = File(...)) -> SubmitResponse:
    challenge = get_todays_challenge()

    # 1. Persist the upload to a temp file for the transcriber.
    suffix = os.path.splitext(audio.filename or "")[1] or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        # 2. Transcribe.
        transcript, duration = transcribe.transcribe(tmp_path)

        # 3. Cheap-first anti-cheat. A missing code phrase is an automatic fail —
        #    short-circuit before spending an LLM call (§5).
        checks = anticheat.run_checks(transcript, challenge)
        if not checks.code_phrase_ok:
            return SubmitResponse(
                passed=False,
                transcript=transcript,
                checks=checks,
                matched_elements=[],
                feedback=Feedback(
                    strength="You submitted a recording — that's the hardest step.",
                    improvement=(
                        f'Say the code phrase "{challenge.code_phrase}" out loud somewhere '
                        "in your recording so we can verify it, then try again."
                    ),
                ),
            )

        # 4. Rubric evaluation via Claude (structured JSON).
        result = evaluate.evaluate(transcript, challenge, duration)

        return SubmitResponse(
            passed=result.passed and checks.topic_ok,
            transcript=transcript,
            checks=checks,
            matched_elements=result.matched_elements,
            feedback=result.feedback,
        )
    finally:
        os.unlink(tmp_path)
