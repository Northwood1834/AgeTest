# reaction-emoji-runner-v1 — Published compatibility port

## Status and source of truth

This is a compatibility port of the **current** `app.js` `reaction-emoji-runner-v1` factory and `renderRunner` behavior. It does not redesign or retune the published game. The prohibited historical revision is not a source and is not consulted.

## Stable identity

- `id`: `reaction-emoji-runner-v1`
- `introducedIn`: `1.0`
- `tier`: `2`
- `flavor`: `wild`
- `step`: `1`
- `family`: `reaction-emoji-runner`
- `category`: `reaction`

## Exact published task descriptor

Generation returns exactly this plain-data shape, with only `hero` varying:

```js
{
  kind: "runner",
  prompt: "タップでジャンプ！丸太を越えて",
  help: "「よーい…」のあと、横から来る 🪵 に合わせて1回タップ。",
  hero: oneOf("😀", "🤓", "🤑", "🐼"),
  leadInMs: 1500,
  travelMs: 2800,
  duration: 4800
}
```

Validation preserves those values exactly. A JSON round-trip of any published descriptor remains valid and playable without hidden state.

## Published timing and result semantics

### Normal motion

1. The scene begins in `ready` with the cue `よーい…`.
2. At exactly `leadInMs`, the log appears and travel starts.
3. Log horizontal position is the published equation:
   - `xPercent = 110 - elapsed / travelMs * 125`
4. A valid jump uses the published arc and duration:
   - duration `780 * max(1, travelMs / 2800)` = `780ms` for every published task
   - height `sin(jumpElapsed / jumpDuration * PI) * 76px`
5. The published collision gate remains exact and is checked before success:
   - collision when `14 < xPercent < 30` and jump height `< 38px`
6. Success occurs when `xPercent < 4`.
7. A pre-start input is ignored. While running, another jump may start only after the current published 780ms arc has fully ended, matching the current implementation.
8. Success means `correct: true`, with `quality = clamp(1 - elapsed / 6000, 0, 1)` and detail `華麗なひと跳びです。`.
9. Collision means `correct: false` with detail `丸太に老いを置いてきました。`.
10. The deadline begins when travel begins and preserves `duration: 4800`; timeout detail is `ゴールが先に帰りました。`.

### Reduced motion

The current accessibility branch is preserved rather than retuned:

1. `ready` lasts exactly `leadInMs`.
2. The log then appears at `left: 24%` as a deterministic static approach.
3. Input before the approach is ignored.
4. One Touch/Space/Enter after the log appears immediately succeeds with `静止画モードで、丸太を回避しました。`.
5. Its deadline begins at the approach and uses `duration: 4800`; timeout detail is `丸太が待ちくたびれました。`.
6. No continuous animation frame is booked in reduced motion.

## Production visual treatment (rules unchanged)

The legacy DOM emoji strip becomes an authored, DPR-capped canvas scene while retaining the same hero, log, positions, jump equation, collision gate, and outcomes:

- high-resolution side-on woodland road with layered trees, route posts, ground texture, and speed streaks;
- an anticipation placard and start-line pulse during the unchanged 1500ms lead-in;
- one prominent tactile stage interaction with a visible jump arc, shadow compression, and landing dust;
- a materially drawn rolling log with bark, rings, and retained collision placement;
- retained in-scene success, collision, and timeout terminals.

These are intentional visual enhancements only. There are no assets, network requests, audio, alternate obstacles, extra scoring rules, changed windows, or changed task fields.

## Input and accessibility

- The stage is focusable and keeps visible `:focus-visible` treatment.
- Touch/click activates the same jump action.
- `Space` and `Enter` activate that same action and prevent page scrolling.
- Input is ignored before approach and after a terminal result.
- Canvas has an equivalent Japanese accessible label; live status text announces ready, approach, jump, success, collision, and timeout.
- Minimum stage/button interaction surface exceeds 48 CSS pixels at 393px and 402px layouts.

## Lifecycle and determinism

- All DOM comes from `context.host.ownerDocument`.
- Normal motion uses one tracked `context.frame` loop and the published absolute-time equations at an approximately 60fps browser cadence.
- Reduced motion uses tracked `context.later` stages only and no continuous frame.
- Deadline, listeners, lead-in, frame, QA exposure, and pending interaction are owned by the context and become inert on abort/dispose.
- `context.finish` is called at most once.
- No raw timer/frame/listener lifecycle primitive, network primitive, audio API, or external asset is used.

## Acceptance proof

### Focused Node proof

- exact metadata and 10,000-generation parity against the current `app.js` factory;
- strict mutation rejection and plain JSON resume in a fresh module;
- exact normal equations, collision-before-success ordering, successful timing interval, miss, quality, timeout, and single finish;
- exact reduced static branch, ignored early input, immediate dodge, reduced timeout, and zero continuous frame;
- real Touch/Space/Enter/focus/input locks;
- 393/402 DPR3 backing, scene-state inspection, normal frame cadence, deadline, and disposal;
- owner-document ownership and forbidden-primitive source scan.

### Browser parity matrix (after explicit lane handoff)

The parity harness holds one task JSON and timing constants identical while capturing current legacy and module source side-by-side at:

- 393×852 DPR3 and 402×874 DPR3;
- normal and reduced motion;
- `ready`, `approach`, `jump`, `success`, `collision`, `timeout`.

That is 48 source captures (6 scenes × 2 viewports × 2 motion modes × legacy/module). Reports include the exact task JSON, timing constants, state evidence, overflow/resources/errors, visual comparison notes, and explicit documentation that visual polish is intentional while task/result semantics are unchanged.
