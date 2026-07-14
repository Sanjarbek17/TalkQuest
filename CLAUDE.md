# TalkQuest

Daily English-speaking challenge app. Users get one challenge/day, have a real spoken
conversation with another person on Discord, self-record, and upload audio. AI evaluates
the recording against the challenge rubric and returns pass/fail + feedback.

## Project docs vault (READ THESE)

Project knowledge lives in `docs/` as an Obsidian-style markdown vault. The user follows
along in Obsidian; these are the shared source of truth. At the start of work:

- `docs/README.md` — vault index / map of content. **Start here.**
- `docs/functional-spec.md` — v1 / MVP spec. The source of truth for what we're building.
- `docs/board.md` — Trello-like Kanban board (Backlog / To Do / In Progress / Done).
- `docs/progress.md` — what's done / in progress / next.
- `docs/decisions.md` — running log of key product & technical decisions.

## Working agreement

- **Read `docs/` before acting** so you have current project context.
- **Keep the vault updated as you work** — it's shared memory with the user:
  - Move a card to **In Progress** in `docs/board.md` when you start it; to **Done** (`[x]`)
    when finished. Update `docs/progress.md` to match.
  - Record notable choices in `docs/decisions.md` (dated, newest first).
- **Preserve Obsidian conventions**: link notes with `[[note-name]]` (no `.md`, no path);
  keep the Kanban front-matter/settings block in `board.md` intact so it still renders.
- Keep each note single-topic; the spec is authoritative — don't contradict it silently,
  raise it instead.
