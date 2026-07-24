# Pilot QA report

Date: 2026-07-25  
Environment: local static server, desktop Chromium browser automation, headless Chrome for 320px capture, Node.js syntax check.

## Verified

- `app.js` parses successfully and the catalog contains 52 unique factory IDs.
- Every one of the first 50 factories was played through its correct interaction path in five browser batches; the two later additions (`language-english-v1`, `social-partner-mood-v1`) were then played correctly as well.
- Final build: all 52 factories generated and rendered without an exception across 21 renderer kinds.
- Randomized generator check: 300 generations per factory (15,600 generated tasks) produced no missing answer, duplicate option, unknown category, invalid tier, or generator error.
- Session selector check: 3,000 generated sessions across brain levels 1–3 had 12 unique tasks, no tier leak, category count at most two, all four play flavors, no Tier-1 boss, and the author boss at position 6 for levels 2–3.
- Grade boundaries verified: 85/84 → 処老/初老, 60/59 → 初老/中老, 40/39 → 中老/大老.
- A real 12-task Tier-1 session completed 12/12 correct, produced 100 points / 処老, one history entry, and no active session. A subsequent full v1.2 session registered completion inside the first three-set block, left no cooldown, and immediately enabled the next set.
- v1.2 pacing cycle verified with six completed synthetic sets: sets 1–2 had no forced break; set 3 produced an approximately ten-minute midpoint break; sets 4–5 had no forced break; set 6 blocked play until the first set's rolling 20-hour window ended. One second before each boundary remained blocked and one second after it enabled the intended next block/window.
- Partial-session exit, profile switch, and return preserved the answered index and remaining generated task set without consuming a completed-set allowance.
- Single-profile pilot data migrated to `profiles[]`; legacy root session fields were removed on writeback and an unknown additive top-level field survived normalization. A v1.0 profile with a future one-set cooldown migrated with a fresh window on start. v1.1 profiles after sets 1–2 or 4 were released immediately under the new block rule, while a profile after set 3 received the remaining five minutes needed for the ten-minute midpoint break.
- Six-profile cap, active profile switching, per-profile history, per-profile best ten, and six-entry local leaderboard rendered correctly.
- Emoji runner: production `travelMs: 2800` succeeded with one jump at about 1.62 seconds and finished at about 2.38 seconds. The reduced-motion static alternative also succeeded.
- Author boss, emoji FPS, lane choice, golf drag, golf Enter-key fallback, date conversation, partner conversation, and English-only question paths succeeded.
- The four Krea2 WebP assets load at 768×960; direct visual review found the intended distinct adult/SFW characters and no text/watermark defects.
- 320×900 headless Chrome capture showed no horizontal clipping on the home screen.
- Initial-load network capture contained only same-origin app requests; no app XHR/fetch/WebSocket/telemetry was present. CSP retains `connect-src 'none'`.
- All published HTML/CSS/JS/manifest/icon/OG/author/conversation-image assets returned HTTP 200 from the static server.

## Deliberately deferred

- iPhone Safari hardware test and iOS text-size accessibility test: explicitly scheduled with the author for later.
- Android Chrome hardware test.
- Difficulty and timing retuning based on pilot-player feedback; current values are game rules, not clinical norms.

See `PILOT_DECISIONS.md` for author-review items and `PILOT_TODO.md` for remaining hardware checks.
