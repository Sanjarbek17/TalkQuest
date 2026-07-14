# TalkQuest backend — FastAPI + faster-whisper (GPU-capable) + Ollama eval.
FROM python:3.12-slim

# ffmpeg: robust audio decoding for faster-whisper (m4a/webm/etc.).
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# HF_HOME points the Whisper model cache at a mounted volume (see docker-compose.yml)
# so the model isn't re-downloaded on every rebuild.
# LD_LIBRARY_PATH lets CTranslate2 (faster-whisper) find the CUDA libs installed below,
# so the model can run on the GPU when WHISPER_DEVICE=cuda.
ENV HF_HOME=/models \
    PYTHONUNBUFFERED=1 \
    LD_LIBRARY_PATH=/usr/local/lib/python3.12/site-packages/nvidia/cublas/lib:/usr/local/lib/python3.12/site-packages/nvidia/cudnn/lib

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir nvidia-cublas-cu12 nvidia-cudnn-cu12

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
