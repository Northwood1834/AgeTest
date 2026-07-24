# Data and compatibility contract

## Storage

「初老テスト」 stores one JSON document in same-origin localStorage under:

```text
shoro-test-state-v1
```

The document has `schema: "shoro-test"` and `schemaVersion: 1`.

```text
state
├ profiles               1–6 local user profiles
│  └ profile
│     ├ id, name, avatar
│     ├ paceMode         `standard` or `relaxed`
│     ├ xp
│     ├ sessionsCompleted
│     ├ bestScore
│     ├ templateWins     stable template ID → correct count
│     ├ recentTemplates  recent stable template IDs
│     ├ categoryStats    asked/correct/bestMs by category
│     ├ history          at most 30 ranked standard-mode summaries
│     ├ activeSession    unfinished generated 12-question set or null; locks paceMode
│     ├ trainingWindowStartedAt  start of rolling 20-hour window
│     ├ setsInWindow     completed sets in that window (0–6)
│     ├ cooldownUntil    end of ten-minute midpoint break or training window
│     ├ lastResult       most recent completed summary or null
│     └ pendingResult    whether to reopen that result after reload
└ activeProfileId        profile selected in the UI
```

Each profile owns its progress, pace choice, cooldown, unfinished session, and history. Switching profiles never merges those records. An active session stores its selected `paceMode`, generated task descriptors, and answers so a reload or temporary exit cannot change pace, produce a different question set, or award the same answered question twice. XP and category statistics are written after each answer. Incomplete sessions remain resumable and do not receive a final score, grade, or history entry.

`relaxed` multiplies deadlines for reading, selection, memory recall, and multi-step interaction tasks by 1.5, resulting in 27/30-second conversation tasks. The 5-second memory exposure, simple reaction tasks, and interval-timing targets are unchanged; the runner uses a wider clearance threshold. Relaxed sessions still award XP, update category practice statistics, count toward the six-set window, and produce an on-screen result, but their result has `ranked: false` and is not written to `bestScore` or `history`. Existing profiles and histories normalize to standard mode.

The normalizer migrates the earlier pilot's single `profile` plus root-level session fields into a one-entry `profiles` array. At most six normalized profiles are retained. Profiles saved before v1.1 have no training-window fields; their old one-set cooldown is cleared once during normalization. When a v1.1 profile first loads in v1.2, sets 1–2 and set 4 are released immediately under the new two-block rule; a profile stopped after set 3 receives the remaining five minutes needed to make the midpoint break ten minutes.

## Compatibility rules

- Stable `templateId` values are never reused for semantically different tasks. Each generated task records its required `tier`; session generation excludes factories above the brain level present at session start.
- New problem templates are additive and do not require a schema change.
- A change that removes or reinterprets stored fields requires a versioned migration before writeback.
- Unknown top-level additive fields are preserved by the current normalizer.
- History is capped at 30 summaries; task-level answers are discarded when a session is summarized.

## Cross-app rule

This namespace is independent of the sister projects. The app does not read or write their storage keys, does not expose a cross-app link, and does not include its dataset in their backup container. Future online ranking must follow [`RANKING_DESIGN.md`](RANKING_DESIGN.md) and cannot silently reinterpret this local document as upload consent.
