# attention-author-boss-v1 — published compatibility concept

## Ownership and authority

This is a compatibility port of the currently published `app.js` game. The only semantic source is the current working-tree `app.js` factory and `renderAuthorBoss`; no unpublished architecture or historical replacement is consulted.

Stable identity:

- id: `attention-author-boss-v1`
- introducedIn: `1.0`
- tier: `2`
- flavor: `wild`
- family / step: `attention-author-boss` / `1`
- category: `attention`

The generated task remains exactly:

```js
{
  kind: "authorBoss",
  prompt: "変則ムーブの作者を3回つかまえて",
  help: "残像・フェイント・画面外逃走を見切ってタップ。",
  hits: 3,
  duration: 10000
}
```

No mode order, seed, proof, difficulty, or renderer-only property is added to saved data.

## Published mechanic audit

The published renderer creates one moving author target and requires three valid catches. It uses every member of the unique mode set exactly once:

1. `afterimage`: show a ghost first, remove it, then reveal the real target at that position;
2. `dance`: keep the target catchable while it moves through a multi-directional feint;
3. `vanish`: hide the target beyond one edge, then return it suddenly and make it catchable.

The published order is shuffled at render time. Since the exact stored task has no random seed, this module resolves reload safety by applying a deterministic task-derived pseudo-shuffle over all six permutations. The result is a shuffled-looking unique permutation while the same plain task always resumes with the same mode order. It neither retunes nor simplifies the three mechanics.

A catch is valid only while the real target is ready. Each valid catch changes the counter exactly `0 / 3 → 1 / 3 → 2 / 3 → 3 / 3`. Background, residual ghost, early vanish, and missed keyboard reticle activation never increment the counter and never finish.

Exact terminal payloads are retained:

- success: `correct: true`, quality `clamp(1 - elapsed / 10000, 0, 1)`, detail `変則ムーブごと作者を確保しました。`
- deadline: `correct: false`, detail `作者は変則ムーブで締切の向こうへ逃げました。`

Only the kernel commits an answer. One terminal event is retained; repeated target/background/keyboard/deadline input cannot commit again.

## Identity and visual direction

The target remains the recognizable current local author identity from `author.png`: a dominant red rounded blob face; asymmetric heavy-lidded white eyes with a lime iris on viewer-left and dark pupil on viewer-right; skeptical curved smirk; broad glossy black/white helmet with pale earcups and a right-side boom microphone; and a raised icy-cyan/white gloved hand at lower-left. The module does not fetch or decode `author.png` at runtime. It draws a resolution-independent authored vector derivative directly on Canvas, preserving those defining traits while improving clarity at DPR3.

The scene is a finished 3D “author hunt” arena rather than a tap grid:

- deep violet author-studio tunnel with a horizon, perspective floor grid, circular raised tracking platform, rim lights, and spot beams;
- depth-scaled author medallion, contact shadow, metallic target ring, edge portals, and mode-specific trails;
- authored afterimage chromatic echoes, dance path ribbons, vanish edge streaks/return portal, catch shock ring, and terminal overlays;
- persistent `AUTHOR HUNT`, mode identity, `0 / 3` catch counter, and concise live status hierarchy;
- strong distinct gold success capture and plum deadline escape tableaux.

Enhancements are visual and accessibility-only. They do not alter target readiness, catch counts, timings, task shape, terminal detail, or quality.

## Interaction

### Pointer / touch

The real author owns a large moving transparent DOM button synchronized to the Canvas portrait. Pointer-down on that button is a valid catch only while `ready`. Pointer-down elsewhere creates local miss feedback but no catch. Ghost and off-screen/vanish cues are never hit targets.

### Keyboard and accessibility

- The arena is focusable with a visible focus treatment.
- Arrow keys move a visible spatial reticle; Enter or Space catches only when the reticle overlaps the ready author.
- The moving author is also a real focusable button, so Tab followed by Enter/Space is a direct accessible equivalent to touch.
- Mode and counter changes use live text; the Canvas has an authored scene label.
- Busy/terminal input is locked.

## Deterministic motion and lifecycle

Normal motion uses only `context.frame`, and only while the dance target is actively moving. It retains the published 1,450 ms dance animation inside the 1,650 ms dance-step cadence, including the 200 ms settled pose. Afterimage retains 520 ms ghost-to-real timing, vanish retains 430 ms exit-to-return timing, and accepted catches retain the 240 ms inter-mode delay. Afterimage, vanish, catches, and inter-mode transitions use `context.later`. The kernel owns the 10,000 ms deadline.

Reduced motion owns no continuous frame. It preserves nonzero cause-and-effect with tracked discrete stages:

- afterimage: bright ghost → fading ghost → real target;
- dance: three separated feint positions → settled catchable pose;
- vanish: exit cue → empty portal → returned target;
- catch: impact tableau → next mode.

Mode tokens make stale callbacks inert. Disposal aborts the signal, stops the frame, invalidates pending mode callbacks, removes the QA handle, and leaves zero owned jobs in the kernel.

## Frozen parity states

The parity fixture uses one JSON-cloned frozen exact task for LEGACY and MODULE views at 393×852 and 402×874 DPR3 in normal and reduced modes. It exposes these same semantic states:

1. `ready` — `0 / 3`, no catch yet;
2. `afterimage` — ghost visible, real target not ready;
3. `dance` — real moving/feint target ready;
4. `vanish` — target outside/return path, not yet ready;
5. `hit1` — exactly one accepted catch;
6. `hit2` — exactly two accepted catches;
7. `success` — exactly three catches and exact success result;
8. `timeout` — deadline escape and exact incorrect result.

The legacy half is a scoped fixture transcription of the current `app.js` renderer and local `author.png`; it is evidence only, not implementation authority. The module half runs the owned module through `createGameRuntime`. Scene hooks freeze movement only for capture and never participate in production play.

## Acceptance invariants

- exact six-key task generation and strict validation;
- all three unique modes, no repeated or missing mode;
- plain JSON resume preserves deterministic sequence and completes;
- wrong/background/ghost/early-vanish input cannot increment hits;
- hit semantics and exact success quality/detail match publication;
- exact 10,000 ms deadline detail and single commit;
- touch, moving target button, keyboard reticle, Tab/Enter, focus, and input lock;
- DPR capped at 3; no horizontal overflow at 390/393/402/430 widths;
- reduced motion has nonzero tracked stages and zero continuous RAF;
- normal dance owns one tracked RAF and stops it outside dance/terminal/disposal;
- no global DOM creation, raw timer/RAF/listener, network, audio, emoji substitute, or runtime asset request;
- abort/dispose removes QA and leaves no surviving frame, timeout, deadline, or listener.
