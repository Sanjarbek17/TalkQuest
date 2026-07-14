# Decisions Log

Running log of key product & technical decisions for TalkQuest. Newest first.

> Format: `YYYY-MM-DD — Decision — short rationale`

## 2026-07-14 (UX / MVP scope)
- **In-browser recording (MediaRecorder), replacing file upload as the primary flow.** — Users hit Record → speak → Stop → preview playback → Submit, no separate recording app. File upload kept as a fallback (mic denied / unsupported browser, e.g. old Safari). Recorded audio is a WebM/Opus (or MP4 on Safari) blob; the backend's ffmpeg decodes it unchanged. Needs a secure context — provided by Cloudflare HTTPS. `frontend/src/App.jsx`.
- **Evaluation shows an estimated "time left" + progress bar.** — Server processing time isn't known up front (depends on clip length + model warmth), so the bar/countdown is an estimate from the clip duration, degrading to "Finishing up…" on overrun. Honest signal beats a bare spinner. `frontend/src/App.jsx`.
- **MVP task simplified to solo speaking.** — The challenge now asks the user to record themselves speaking on the prompt; no Discord conversation with another person is required. Deviates from [[functional-spec]] §1/§10 (partner conversation stays the product direction). `backend/app/challenges.py`.
- **Code-phrase anti-cheat removed.** — Dropped the "say a magic word" requirement (friction for solo speaking); supersedes [[functional-spec]] §5.1. Topic match (§5.3) is now the only cheap anti-cheat layer. Removed from `schemas.py`, `anticheat.py`, `main.py`, `challenges.py`, and the UI.
- **Transcript shown by default; evaluating shows an elapsed timer + estimate.** — The Whisper transcript now renders inline in the result (was hidden behind a toggle), and the submit button counts up (`Evaluating… Ns`) with a "usually ~20–40s" hint, since a real submit takes ~13–35s. `frontend/src/App.jsx`.

## 2026-07-14 (deployment)
- **Rubric eval switched from Claude to a local LLM via the box's Ollama.** — Removes the external API key/cost; the whole pipeline (faster-whisper + Ollama) is now self-hosted. Model is configurable via `OLLAMA_MODEL`; recommend `qwen2.5:7b-instruct` (the 0.5b that ships is too weak for good feedback). Backend reaches host Ollama through `host.docker.internal`. Supersedes the kickoff decision to use `claude-opus-4-8` for eval. `backend/app/evaluate.py`, [[deployment]].
- **Deploy as a single Docker Compose stack on the school Docker host (`~/dev/TalkQuest/`).** — Matches the box's existing per-project convention (`~/dev/<name>/docker-compose.yml`, unique host port). App published on port `8118`. See [[deployment]].
- **Serve same-origin via a containerized nginx (frontend static + `/api` reverse-proxy).** — The frontend calls relative `/api/*`, so no build-time API URL is needed; nginx routes `/api` to the backend container. Also raises `client_max_body_size` (audio) and proxy timeouts (slow Whisper+Claude pipeline).
- **Public HTTPS via Cloudflare Tunnel, not host nginx.** — The box has no host nginx; the existing tunnel terminates TLS at Cloudflare's edge and maps `talkquest.bhgroup.uz` → `localhost:8118`.
- **Deploy is manual via `deploy.sh` on the box (no GitHub Actions).** — GitHub-hosted Actions are unavailable (account billing) and the box is campus-only / firewalled (no inbound webhooks), so automated push-triggered CD wasn't viable. After pushing, run `ssh school "~/dev/TalkQuest/deploy.sh"` (git reset --hard + `docker compose build` gate + up). Firewall-friendly automation (cron/systemd poll, or a self-hosted runner) noted as a future option. `deploy.sh`, [[deployment]].

## 2026-07-14 (build kickoff)
- **MVP stack: Web app · FastAPI + React (Vite) · self-hosted `faster-whisper` · Claude `claude-opus-4-8` for rubric eval.** — Fast for a solo dev; Whisper runs in-process (no separate STT server) for the slice; rubric eval uses structured JSON output so "completed" is a checklist, not a vibe ([[functional-spec]] §6).
- **First build = thin vertical slice, one hardcoded challenge, no auth/DB/streaks.** — Prove the core loop end-to-end before adding breadth. Deferred items tracked on [[board]].
- **Code-phrase check short-circuits before the LLM call.** — Cheapest anti-cheat first ([[functional-spec]] §5); a reused/old recording without the phrase fails without spending a Claude call.

## 2026-07-14
- **Adopted a `docs/` vault** for shared project knowledge (Obsidian-compatible plain markdown). — Lets the user follow along in Obsidian while Claude reads/writes the same files.
- **v1 uses manual self-recording + upload, no Discord bot, no live AI partner.** — See [[functional-spec]] §1, §10. Keeps MVP scope tight; trust handled by the anti-cheat layer (§5).

## Related
- [[README]] · [[functional-spec]] · [[progress]]
