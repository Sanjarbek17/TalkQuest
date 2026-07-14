# TalkQuest backend — FastAPI + faster-whisper + Claude eval.
FROM python:3.12-slim

# ffmpeg: robust audio decoding for faster-whisper (m4a/webm/etc.).
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# HF_HOME points the Whisper model cache at a mounted volume (see docker-compose.yml)
# so the model isn't re-downloaded on every rebuild.
ENV HF_HOME=/models \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
