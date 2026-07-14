# Progress

Where the build stands. Update as things move.

## Now
- [x] In-browser recording added — Record → preview → Submit (file upload kept as fallback), plus an
  estimated "time left" progress bar during evaluation. `frontend/src/App.jsx`. See [[decisions]].
- [x] End-to-end runtime check **done** — the deployed stack was exercised live (uploaded a real
  clip, confirmed transcript → anti-cheat → grade → pass/fail + feedback). App is live in production.

## Next (suggested from [[functional-spec]])
- [ ] Author rubrics for the other 4 challenge types (§3)
- [ ] Add persistence + auth so submissions and streaks can be stored (§9)
- [ ] Add the deferred anti-cheat layers: timestamp (§5.2), voice consistency (§5.4)

## Done
- [x] 2026-07-14 — **Deployed live at https://talkquest.bhgroup.uz.** Docker Compose stack
  (FastAPI backend + nginx serving the built frontend and proxying `/api`) on the school Docker
  host, exposed via Cloudflare Tunnel. Fully self-hosted pipeline: faster-whisper transcription +
  Ollama (`qwen2.5:7b-instruct`) grading — no external API key. Verified end-to-end (audio upload →
  transcript → anti-cheat → pass/fail + feedback). Deploys are manual via `deploy.sh`
  (GitHub Actions unavailable — billing; box firewalled). See [[deployment]].
- [x] 2026-07-14 — Functional spec written and moved into the `docs/` vault ([[functional-spec]])
- [x] 2026-07-14 — MVP thin vertical slice implemented: FastAPI backend (`backend/`) with the
  full pipeline (schema → whisper transcribe → code-phrase + topic anti-cheat → Claude rubric
  eval) and a React/Vite frontend (`frontend/`). Stack decisions logged in [[decisions]].
  Backend modules byte-compile; runtime verification still pending.

## Related
- [[README]] · [[board]] · [[functional-spec]] · [[decisions]]
