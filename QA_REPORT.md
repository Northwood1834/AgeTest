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
- v1.2.2 timing feedback verified in-browser: flash-memory choices remained hidden at 4.5 seconds and appeared after 5.0 seconds; memory-path input remained disabled at 4.5 seconds and enabled after 5.0 seconds; its three cells stayed lit for 750ms each across the five-second phase. Date and partner conversations retained their tightened 18-second and 20-second limits and both completed correctly.
- v1.2.3 pace selector persisted per profile, exposed correct `aria-pressed` state, and locked the selected pace into a started set. Changing the profile while a set was saved clearly deferred the new pace until the next set.
- 6,000 generated sessions (1,000 per level in each pace) retained 12 unique tasks, all four flavors, tier gates, and the level-2/3 boss at position 6. Every eligible relaxed deadline was exactly 1.5×; date/partner became 27/30 seconds; signal, target, and timing remained unchanged; runner used clearance 26 instead of 38 without changing travel speed.
- An actual correct answer in relaxed mode awarded 16 XP and updated its template win and category statistics. Synthetic completion of the relaxed set produced a marked result and consumed one set while leaving `bestScore` and standard history unchanged; a following standard set updated both best score and history. The result and share paths label relaxed mode.
- Computed styles verified 16px question help, answers, dialogue, and dialogue choices; 48px dialogue/soft/close controls; and 52px normal answers. Contrast assertions passed at 4.5:1 or higher for muted text on white/background, success/failure text, action-gradient endpoints, and question help.
- v1.2.4 FPS regression reproduced: negative-`translateZ` targets hit-tested as the `.stage3d-world` plane rather than their buttons. With the world plane made noninteractive and target buttons explicitly interactive, `elementFromPoint` resolved to all eight targets at every depth. Three real coordinate clicks removed the three 🤓 buttons one by one, advanced `LOCK 0/3` through `3/3`, and completed correctly.
- v1.2.4 time-perception sequence sampled as disabled `3` at 0ms, `2` at 1.1s, `1` at 2.1s, then an enabled response button after 3.0s without a start tap. Controlled 3.00s and 5.00s responses both completed correctly; the orb exposed no periodic animation cue and the progress track stayed hidden only for timing tasks before returning on the next normal task.
- The four Krea2 WebP assets load at 768×960; direct visual review found the intended distinct adult/SFW characters and no text/watermark defects.
- Fresh v1.2.3 320×900 headless Chrome captures showed no horizontal clipping or overlap on the home screen or profile/pace dialog; the larger primary and pace controls remained fully visible.
- Initial-load network capture contained only same-origin app requests; no app XHR/fetch/WebSocket/telemetry was present. CSP retains `connect-src 'none'`.
- All published HTML/CSS/JS/manifest/icon/OG/author/conversation-image assets returned HTTP 200 from the static server.

## Deliberately deferred

- iPhone Safari hardware test and iOS text-size accessibility test: explicitly scheduled with the author for later.
- Android Chrome hardware test.
- Difficulty and timing retuning based on pilot-player feedback; current values are game rules, not clinical norms.

See `PILOT_DECISIONS.md` for author-review items and `PILOT_TODO.md` for remaining hardware checks.
