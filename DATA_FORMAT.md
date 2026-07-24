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
│     ├ xp
│     ├ sessionsCompleted
│     ├ bestScore
│     ├ templateWins     stable template ID → correct count
│     ├ recentTemplates  recent stable template IDs
│     ├ categoryStats    asked/correct/bestMs by category
│     ├ history          at most 30 completed-session summaries
│     ├ activeSession    unfinished generated 12-question set or null
│     ├ cooldownUntil    epoch milliseconds
│     ├ lastResult       most recent completed summary or null
│     └ pendingResult    whether to reopen that result after reload
└ activeProfileId        profile selected in the UI
```

Each profile owns its progress, cooldown, unfinished session, and history. Switching profiles never merges those records. An active session stores its generated task descriptors and answers so a reload or temporary exit cannot produce a different question set or award the same answered question twice. XP and category statistics are written after each answer. Incomplete sessions remain resumable and do not receive a final score, grade, or history entry.

The normalizer migrates the earlier pilot's single `profile` plus root-level session fields into a one-entry `profiles` array. At most six normalized profiles are retained.

## Compatibility rules

- Stable `templateId` values are never reused for semantically different tasks. Each generated task records its required `tier`; session generation excludes factories above the brain level present at session start.
- New problem templates are additive and do not require a schema change.
- A change that removes or reinterprets stored fields requires a versioned migration before writeback.
- Unknown top-level additive fields are preserved by the current normalizer.
- History is capped at 30 summaries; task-level answers are discarded when a session is summarized.

## Cross-app rule

This namespace is independent of the sister projects. The app does not read or write their storage keys, does not expose a cross-app link, and does not include its dataset in their backup container. Future online ranking must follow [`RANKING_DESIGN.md`](RANKING_DESIGN.md) and cannot silently reinterpret this local document as upload consent.
