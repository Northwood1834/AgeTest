# timing-three-v1 — Compatibility Port Concept

Status: compatibility port implemented; exact v1.0 default timing semantics, same-task browser parity, lifecycle, and independent full-resolution review passed.

## Identity

- Stable ID: `timing-three-v1`
- Introduced: `1.0`
- Category: `timing`
- Family / step: `timing-three` / `1`
- Tier / flavor: `2` / `wild`

## Immutable generated task

Generation returns only:

```js
{
  kind: "timing",
  prompt: "体内時計で3秒を測って",
  help: "スタート後、3秒だと思ったらタップ。",
  duration: 9000
}
```

`targetSeconds` and `toleranceMs` must not be added. Current `renderTiming` resolves its defaults internally: seconds `3`, target `3000 ms`, tolerance `650 ms`.

## Immutable timing behavior

- Disabled native button displays `3` at render, `2` at exactly 1000 ms, and `1` at exactly 2000 ms.
- Measurement begins automatically at exactly 3000 ms.
- Begin records real `performance.now()`, enables and focuses the button, gives the orb its static running rim, changes help to `数字は出ません。己を信じて。`, and displays exact CTA `3秒だと思ったら、タップ！`.
- The exact CTA may be fitted to one line at 390–430 CSS px only through typography; no copy substitution.
- No elapsed clock, timer track, progress indicator, rhythm, tolerance cue, or count remains visible after begin.
- Stop uses real elapsed time. `diff = Math.abs(elapsed - 3000)` and success is exactly inclusive `diff <= 650`.
- Result is exactly `{reactionMs: Math.round(elapsed), quality: clamp(1 - diff / (650 * 2.6), 0, 1), detail: `あなたの3秒は ${(elapsed / 1000).toFixed(2)} 秒でした。`}`.
- Begin starts a tracked internal deadline of `3000 + 2200 = 5200 ms`. Timeout is incorrect with exact detail `5秒を超えました。時空から戻ってください。`.
- Persisted `duration: 9000` remains unchanged and is not used as a substitute for that deadline.
- Stop/timeout lock input and finish at most once.

## Accessibility and visuals

- Countdown input is disabled; pointer/touch and native keyboard click share one stop path.
- Begin focuses the button without scrolling and exposes a high-contrast `:focus-visible` ring.
- Countdown/help/result are polite live regions.
- Preserve the published lavender orb above one 11 rem countdown/stop panel. Allowed finish is material-only orb/panel depth, static running rim, and exact separate `○ 正解` / `× 残念` result heading plus unchanged detail below the button.
- No decoration may become a clock or expose progress/success early.

## Lifecycle

- Use `context.host.ownerDocument.createElement`, `context.later`, `context.listen`, and `context.setDeadline` only.
- Normal and reduced modes use no RAF; reduced retains nonzero 1000/2000/3000 ms stages.
- Game-scoped CSS hides the shared timer while mounted; dynamic help uses the current external position when available with an isolated fallback.
- Disposal clears countdown work, deadline, listeners, QA, and finish.
- No raw timers/listeners/RAF, network, audio, storage, or assets.

## Evidence gate

Focused tests pin the exact four-field task, reject added target/tolerance fields, verify defaults 3/3000/650, exact countdown/CTA/help, inclusive 2350/3650 boundaries, early2.00/win3.00/late4.00 results, 5200 ms timeout, touch/keyboard, locks, resume, reduced stages, and disposal.

After screw handoff, parity uses frozen LEGACY/MODULE source frames at 393×852 and 402×874 DPR 3, normal/reduced, for countdown3/2/1, running, early2.00, win3.00, late4.00, and timeout5200, plus real input, 390/430, timer hiding, errors/external/overflow, performance, deadline, and disposal.
