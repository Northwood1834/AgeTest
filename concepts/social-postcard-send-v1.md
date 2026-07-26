# `social-postcard-send-v1` — Travel Desk Postcards

## Identity

- Social / tier 2 / satisfying; exact duration `20000ms`.
- Original warm travel-desk picture-matching game for a mainstream adult audience.
- Prompt: `絵が同じ住所ボックスへドラッグ`
- Help: `2つ絵のカードは、どちらの絵にも入ります。`

No etiquette, fairness, geography, culture, relationship, or people norm is tested. Every decision is derived only from task-provided picture bubbles and postcard art.

## Finite mechanic

Four physical illustrated postcards sit on a linen desk. Three address boxes visibly provide capacities `2 / 1 / 1` through large outlined card slots. Each box carries one large picture bubble. Three ordinary postcards carry one matching motif each. One visibly split dual-match postcard carries two complete motifs and may be accepted by either corresponding picture box.

The authored card set uses three shape-distinct motifs: a striped sun-disc, an arched bridge, and a three-leaf sprig. Variants change palette and arrangement but not rules. Shape, internal marks, and silhouette preserve matching without color.

The dual card's choice is gently consequential. In the authored set, placing it in the one-slot matching box can leave the remaining single-motif card without a compatible open destination. This is not terminal: a full invalid allocation stays editable, mismatched slots receive a warm picture cue, and any postcard can be moved again. There is no submit button or move limit.

Dropping on an occupied slot exchanges postcards. Dropping back on the desk returns a card to the tray. Releasing outside cancels and restores exact prior state. Auto-success occurs only after a tracked snap when all four occupied slots match their box bubble.

## Exhaustive proof

The four labeled postcards have `4! = 24` full assignments across the four visible labeled slots. Independent enumeration proves:

- exactly `2` valid slot assignments, from exchanging the two matching cards within the two-slot box;
- exactly `22` full invalid assignments;
- the valid cards may be placed in `4! = 24` edit orders, giving `48` valid placement routes;
- every occupied placement is reversible and preserves all four cards;
- every authored start is empty and nonterminal.

The task contains the motif definitions, each card's visible motif list, each box's bubble motif and slot count, tray order, proof, duration, and state. The renderer has no separate answer.

## Input and accessibility

- Touch/pointer: drag a postcard to a box slot or back to the desk.
- Tap: tap a card, then a slot or the desk.
- Keyboard: arrows move focus among cards, slots, and desk; Space/Enter invokes the same pickup/drop functions; Escape cancels.
- Cards, slots, and desk target are at least `44 × 44` CSS pixels at widths `390–430`.
- Initial, held, dragging, partial, dual-choice, full mismatch, focus, success, timeout, and reduced-motion states are distinct.

## Art direction

A honey-oak travel desk holds linen, brass clips, fountain-pen lines, warm paper postcards, three raised address boxes, wax-toned picture bubbles, and late-afternoon window light. Cards use CSS-only illustrated motifs, perforated edges, stamps without brands, paper fibers, shadows, and visible drag grips. The dual card is physically wider and split by a stitched seam, with both motifs equally prominent.

Normal placement uses a tracked paper lift and snap. Reduced motion switches through nonzero tracked stills. Success adds a static second still: box lids settle, four cards become visible through address windows, and a restrained postbox-send light crosses the desk. No RAF, image, SVG, emoji, audio, network, or brand is used.

## Deadline, lifecycle, and resume

A bounded recursive ticker shows whole seconds. `context.setDeadline(20000, ...)` retains exact slot contents, tray order, held card/source, moves, and mismatch analysis. Success and timeout commit once. Abort clears listeners, ticker, snap/send stages, QA ownership, and deadline.

Strict state is `{slots, tray, held, moves}`. Validation requires exact authored motif/card/box rules and proof, one exact four-card inventory across all locations, strict held-source consistency, and nonnegative moves. JSON clone plus fresh render reproduces partial, dual-choice, full-invalid, and held states exactly.
