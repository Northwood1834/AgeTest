# prediction-cookie-cut-v1 — concept

## Audience and tone

- Mainstream women in their 30s–40s; prediction tier 2; warm, satisfying, and understandable within three seconds.
- Original baking-table fiction only: flour-dusted wood, one rolled dough sheet, three large metal cutter silhouettes, a linen mat, and baked-cookie reveal. No brand, emoji, audio, network, flashing, or loss framing.
- Primary gesture is drag. Before the answer is committed, every cutter can be moved and moved back. One explicit `型を持ち上げる` button is the only commit.

## Exact play

The goal visibly asks for **3 cookies**. Arrange three shape-distinct whole cutters—round, flower, and house—on one dough sheet. A cutter produces one cookie only when its complete outline is inside the rounded dough and it overlaps neither other cutter. Overlapping and overhanging cutters lift cleanly but leave no cookie.

Before commit, geometry is honest but neutral: actual metal outlines, intersections, dough edge, and overhang are visible, while no red/green color, checkmark, count prediction, or correctness copy leaks the answer. Multiple quantized layouts make all three cookies. Each authored opening includes a tempting edge-first near miss or an obvious reversible overlap.

Tap `型を持ち上げる` once to lock placement. The commit is terminal. Two tracked reveal stills lift all three cutters and show only the cookies that geometry permits. Success retains three cookies; overlap/edge outcomes retain the exact cookie count and clean cutters; timeout retains the uncommitted placement with no reveal.

## Geometry and finite proof

- Dough geometry is a rounded rectangle in a fixed physical coordinate system.
- Fifteen task-stored quantized centers and four task-stored quarter-turn rotations form 60 states per cutter and 216,000 finite three-cutter layouts.
- Full containment tests every transformed polygon vertex against the rounded dough.
- Arbitrary-polygon overlap tests every segment pair plus containment, so touching/intersecting outlines are not accepted.
- The module precomputes exhaustive counts and exact witnesses for:
  - a three-cookie success;
  - all-inside overlap failure;
  - non-overlapping edge/overhang failure;
  - mixed geometry;
  - retained timeout.
- The task stores this proof, exact goal, geometry, initial placement, reveal timing, and strict versioned resume.

## Timing, input, and accessibility

- Exact kernel-owned deadline: 20,000 ms.
- Normal reveal: two tracked 180 ms stills.
- Reduced reveal: two tracked 300 ms stills; no RAF.
- Pointer/touch drags use the same quantized placement function as QA and keyboard movement.
- Keyboard: arrows move focus; Space picks up/drops a cutter; while picked, arrows move it among quantized columns/rows; commit focus invokes the same commit function.
- Cutter and commit targets are at least 70 CSS px and 52 CSS px respectively.

## QA states

Opening near miss, active drag, overlap arrangement, edge arrangement, valid neutral arrangement, first lift still, second lift still, three-cookie success, overlap result, edge result, and retained timeout at 393×852 and 402×874 DPR3 in normal/reduced modes; real 390/430 drag, keyboard/focus/commit, exact deadline, disposal, resume, and performance.
