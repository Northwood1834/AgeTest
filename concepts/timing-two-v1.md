# timing-two-v1 — Compatibility Port Concept

Status: compatibility port implemented; exact v1.15 timing semantics, same-task browser parity, lifecycle, and independent full-resolution review passed.

## Identity

- Stable ID: `timing-two-v1`
- Introduced: `1.15`
- Category: `timing`
- Family / step: `timing-two` / `1`
- Tier / flavor: `1` / `classic`

## Immutable task JSON

```js
{
  kind: "timing",
  prompt: "体内時計で2秒を測って",
  help: "スタート後、2秒だと思ったらタップ。",
  targetSeconds: 2,
  toleranceMs: 600,
  duration: 8000
}
```

Generation reads no randomness and adds no renderer state. This exact plain JSON resumes unchanged.

## Immutable timing semantics

- Disabled native button displays `3` at render, `2` at exactly 1000 ms, and `1` at exactly 2000 ms.
- Measurement begins automatically at exactly 3000 ms.
- Begin records real `performance.now()`, enables and focuses the button, gives the orb its static running rim, changes visible help to `数字は出ません。己を信じて。`, and sets the exact CTA `2秒だと思ったら、タップ！`.
- The CTA text is never substituted. Typography may fit that exact copy onto one line at 390–430 CSS px.
- No elapsed clock, progress bar, progress arc, ticks, count, cadence, tolerance cue, or rhythmic animation is visible after begin. The shared timer track is hidden while mounted.
- Stop uses real `elapsed = performance.now() - started`.
- `diff = Math.abs(elapsed - 2000)`; success is exactly inclusive `diff <= 600`.
- Result is exactly `{reactionMs: Math.round(elapsed), quality: clamp(1 - diff / (600 * 2.6), 0, 1), detail: `あなたの2秒は ${(elapsed / 1000).toFixed(2)} 秒でした。`}`.
- At begin, a tracked internal deadline of `2000 + 2200 = 4200 ms` starts. It finishes incorrect with exact detail `4秒を超えました。時空から戻ってください。`.
- Persisted `duration: 8000` remains unchanged; it is not substituted for the renderer-owned internal deadline.
- Stop and timeout are mutually exclusive and commit at most once.

## Input and accessibility

- Countdown input is disabled and inert.
- Pointer/touch and native Enter/Space clicks use one stop path.
- Begin focuses the stop button without scrolling; `:focus-visible` provides a clear high-contrast ring.
- Countdown/help/result are polite live regions.
- The exact CTA remains readable on one line from 390 through 430 CSS px in normal and reduced modes.

## Visual contract

Retain current `renderTiming` hierarchy: lavender orb above one large countdown/stop button. Production finish may add only non-informative material and post-result causality:

- dimensional lavender orb shading and the current static running rim;
- tactile purple enabled panel while preserving 11 rem geometry;
- exact separate `○ 正解` or `× 残念` result heading plus unchanged result detail after stop;
- terminal result below the button without overlap.

No visual element may function as a clock or reveal progress/tolerance/success before stop.

## Lifecycle and performance

- Nodes use `context.host.ownerDocument.createElement`.
- Countdown uses `context.later`; timeout uses `context.setDeadline`; input uses `context.listen`.
- Normal and reduced modes use no RAF. Reduced mode retains the same nonzero 1000/2000/3000 ms tracked stages.
- A game-scoped parent selector hides the shared visual timer only while mounted. Dynamic help occupies the current renderer's external help position when available, with an isolated fallback.
- Disposal clears countdown work, deadline, listeners, QA, and finish capability.
- No raw timers/listeners/RAF, network, audio, storage, or assets.

## Evidence gate

Focused tests pin exact metadata/task JSON, strict validation, helper independence, 3/2/1/begin timing, exact CTA, hidden clock, inclusive 1400/2600 ms boundaries, early1.00/win2.00/late3.00 results, quality/detail, 4200 ms timeout, native input, locks, resume, reduced stages, and disposal.

Browser parity freezes one task for LEGACY/MODULE full-source frames at 393×852 and 402×874 DPR 3, normal/reduced, for countdown3/countdown2/countdown1/running/early1.00/win2.00/late3.00/timeout4200. Real gates cover touch, keyboard/focus, 390/430, timer hiding, errors/external/overflow, performance, deadline, and disposal.
