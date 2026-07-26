# timing-five-v1 — Compatibility Port Concept

Status: compatibility port implemented; exact timing semantics, same-task browser parity, lifecycle, and independent full-resolution review passed.

## Identity

- Stable ID: `timing-five-v1`
- Introduced: `1.0`
- Category: `timing`
- Family / step: `timing-five` / `1`
- Tier / flavor: `2` / `wild`

## Immutable published task contract

Generation returns only:

```js
{
  kind: "timing",
  prompt: "体内時計で5秒を測って",
  help: "スタート後、5秒だと思ったらタップ。",
  targetSeconds: 5,
  toleranceMs: 800,
  duration: 12000
}
```

There is no generated random field, countdown field, elapsed field, answer, or renderer state. The exact JSON shape resumes unchanged.

## Immutable countdown and timing semantics

- On render the stop button is disabled and displays `3`.
- It displays `2` at exactly `1000 ms` and `1` at exactly `2000 ms`.
- Measurement begins automatically at exactly `3000 ms`.
- At begin:
  - `started = performance.now()`;
  - the button becomes enabled;
  - its enabled CTA becomes the exact single-line `ストップ！`;
  - the orb enters its published running state;
  - visible help becomes `数字は出ません。己を信じて。`;
  - the stop button receives focus;
  - a tracked internal deadline starts for `targetSeconds * 1000 + 2200 = 7200 ms`.
- Before begin, visible help is exactly `3・2・1のあと、自動で計測が始まります。`.
- No elapsed clock, progress arc, count, rhythmic pulse, or timer-bar progress is shown after begin.
- A stop uses real elapsed time `performance.now() - started`.
- `diff = Math.abs(elapsed - 5000)` and success is exactly `diff <= 800`; the tolerance is not widened.
- Stop result is exactly:
  - `reactionMs: Math.round(elapsed)`;
  - `quality: clamp(1 - diff / (800 * 2.6), 0, 1)`;
  - `detail: あなたの5秒は ${(elapsed / 1000).toFixed(2)} 秒でした。`.
- The internal deadline is measured from begin, not render. At 7200 ms after begin it finishes incorrect with `7秒を超えました。時空から戻ってください。`.
- The persisted `duration: 12000` remains unchanged even though the published renderer owns the earlier 3000 + 7200 ms timeout sequence.
- Stop and timeout are mutually exclusive and finish at most once.

## Input and accessibility

- The stop control remains one native button with the same visible countdown and running instruction.
- Pointer/touch, native Enter, and native Space use the same stop path.
- Disabled countdown input cannot answer.
- Begin focuses the button without scrolling; `:focus-visible` has a clear high-contrast ring.
- Countdown and result text use polite live regions.
- The game remains usable from 390 to 430 CSS pixels at DPR 3 without horizontal overflow.

## Production-finish visual contract

Retain the published hierarchy: one lavender orb above one large stop button. Improvements may add only non-informative material and causal finish polish:

- dimensional lavender orb shading and soft surface depth;
- clear countdown typography and a tactile purple stop surface;
- the published static running rim with no cadence that could serve as a clock;
- distinct early, in-tolerance, late, and timeout terminal treatment after timing is complete;
- a compact result panel below the control so it never obscures the orb or stop target.

No decoration may reveal elapsed time, tolerance bounds, progress, ticks, rhythm, or success before stop.

## Lifecycle and performance

- All nodes come from `context.host.ownerDocument.createElement`.
- Countdown stages use `context.later`; the internal timeout uses `context.setDeadline`; input uses `context.listen`.
- Normal and reduced motion require no continuous frame loop. Reduced mode still advances through the same nonzero 1000/2000/3000 ms tracked countdown stages.
- A game-scoped parent selector hides the shared visual timer track only while this game is mounted, preserving the published hidden timer-bar behavior without mutating shared source or DOM.
- Disposal cancels countdown stages, deadline, listeners, QA, and finish capability.
- No network, storage, audio, assets, raw timers, raw RAF, or raw event listeners.

## Port evidence gate

Focused Node evidence covers exact metadata/task JSON, strict validation, hostile call independence, plain resume, 3/2/1/begin timing, hidden elapsed display, exact early/boundary/win/late calculations and two-decimal detail, 7200 ms internal timeout, disabled/countdown input, keyboard/pointer parity, double-finish lock, reduced nonzero stages, and disposal.

After explicit screw-lane handoff, browser evidence freezes one task for full-source LEGACY/MODULE captures at 393×852 and 402×874 DPR 3, normal and reduced, for countdown 3, countdown 2, countdown 1, running, early, win, late, and timeout. It also proves exact real timing/results, touch/keyboard/focus, hidden timer bar, 390/430 layout, errors, external requests, overflow, performance, and disposal.
