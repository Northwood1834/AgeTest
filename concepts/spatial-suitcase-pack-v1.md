# `spatial-suitcase-pack-v1` — Case Mosaic

## Identity

- Category / tier / flavor: spatial / tier 3 / satisfying.
- This is an original, brand-free packing puzzle. It is not travel, baggage, product, weight, or fragile-item advice.
- The whole interaction is one finite `5 × 4` suitcase mosaic. Five visible required pieces must be rotated, placed, protected, and physically closed.

## Player-facing objective

The open fictional case shows twenty square positions. Two visible wheel-well positions are unavailable, leaving eighteen usable positions. Five labeled pieces contain exactly eighteen polyomino cells in total:

1. a five-cell soft coat (`やわらかい`, compressible once);
2. a four-cell hard boot pair;
3. a four-cell fragile glass case;
4. a three-cell hard notebook;
5. a two-cell hard pouch.

Every item card is marked `必須` and contains a cell-for-cell miniature of its current polyomino orientation plus an exact `H1`, `H2`, or `H3` height badge. Rotation immediately rotates that miniature; compression changes the coat miniature to dashed, inset cells and `H2`. There are no hidden, optional, or decorative inventory pieces. The item-card order is shuffled independently of geometry and is never a solution cue.

The player selects or drags a piece, rotates it in quarter turns, and snaps its anchor to the case grid. Pieces may be lifted and repositioned. Overlap is retained as a visible stack rather than silently rejected. The soft coat may be compressed exactly once, lowering its height from `3` to `2`; the action is irreversible for the question and remains in saved state. All other pieces have height `1`.

A persistent readout shows `最高 N / 2`. Every occupied cell also displays its exact stack height. The fragile glass case has redundant `われもの` text, a distinct diamond material, and a crack hatch whenever a hard piece is above it. No interpretation relies on color alone.

The player must press the explicit `ケースを閉じる` control. Placement alone never commits.

## Exact finite rules

- Grid size: `5 × 4` (twenty cells, never larger than `8 × 10`).
- Two authored wheel wells are blocked and visibly hatched.
- The five immutable polyominoes cover eighteen cells, exactly matching usable area.
- Rotations are the distinct normalized quarter-turn orientations of each shape; symmetric duplicates are removed.
- A placement is finite integer `{x, y, orientation, order}` data. Every cell must be in bounds and outside a wheel well.
- Placement order is exact stack order. Moving a piece makes it the newest top piece.
- A fragile piece is crushed iff any overlapping hard piece has greater placement order.
- Exact column height is the sum of placed-piece heights in that cell. The lid limit is `2`.
- A valid close requires every essential placed, coat compressed, no overlaps or gaps, no crushed fragile piece, and maximum height at most `2`.

Close classification precedence is exact:

1. any unplaced essential → `missing-essential`;
2. a hard piece above the fragile piece → `crushed-fragile`;
3. maximum height above `2` → `raised-lid`;
4. all items present but overlap/gaps remain → `bad-pack`;
5. otherwise → `success`.

Timeout is `timeout` and retains the exact placements, rotations, placement order, compression, height map, fragile state, and open lid. A terminal result is owned exactly once.

## Authored exhaustive proof

There are three authored wheel-well arrangements over the same five shapes. Validation recomputes every in-bounds, wheel-clear orientation and exhaustively exact-covers the eighteen usable cells. The layouts have exactly `1`, `2`, and `3` valid tilings respectively. Every valid tiling uses at least one non-zero quarter turn. The item-card shuffle does not alter these counts.

For every tiling:

- compressed coat height is exactly the lid limit (`2`);
- the same tiling with the uncompressed coat is exactly one over (`3`);
- therefore every success requires compression;
- every success includes all five visible essentials;
- no valid tiling overlaps, so the fragile piece is protected;
- moving any one cell into an occupied usable cell creates a visible overlap and a corresponding gap.

The proof is bounded by the authored `5 × 4` grid, distinct orientations, finite anchors, five labeled pieces, and exact-cover pruning. Generation chooses one authored wheel-well arrangement and only shuffles the five visible cards. There is no retry loop or hidden random geometry.

## Interaction and accessibility

- Primary touch: drag any tray or placed piece; a snapped ghost follows the case grid; release places it.
- Direct controls: tap an item, then tap a grid anchor. Tap a placed cell to select that piece.
- Keyboard: item and action controls are native buttons. The case is a five-by-four button grid; arrows move a visible anchor and Enter/Space places the selected piece. Rotation, compression, removal, and close all have native zero-detail keyboard activation.
- Every interactive target is at least `44 × 44` CSS pixels at `390–430` CSS-pixel widths. Focus uses a high-contrast outline independent of selection color.
- The initial state is neutral: no item, grid cell, or solution anchor is selected or focused. Selected, dragging, blocked, compressed, fragile, stacked, crushed, disabled, closing, raised, closed, failure, and timeout states are visibly distinct.

## Art direction

The case is a wholly fictional stitched plum-and-sand shell with metal-free wheel-well hatching, a fabric grid, a hinged lid, seam highlights, depth shadows, and a physical gap when over height. Item pieces use authored CSS materials: quilted soft coat, ribbed boots, translucent diamond glass case, paper-edged notebook, and woven pouch. No logos, real luggage silhouette, copied product details, photographs, SVG, canvas bitmap, emoji, or external assets are used.

Successful closing settles the lid flush and reveals a restrained seam glow. Raised-lid failure preserves an exact visible gap and `3 / 2` badge. Missing inventory keeps the tray item illuminated. Crushed fragile shows retained crack hatching. Bad packing keeps both overlap and uncovered grid visible.

## Motion and lifecycle

Normal motion uses CSS transforms for pick-up, snapped placement, and the two-step lid close. Reduced motion removes interpolation but still schedules nonzero tracked snap and close stages through `context.later`; it never substitutes an unexplained final frame. There is no continuous frame loop.

The exact deadline is `60000ms` via `context.setDeadline`. All delayed lid/snap work uses `context.later`; all input uses `context.listen`; abort removes QA ownership and makes all operations inert. No raw timer, frame, global DOM creation, network, audio, or external resource path is allowed.

## Plain-data resume

Saved state contains exactly the five labeled item records (`orientation`, `compressed`, nullable placement with exact `x/y/order`) and `nextOrder`. Validation requires the authored item set, exact shuffled inventory permutation, legal orientations, legal wheel-clear placements, unique positive orders, exact compression eligibility, and `nextOrder` greater than every retained order. JSON cloning and a fresh module render reproduce the same geometry, stacks, heights, fragile status, selection-neutral open lid, and subsequent close result.
