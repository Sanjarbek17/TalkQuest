# English Speaking Challenge App — Functional Spec (v1 / MVP)

## 1. Core Concept
A daily English-speaking challenge app. Users get **one challenge per day**. They complete it by having a **real spoken conversation with another person on Discord** (not the app, not an AI), record themselves manually, and upload the audio to the platform. AI then evaluates the recording against that specific challenge's rubric and marks it complete/incomplete with feedback.

No bots in Discord. No live AI conversation partner in v1. No matchmaking in v1.

> **MVP deviation (2026-07-14):** the deployed slice simplifies the task to **solo speaking** — the
> user records themselves speaking on the prompt; no Discord conversation with another person is
> required. The partner-conversation concept above remains the product direction. See [[decisions]].

---

## 2. User Flow (MVP)

1. User opens app → sees **today's challenge** (topic + instructions + code phrase, see §5).
2. User goes to Discord (any server, any person) and has the conversation naturally.
3. User records themselves independently (phone voice memo, OBS, Discord's own recording — user's choice, app doesn't control this).
4. User uploads the audio file to the app against today's challenge.
5. Backend pipeline runs: **audio → transcript → rubric check → pass/fail + feedback**.
6. User sees result: pass/fail, streak update, AI feedback (1 thing done well, 1 thing to improve).

---

## 3. Challenge Types (rotate daily)

| Type | Description |
|---|---|
| Prompt Response | Answer a spoken question/topic (e.g. "What did you do this weekend?") |
| Roleplay | Simulate a scenario with another person (order coffee, job interview, complain about something) |
| Describe Scenario | Describe an image or situation aloud |
| Shadowing | Repeat and improve a given sentence/phrase naturally in conversation |
| Speak-to-Someone | Broader open conversation challenge — talk to a specific type of person about a topic |

Each challenge type needs its own **rubric shape** (see §4) — they are not interchangeable.

---

## 4. Challenge Data Model (rubric-driven)

Every challenge must be authored with explicit, checkable criteria — not vague instructions. Suggested schema:

```json
{
  "challenge_id": "string",
  "type": "prompt_response | roleplay | describe_scenario | shadowing | speak_to_someone",
  "date_released": "timestamp",
  "topic": "string (what the user must talk about)",
  "instructions": "string (shown to user)",
  "code_phrase": "string (see anti-cheat, §6)",
  "difficulty_tier": "int (used for adaptive assignment later)",
  "rubric": {
    "required_topic_keywords": ["array of expected topic-related terms/concepts"],
    "required_elements": ["e.g. 'asked a follow-up question', 'used past tense', 'responded to pushback'"],
    "min_duration_seconds": "int",
    "min_word_count": "int"
  }
}
```

The rubric is what the AI evaluation step checks against — "completed" is never a vibe, it's a checklist derived from this object.

---

## 5. Anti-Cheat / Trust Layer

Since recording is fully self-managed (no bot, no supervision), trust is the biggest risk. Layered, cheap-first approach:

1. **Code phrase** — each day's challenge screen shows a random word/phrase the user must say somewhere in their recording (e.g. "say the word 'lantern' at some point"). Transcript must contain it. This is the primary defense — cheap and effective against reused/old recordings. **MVP deviation (2026-07-14): dropped** — removed as friction for the solo-speaking MVP; topic match (§5.3) is now the only cheap anti-cheat layer. See [[decisions]].
2. **Timestamp check** — reject uploads with metadata timestamps earlier than the challenge's release time.
3. **Topic-match check** — transcript must relate to `required_topic_keywords`; auto-reject/flag if unrelated.
4. **Voice consistency (soft check)** — light voice-fingerprint comparison across a user's past submissions; flag (don't auto-block) big mismatches for manual/spot review.
5. **Stakes-based tuning** — keep verification lightweight for casual daily use (streaks/badges). Only add strict layers (e.g. manual review, stronger voice verification) if/when the app introduces real-value rewards (certificates, leaderboards with prizes).

---

## 6. AI Evaluation Pipeline

```
Audio Upload
   ↓
Speech-to-Text (transcript + timestamps)
   ↓
Anti-cheat checks (code phrase, timestamp, topic match)
   ↓  (if passed)
Rubric Evaluation (LLM call against challenge.rubric)
   ↓
Output: { pass: bool, matched_elements: [...], feedback: { strength: str, improvement: str } }
   ↓
Update user streak / progress / adaptive difficulty score
```

**LLM evaluation call should be structured/JSON output**, not freeform, so results are consistent and machine-parseable. Prompt should include: challenge object (topic, rubric), transcript, and instructions to return strict JSON with pass/fail + which rubric elements were met.

---

## 7. Feedback Design

Never return a bare "fail." Every result includes:
- ✅ One thing they did well
- 🔧 One specific thing to improve
- Delivered in an encouraging tone, not a red-pen grammar list

---

## 8. Adaptive Difficulty (post-MVP, but design for it now)

Track per user:
- Pass/fail history by challenge type and topic category
- Rolling performance score per category

Use this to select tomorrow's challenge difficulty tier — don't hardcode a fixed daily sequence. Even in MVP, log this data so the adaptive engine has history to work from later.

---

## 9. Data to Store Per Submission
- User ID, challenge ID, audio file (or transcript only, if storage/privacy is a concern), transcript, pass/fail result, matched rubric elements, timestamp, flags raised (if any)

---

## 10. Explicitly Out of Scope for v1
- Discord bot / auto-recording
- Live AI conversation partner
- Real-learner matchmaking
- Leaderboards / social competitive features
- Strict identity/voice verification

These are documented here so they're not forgotten, but should not block MVP build.

---

## Related
- [[README]] — vault index / map of content
- [[decisions]] — key decisions log
- [[progress]] — build progress tracker
