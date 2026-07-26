# inhibition-quiet-tidy-v1 — しずかな夜のお片づけ

## Product promise

眠っている穏やかな猫のそばで、5つの生活用品をそれぞれの定位置へ運ぶ40–60秒の抑制ゲーム。速さだけでは成功できない。床材と品物の重さを読み、猫の耳が立った有限区間では品物を持ったままポインター速度を完全にゼロへ落とす。

- Stable ID: `inhibition-quiet-tidy-v1`
- Metadata: introducedIn `2.0`, category `inhibition`, tier `3`, flavor `quirky`, step `1`, family `inhibition-quiet-tidy`
- Duration: 60 seconds
- Inputs: direct touch/pointer drag; canvas keyboard path and large controls
- No audio, emoji, external assets, network, storage, animal distress, injury, breakage, or punitive copy

## Finite mechanic

The room is an authored 10-row × 14-column integer floor. Every tile is plain task data with one material:

- `rug` — quiet multiplier 1;
- `wood` — multiplier 2;
- `cable` — multiplier 4 and a visible route hazard.

Five authored objects (`book`, `sock`, `toy`, `cushion`, and `wooden-cup`) each have an integer start cell, an exact destination cell, weight, color, and a canonical quiet route. A drag sample is one integer tick. Pointer position is clamped to the finite floor and quantized to its nearest cell. Its speed is Manhattan distance from the previous sampled cell. Noise added on that tick is exactly:

`max(0, speed × destination-tile multiplier × object weight − 1)`.

The visible integer noise meter begins at 0. Each complete 8 noise points removes one of five sleep-depth stages; 40 cumulative points wakes the cat and ends in `cumulative-wake`. The cat is shown calmly awake, never frightened, hurt, blamed, or punished.

A release on the held object's own destination places it. Releasing any object on another object's destination is `wrong-placement`. Releasing the wooden cup elsewhere is the distinct harmless `cup-drop`: the cup lies on its side, intact. Other off-target releases are `wrong-placement`. Every terminal payload keeps exact object cells, current held object (including timeout/wake/violation while held), sleep depth, integer noise, stop violations, true stops, and drag tick.

## Ear stop signal

The normal task has three exact inclusive active-drag windows: ticks `8–10`, `22–25`, and `38–40`. The drag clock advances only while an object is held, so waiting between objects cannot skip a signal. The upcoming twitch is visibly armed one tick before its first measured tick.

For a true stop:

1. the same object remains held for the complete window;
2. sampled pointer speed is exactly zero on every tick in the window; and
3. no release occurs in the window.

The object remains visibly suspended. Any nonzero speed, object swap, or release marks that window once. The first violated window is retained and play continues; the second ends in `stop-violation`. A correctly tidied success additionally requires at least one completed true stop, so uninterrupted dragging is not accepted.

Reduced motion owns no RAF. It uses kernel-tracked static tick stages and doubles each signal's number of integer stop samples while keeping the same start ticks. Cat, ear, noise, sleep, drag, placement, and terminal poses remain discrete and inspectable.

## Deterministic proof

Generated task data is structured-cloneable and contains the full floor, all five objects, destinations, three stop windows, canonical routes, thresholds, and proof summary. Generation chooses only a horizontal mirror and re-derives the proof.

The module derives each of the two authored mirror proofs once with bounded exhaustive dynamic programming over every `wait`/`advance-one-route-cell` schedule through the canonical route within the finite tick bound. Generation clones the selected plain-data result; validation reconstructs that authored variant and compares every proof field. It verifies:

- exactly 140 finite floor cells and five distinct objects/destinations;
- every route begins/ends exactly and moves one Manhattan cell per advance;
- rug use changes noise causally and the canonical route finishes with sleep remaining;
- at least one success schedule exists and every accepted schedule has a true finite stop;
- the all-advance uninterrupted schedule reaches two window violations before completion and cannot succeed;
- all proof counts and outcomes are re-derived rather than trusted;
- all six terminal outcomes are reachable in the integer model.

The task has no closures, DOM nodes, typed runtime handles, or hidden answer state. A JSON round trip therefore renders and completes identically. `context.finish` is reached once through the terminal gate; disposal aborts the gate, removes QA, stops the one normal frame or reduced tracked stage, and leaves zero owned work.

## Visual direction

A warm original overhead room, not a generic grid:

- beveled honey-colored boards, a stitched teal rug network, and a raised braided cable;
- a moonlit wall shelf and five shaped, labeled destination silhouettes;
- authored book, striped sock, cloth toy, tufted cushion, and intact wooden cup illustrations with cast shadows and held poses;
- a gentle curled cat with five sleep-depth poses, breathing marks, eyelids, and a clearly enlarged ear-twitch signal;
- separate integer noise, five-pip sleep, stop-window, and placed-count instruments;
- destination glow, retained dragged-object shadow, rug compression, wood ripple, and cable vibration as visible causal feedback;
- quiet tidy success with all five actual objects visible in place, warm lamp bloom, and sleeping cat;
- failures localize the cause and preserve the room rather than covering it with punishment language.

## Required evidence after lane handoff

Final DPR3 captures at 393×852 and 402×874 for: initial, active drag, armed ear, true held stop, rug/wood noise comparison, progress, tidy sleeping success, cumulative wake, repeated stop violation, harmless cup drop, wrong placement, timeout, and reduced extended stop. Also verify 390×844 and 430×932, direct touch, keyboard/focus, exact window boundaries, JSON resume, single finish, disposal, no overflow/errors/external requests, and normal frame performance. No legacy comparison is invented because this is an original game.
