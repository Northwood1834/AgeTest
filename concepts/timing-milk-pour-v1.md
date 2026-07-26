# timing-milk-pour-v1 — 余韻のあるミルク注ぎ

## Identity

- ID: `timing-milk-pour-v1`
- category / tier / flavor: `timing` / `1` / `satisfying`
- introduced in: `2.0`
- family: `timing-milk-pour`
- task kind: `milkPour`
- duration: `15000ms`
- prompt: `ふちの泡になる直前で、手を離して`
- help: `押している間だけ注ぎます。離してからも、少しだけ流れます。`

## One-sentence play

Hold the single large pour control to raise milk in an original warm cup, then release just before the foam rim because one small, visibly staged after-flow continues; after the first overflow only, wipe once and retry.

This is a forgiving tier-one timing action. There is no secondary gauge puzzle, temperature rule, recipe, score counter, audio cue, brand, real package, or hidden random wobble. The only twist is authored after-flow.

## Integer model and proof

Each task uses exact integer values:

- `quantumMs`: `100`;
- `flowPerStep`: 3 or 4 units while held;
- `afterFlow`: 8 or 9 units after release;
- `targetBand`: one inclusive 17–19-unit interval;
- `rim`: `100`;
- `duration`: `15000`.

The target band is always strictly wider than after-flow. A held step adds exactly `flowPerStep`; release freezes held flow and schedules three finite after-flow portions whose integer sum is exactly `afterFlow`. Final classification uses only the final integer level:

- inside the target band: `good-foam`;
- below it: `underfill`;
- above it: `overflow`.

Proof enumerates all release steps from 0 through the deadline bound, stores the first and last successful release step, confirms at least five successful integer release steps (at least 500ms), proves both endpoints land in-band after after-flow, proves the preceding step underfills and the following step overfills when those neighbors exist, and verifies `bandWidth > afterFlow`.

## Hold, release, and after-flow

Pointer-down or keyboard Space starts the same hold transition. Pointer-up, pointer-cancel, Space key-up, or blur releases through the same transition. The control locks during after-flow. Three visible stages continue the stream and raise the cup by exact integer portions; no result is known before the third portion lands. Status uses simple phrases rather than dense numbers. The cup has a broad cream target band and a distinct foam rim, so the release window is visible without a precision counter.

Normal motion owns one tracked frame only while physically held, quantizing elapsed time into integer 100ms steps. Reduced motion owns no frame: a tracked `context.later` step adds one integer flow amount every 100ms. Both modes use nonzero tracked after-flow stages and produce identical level geometry. Reduced mode shows stepped liquid, a finite pitcher pose change, and static steam.

## Overflow recovery

The first final level above the target band spills visibly into the saucer but does not finish. It records the exact attempt, locks pouring, and exposes one native `ふき取って、もう一度` control. Wiping is a finite tracked stage, increments `wipes` to one, resets level to zero, and starts the sole retry while retaining the first attempt in the small two-slot attempt strip.

A second overflow is terminal. There is no second wipe and no way to reset underfill or a successful cup. Timeout during the recoverable spill retains the spill, level, attempt record, and unused/used wipe state exactly.

## State and outcomes

A stable JSON state contains exact `level`, `wipes`, `attempts`, and `phase`. Transient hold timestamps, frame handles, after-flow stage tokens, and pointer capture are never serialized. A validated stable state can render through a fresh module and finish once.

Every terminal payload retains outcome, level, target band, after-flow, wipes, attempts, phase, and a cloneable stable state.

- `good-foam`: final foam is inside the authored band; correct.
- `underfill`: final foam remains below the band; incorrect.
- `overflow-recoverable`: nonterminal first spill with one wipe visible.
- `overflow`: second spill after the one retry; incorrect.
- `timeout`: current cup, spill, level, attempt history, and wipe state remain unchanged; incorrect.

## Presentation and accessibility

The original visual is a copper-and-cream counter with a broad ivory cup, small ceramic pitcher, soft milk stream, warm foam cap, saucer, and abstract curl-shaped steam. It has no real café brand, logo, packaging, currency, copied latte art, emoji, or photographic asset. The cup, pitcher, stream, foam, rim band, spill, and attempt marks are canvas-drawn; all instructions and controls are live UI.

The pour control is one full-width native button at least 52px high. It receives initial focus, has a visible 4px ring, and supports Space hold/release without keyboard repeat. The wipe control is also at least 52px and appears only for the recoverable spill. Touch uses pointer capture where available. Controls remain fully visible at 390, 393, 402, and 430 CSS px.

## Ownership and disposal

All DOM nodes come from `context.host.ownerDocument`. All listeners, frame work, integer ticks, after-flow stages, wipe stage, deadline, feedback, and QA ownership use context APIs. Abort invalidates stage tokens, clears holding, removes QA, and prevents late finish. There is no raw timer, raw animation frame, global document creation, network, storage, image request, audio, vibration, or external font.

## Required QA

Focused Node tests cover metadata; 10,000 bounded cloneable generations; independent integer proof endpoints and target-width invariant; hostile helper fallback; exact hold/release/after-flow sums; good foam, underfill, first overflow/wipe/retry, second overflow, and exact 15000ms timeout retention; pointer and keyboard hold paths; immediate locks and single finish; stable fresh-module resume; normal one-frame versus reduced stepped flow; nonzero reduced after-flow; DPR3; 44px targets; ownerDocument; fake/real disposal; bounded paint; and source bans.

Browser acceptance on Audit9332/8862 captures all variants at full-resolution DPR3 393×852 and 402×874 normal/reduced for initial, holding, released, each after-flow stage, good foam, underfill, recoverable spill, wiped retry, second overflow, timeout, and focus, plus 390/430 boundaries. It exercises real touch and keyboard success, actual overflow/wipe/retry, deadline, disposal, performance, target geometry, no external errors, and final visual QC before lane release.
