# `spatial-shelf-balance-v1` — Window Shelf

## Identity

- Category / tier / flavor: spatial / tier 2 / satisfying.
- Duration: exactly `22000ms`.
- Original one-line shelf-arrangement game; not interior-design advice, a brand display, or a sorting quiz.

## One-line play

`背の高い飾りを後ろへ。左右差0に`

The board has three unmistakable mini shelf bays: left, center, and right. Each bay keeps a large solid `後ろ` drop position and a large solid `前` drop position in controlled depth overlap. Drag one of six warm decorative objects to another shelf position. The two objects exchange places in that single reversible gesture. Keep rearranging until the shelf has exact left/right balance and no rear object is hidden.

## Finite shelf

The shelf has six snapped positions: rear-left, rear-center, rear-right, front-left, front-center, and front-right. Every position is occupied and every object remains visible in the inventory; there is no discard, draw, spawn, hidden object, or irreversible move.

The shape-distinct objects are:

- tall asymmetric vase: weight `3`, height class `3`;
- tall open lantern: weight `3`, height class `3`;
- round orb: weight `2`, height class `2`;
- low bowl: weight `2`, height class `1`;
- rectangular frame: weight `1`, height class `2`;
- stepped stack: weight `1`, height class `1`.

Weights and height classes are rules data, not extra on-screen counters. Object silhouettes, material edges, and labels make identities independent of color.

## Exact rules

Columns have integer moments `-1`, `0`, and `+1`. The visible balance difference is:

`abs(sum(object.weight × position.column))`

A rear object is hidden iff the object in the front position of the same column has height class `3`. The tall, opaque front silhouette physically covers a meaningful lower portion of the same-column rear silhouette while its top and sides remain identifiable. There is no translucent ghost, hatch overlay, or per-object warning badge. No other pair occludes.

A broad physical beam under the three bays rotates gently toward the heavier side. It is exactly horizontal and turns green at difference zero, so balance is readable without relying on the numeric meter.

Success is automatic only after a snapped exchange settles and both quantities are exact:

- `左右差 0`
- `かくれ 0`

There is no submit button. A visually balanced but occluded shelf and an unobscured but unbalanced shelf remain reversible, nonterminal states. Pointer release outside the shelf cancels and returns the object to its exact position.

The only visible quantities are `左右差`, `かくれ`, and integer seconds remaining. Moves, object weights, score, progress percentages, and solution counts are not displayed.

## Exhaustive proof

Validation independently enumerates all `6! = 720` labeled arrangements over the six slots.

- exactly `32` arrangements satisfy balance difference zero and hidden count zero;
- `128` arrangements are balanced but still hide at least one rear object;
- `112` arrangements are unobscured but still unbalanced;
- the authored large-first arrangement puts both tall objects in front, hides two rear objects, and has nonzero difference;
- all swaps are involutions, so every nonterminal placement is reversible;
- all three authored starts are non-success states and use the same six objects/rules.

There are multiple valid layouts, not one target order. Authored start choice changes only the current arrangement; object style, slot style, and success rules never mark a destination or ordering cue.

## Input and accessibility

- Primary input: one pointer/touch drag from an object to a shelf position; an occupied target exchanges objects.
- Tap alternative: select an object, then tap a position.
- Keyboard: focus an object and use arrows to exchange with the adjacent rear/front/left/right position. Enter/Space selects; focused slot buttons place the selected object.
- Object and slot targets are at least `44 × 44` CSS pixels from `390–430` widths.
- Initial, selected, dragging, legal target, hidden rear, balanced-but-hidden, unobscured-unbalanced, focus, success, and timeout states are visibly distinct.
- Focus uses a high-contrast outline independent of color and selection.

## Art direction

A wholly original warm wood shelf sits in front of a cream window with late-afternoon rays. CSS-only stitched grain, shelf joints, rear-depth shadow, ceramic vase, open-frame lantern, round orb, low bowl, picture frame, and stepped stack create material and silhouette variety. No image, SVG, emoji, logo, copied furniture/product silhouette, audio, or external resource is used.

Each left/center/right bay frames a controlled two-depth stack. Rear objects are slightly smaller and higher; tall opaque front art overlaps the lower middle of the rear object while preserving its identifiable crown and side edges. All six solid rounded drop zones persist around the art and carry enlarged `後ろ` / `前` badges. Small object-name pills are omitted; each object instead has one enlarged `動かす` affordance and a CSS grip. A broad wood balance beam below the bays gives a second, physical rule cue. Successful balance warms the window, settles the shelf shadow, and adds a restrained static ray/seam glow.

## Motion, deadline, and lifecycle

Normal placement uses a short CSS lift/snap and a nonzero tracked settle stage. Reduced motion removes interpolation but still performs a nonzero tracked snap through `context.later`, followed by a static finish. There is no animation-frame loop.

The exact deadline uses `context.setDeadline(22000, ...)`. The visible second count is maintained by bounded recursive `context.later` ticks. Timeout retains the exact six-object permutation, balance difference, hidden identities/count, and move count in the result. All listeners, ticks, snap stages, QA ownership, and deadline are cancelled on abort; a disposed game cannot finish.

## Plain-data resume

Generated task data contains the authored object/slot rules, authored start, finite proof summary, and state `{positions, moves}`. Validation requires an exact six-ID permutation and nonnegative integer moves. JSON cloning and a fresh render reproduce the same positions, torque, hidden identities, and remaining interaction rules. No DOM state or random answer exists outside task data.
