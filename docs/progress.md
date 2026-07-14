# Progress

Where the build stands. Update as things move.

## Now
- [ ] Needs an **end-to-end runtime check**: install deps, run backend + frontend, upload a
  real clip, confirm pass/fail + feedback render. Code is written but not yet exercised live.

## Next (suggested from [[functional-spec]])
- [ ] Author rubrics for the other 4 challenge types (§3)
- [ ] Add persistence + auth so submissions and streaks can be stored (§9)
- [ ] Add the deferred anti-cheat layers: timestamp (§5.2), voice consistency (§5.4)

## Done
- [x] 2026-07-14 — Deployment + CI/CD set up: Docker Compose stack (FastAPI backend + nginx
  serving the built frontend and proxying `/api`), targeting the school Docker host at
  `talkquest.bhgroup.uz` via Cloudflare Tunnel. GitHub Actions builds/checks on push and
  redeploys to `main` through a self-hosted runner on the box. See [[deployment]].
- [x] 2026-07-14 — Functional spec written and moved into the `docs/` vault ([[functional-spec]])
- [x] 2026-07-14 — MVP thin vertical slice implemented: FastAPI backend (`backend/`) with the
  full pipeline (schema → whisper transcribe → code-phrase + topic anti-cheat → Claude rubric
  eval) and a React/Vite frontend (`frontend/`). Stack decisions logged in [[decisions]].
  Backend modules byte-compile; runtime verification still pending.

## Related
- [[README]] · [[board]] · [[functional-spec]] · [[decisions]]
