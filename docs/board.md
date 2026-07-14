---

kanban-plugin: board

---

## Backlog

- [ ] Adaptive difficulty engine — select tomorrow's tier from history ([[functional-spec]] §8)
- [ ] Voice-consistency soft check (voice fingerprint across submissions) ([[functional-spec]] §5.4)
- [ ] Timestamp metadata anti-cheat check ([[functional-spec]] §5.2)
- [ ] Streak / progress tracking + user profile
- [ ] Auth + Postgres persistence + submission storage ([[functional-spec]] §9)
- [ ] Daily challenge rotation + rubric authoring for all 5 types ([[functional-spec]] §3)


## To Do

- [ ] Author the remaining 4 challenge-type rubric shapes ([[functional-spec]] §3)


## In Progress



## Done

- [x] Write functional spec ([[functional-spec]])
- [x] Set up `docs/` Obsidian vault
- [x] Create Kanban board
- [x] Define challenge data model / schema — `backend/app/schemas.py` ([[functional-spec]] §4)
- [x] Speech-to-text: audio → transcript (self-hosted faster-whisper) — `backend/app/transcribe.py`
- [x] Code-phrase anti-cheat check (short-circuits before LLM) — `backend/app/anticheat.py` ([[functional-spec]] §5.1)
- [x] Topic-match check — `backend/app/anticheat.py` ([[functional-spec]] §5.3)
- [x] LLM rubric evaluation — strict JSON via Claude — `backend/app/evaluate.py` ([[functional-spec]] §6)
- [x] Submission pipeline + routes — `backend/app/main.py`
- [x] React frontend (challenge view, upload, result card) — `frontend/`
- [x] Deploy to school server — **live at https://talkquest.bhgroup.uz**: Docker Compose stack (backend + nginx), Cloudflare Tunnel, fully self-hosted (Ollama grading), manual `deploy.sh` ([[deployment]])
- [x] End-to-end runtime verification — confirmed the full loop live (audio → transcript → anti-cheat → Ollama eval → pass/fail + feedback) ([[progress]])


%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false,false,false,false]}
```
%%
