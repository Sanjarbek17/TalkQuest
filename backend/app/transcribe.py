"""Self-hosted speech-to-text via faster-whisper (runs in-process, no separate server).

The model is loaded lazily once and reused across requests.
"""

from __future__ import annotations

import os
from functools import lru_cache

from faster_whisper import WhisperModel


@lru_cache(maxsize=1)
def _model() -> WhisperModel:
    size = os.getenv("WHISPER_MODEL", "base")
    # Defaults to CPU/int8 (portable, laptop-scale). The deployed server sets
    # WHISPER_DEVICE=cuda + WHISPER_COMPUTE=float16 to run on the GPU.
    device = os.getenv("WHISPER_DEVICE", "cpu")
    compute = os.getenv("WHISPER_COMPUTE", "int8" if device == "cpu" else "float16")
    return WhisperModel(size, device=device, compute_type=compute)


def transcribe(audio_path: str) -> tuple[str, float]:
    """Return (transcript_text, duration_seconds) for an audio file on disk."""
    segments, info = _model().transcribe(audio_path, language="en")
    text = " ".join(seg.text.strip() for seg in segments).strip()
    duration = float(getattr(info, "duration", 0.0) or 0.0)
    return text, duration
