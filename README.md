# TalkQuest

Daily English-speaking challenge app. See [`docs/functional-spec.md`](docs/functional-spec.md)
for the product spec and [`docs/`](docs/) (an Obsidian vault) for the project board and decisions.

This repo currently implements the **MVP thin vertical slice**: see today's challenge → upload
audio → transcribe (self-hosted Whisper) → anti-cheat (code phrase + topic) → Claude rubric
evaluation → pass/fail + feedback.

## Stack

- **Backend:** Python + FastAPI (`backend/`)
- **Frontend:** React + Vite (`frontend/`)
- **Speech-to-text:** self-hosted `faster-whisper` (in-process)
- **Rubric evaluation:** Claude (`claude-opus-4-8`) via the `anthropic` SDK

## Run it

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then put your ANTHROPIC_API_KEY in .env
uvicorn app.main:app --reload
```

The first request downloads the Whisper model (one-time delay). API runs at
`http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`). `/api` is proxied to the backend.

## Quick API smoke test (no UI)

Record ~30s of yourself answering "what you did last weekend" and saying the word **lantern**,
then:

```bash
curl -F "audio=@clip.m4a" http://localhost:8000/api/submit
```

Expect JSON with a transcript, both checks `true`, and `feedback`. A clip that omits "lantern"
returns `passed: false` with `code_phrase_ok: false` and makes **no** LLM call (cheap-first
anti-cheat).
