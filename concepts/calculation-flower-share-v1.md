# `calculation-flower-share-v1` — Three Vases

## Identity

- Calculation / tier 2 / satisfying; exact duration `20000ms`.
- Original warm flower-table drag game for a mainstream adult audience.
- Prompt: `花を花びんへドラッグ`
- Help: `花の下の丸と、花びんの丸を見て入れます。`

No equation, rule table, score, or arithmetic wording appears. Capacity is communicated physically by four large dots on each vase.

## Finite mechanic

Three silhouette-distinct vases each have four visible capacity dots. Six ordinary one-bloom stems light one dot each. Three visibly larger double-bloom stems have two flower heads joined to one stem and light two adjacent dots. The authored inventory therefore fills all twelve dots exactly.

Drag a physical flower from the table into any vase. Flowers already in a vase remain draggable. A release on the table returns a flower to the tray. Releasing outside cancels and restores the exact prior arrangement. A drop that would exceed the visible dots receives a gentle tracked return; no flower is lost and no move is consumed. There is no submit button or move limit.

Success is automatic only after a tracked snap when every vase has all four dots lit exactly.

## Multiple allocations and exhaustive proof

The nine labeled flowers have `3^9 = 19683` possible vase assignments. Independent enumeration proves:

- exactly `810` labeled allocations fill all three vases exactly;
- exactly seven ordered single/double distribution patterns are valid: permutations of `(0,1,2)` double blooms plus `(1,1,1)`;
- all `9! = 362880` placement orders are possible;
- every partial placement remains editable and inventory-preserving;
- all authored starts are empty, nonterminal arrangements.

The task provides each flower's visible kind and capacity, the three vase identities, authored tray order, and exact proof. The renderer has no separate answer.

## Input and accessibility

- Pointer/touch: drag one flower to a vase or back to the table.
- Tap: tap a flower, then tap a vase or the table.
- Keyboard: arrows cycle among flowers, vases, and table; Space/Enter invokes the same pickup/drop functions; Escape cancels.
- All flowers, vases, and table drop target are at least `44 × 44` CSS pixels at widths `390–430`.
- Focus, held, dragging, legal target, partial load, over-capacity return, success, timeout, and reduced-motion states are visibly distinct.

## Art direction

A wholly original late-afternoon flower table uses warm plaster, linen, honey oak, glass highlights, ceramic glaze, leaf shadows, and three vase silhouettes: tall bottle, handled urn, and low bowl. Ordinary stems have one large blossom and one plain dot stamped on the physical flower tile; the double-bloom type has two offset blossom heads and two adjacent stamped dots. The distinction survives grayscale without numerals or an equation. Tray flowers also have a small stitched grip seam and lifted paper shadow. Capacity dots are large inset glass beads directly beneath each bouquet.

Normal placement uses a short tracked lift/snap between stills. Over-capacity uses a gentle tracked return. Reduced motion switches between stills but retains a nonzero tracked settle. No RAF, image, SVG, emoji, audio, brand, or network resource is used.

## Deadline, lifecycle, and resume

A bounded recursive ticker shows remaining whole seconds. `context.setDeadline(20000, ...)` retains exact vase flower order, tray order, held flower/source, moves, loads, and lit dots in the timeout result. Success/timeout commit once. Abort clears every listener, ticker, snap/return stage, QA owner, and deadline.

State is strict plain data `{vases, tray, held, moves}`. Validation requires exact authored flower/vase rules and proof, one exact nine-flower inventory across all locations, strict held-source consistency, each current vase load at most four, and a nonnegative move count. JSON cloning and fresh render reproduce partial and held arrangements exactly.
