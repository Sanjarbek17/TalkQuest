# Decisions Log

Running log of key product & technical decisions for TalkQuest. Newest first.

> Format: `YYYY-MM-DD — Decision — short rationale`

## 2026-07-14 (build kickoff)
- **MVP stack: Web app · FastAPI + React (Vite) · self-hosted `faster-whisper` · Claude `claude-opus-4-8` for rubric eval.** — Fast for a solo dev; Whisper runs in-process (no separate STT server) for the slice; rubric eval uses structured JSON output so "completed" is a checklist, not a vibe ([[functional-spec]] §6).
- **First build = thin vertical slice, one hardcoded challenge, no auth/DB/streaks.** — Prove the core loop end-to-end before adding breadth. Deferred items tracked on [[board]].
- **Code-phrase check short-circuits before the LLM call.** — Cheapest anti-cheat first ([[functional-spec]] §5); a reused/old recording without the phrase fails without spending a Claude call.

## 2026-07-14
- **Adopted a `docs/` vault** for shared project knowledge (Obsidian-compatible plain markdown). — Lets the user follow along in Obsidian while Claude reads/writes the same files.
- **v1 uses manual self-recording + upload, no Discord bot, no live AI partner.** — See [[functional-spec]] §1, §10. Keeps MVP scope tight; trust handled by the anti-cheat layer (§5).

## Related
- [[README]] · [[functional-spec]] · [[progress]]
