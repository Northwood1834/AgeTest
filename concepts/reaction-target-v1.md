# reaction-target-v1 — Compatibility Port Concept

Status: compatibility port implemented; focused semantics, same-stream browser parity, lifecycle, and full-resolution review passed.

## Identity

- Stable ID: `reaction-target-v1`
- Introduced: `1.0`
- Category: `reaction`
- Family / step: `reaction-target` / `1`
- Tier / flavor: `1` / `wild`

## Immutable published task contract

Generation returns only this plain-data shape:

```js
{
  kind: "target",
  prompt: "逃げる紫をつかまえて",
  help: "背景を押すと逃亡成功です。",
  x: randomInt(8, 72),
  y: randomInt(10, 62),
  duration: 5000
}
```

`x` and `y` remain inclusive safe integers in the published ranges. No velocity, seed, answer, response window, appearance delay, or display-only field is persisted. Saved tasks remain ordinary JSON and resume without derivation or migration.

## Immutable interaction and result semantics

- The arena is immediately present but the target remains hidden for exactly `450 ms`.
- At appearance, its top-left position is the clamped published equation:
  - `x = clamp(task.x / 100 * arenaWidth, 0, arenaWidth - targetWidth)`;
  - `y = clamp(task.y / 100 * arenaHeight, 0, arenaHeight - targetHeight)`.
- Reduced motion paints that position once and leaves the target static.
- Normal motion consumes the current random stream in the same order and keeps the published equations:
  - horizontal speed magnitude: `arenaWidth * (0.4 + random * 0.1)`;
  - vertical speed magnitude: `arenaHeight * (0.36 + random * 0.1)`;
  - each initial direction is selected by a separate preceding random value;
  - elapsed frame delta is clamped to `0..0.04 s`;
  - each wall collision clamps to that wall, reverses inward, and resamples the corresponding speed magnitude.
- A real pointer down on the actual target catches it. A zero-detail keyboard click on the focused target uses the same catch path. There is no enlarged or invisible hit area.
- Catch result is exactly `{reactionMs: Math.round(ms), quality: clamp(1-ms/4000,0,1), detail: `確保まで ${Math.round(ms)} ms`}` and is correct.
- Any click on arena background is immediately incorrect with detail `そこにはもう、紫はいません。`, including before appearance.
- The `5000 ms` deadline is measured from render, not appearance. Timeout is incorrect with detail `紫は逃げ切りました。`.
- Catch, background miss, and timeout are mutually exclusive and finish at most once.

## Input and accessibility

- The target remains a native button labelled `紫の的`.
- Pointer/touch acts only on its exact visible box.
- Tab focus and a visible focus ring expose the published native keyboard click path.
- Once the target appears, arrow keys from the focused arena move focus spatially to the target; Enter/Space then catches through the native zero-detail click. This adds reachability, not a larger hitbox or easier reaction rule.
- The arena has a concise accessible label and terminal state is announced without exposing position or answer early.
- Usable from 390 to 430 CSS pixels and at DPR 3 without horizontal overflow.

## Production-finish visual contract

Retain the same purple circular moving target in a pale purple bounded arena. Improvements may add only material and causal polish:

- a layered lavender arena surface with inset depth and restrained edge lighting;
- the same 3.2 rem target hit box, rendered as a dimensional purple orb with the published white inner ring;
- visible focus, catch compression/ring, background-miss disturbance, and distinct timeout hierarchy;
- all lanes of information remain unchanged: prompt, help, arena, target visibility/position/motion, and terminal outcome.

No decorative label may reveal position, speed, direction, reaction time, or catch timing before the relevant result.

## Lifecycle and performance

- Every node is created with `context.host.ownerDocument.createElement`.
- Appearance uses `context.later`; deadline uses `context.setDeadline`; normal movement uses one tracked `context.frame`; input uses `context.listen`.
- No raw timers, RAF, or `addEventListener`; no network, storage, audio, assets, or continuous reduced-motion frame.
- Disposal stops appearance, deadline, movement, listeners, QA, and all finish capability.
- Validation and generation are strictly bounded.

## Port evidence gate

Focused Node evidence covers exact generation/validation, hostile helper bounds, plain JSON resume, hidden/appearance timing, clamped positioning, deterministic random-consumption and bounce equations, reduced static behavior, exact rounded catch result/quality/detail, immediate background miss, exact timeout, keyboard/pointer parity, double-finish lock, and disposal.

After explicit screw-lane handoff, browser evidence uses one frozen task and one deterministic movement random stream for full-source LEGACY/MODULE captures at 393×852 and 402×874 DPR 3, normal and reduced, for hidden, appeared, moving/bounce, caught, background miss, and timeout. It also proves real input/focus, 390/430 layout, errors, external requests, overflow, performance, and disposal.
