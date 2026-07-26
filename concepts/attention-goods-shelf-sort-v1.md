# attention-goods-shelf-sort-v1 — 奥棚の三つぞろい

## Identity

- Metadata: `2.0 / attention / tier 3 / satisfying / step 1`
- Family: `attention-goods-shelf-sort`
- Original setting: an old neighborhood corner shop's deep, walnut-stained display cabinet and brass staging rail.
- This is not a clone of a branded goods-sorting game. It uses no borrowed name, UI, art, packaging, level, sound, or layout.

## Player promise

A small shop cabinet looks orderly at first, but each of its six bays is three products deep. Only the front product can be lifted. The player drags that product into a seven-place brass inspection rail. Whenever three identical products reach the rail, those three are wrapped and cleared, exposing room for the next choices. Choosing the visible fronts in the wrong order can congest the rail before a triple is formed.

The attention test is the gap between a simple advertising promise—"put three alike together"—and the actual work of tracking shelf depth, reveal order, a limited temporary rail, and reversible staging.

## Authored products and material language

Every task contains exactly three physical instances of each of six fictional local-shop products:

1. **月灯り紅茶** — round cream-and-carmine embossed tin, dark lid and a readable `紅茶` band.
2. **朝摘み苺** — faceted glass jam jar, red contents, gingham cap and `苺` label.
3. **白樺石けん** — low wrapped soap carton, ivory paper, mint belly-band and `石けん` label.
4. **深煎り珈琲** — kraft gusset pouch, folded top, dark roast seal and `珈琲` label.
5. **丘の蜂蜜** — amber glass squeeze bottle, cream cap and `蜂蜜` label.
6. **潮風のり** — slim indigo paperboard box, silver edge and `のり` label.

Silhouette, material, color, short label, highlights, seams, and shadows all distinguish a product. Color alone is never the identity. Occluded products remain partly visible as smaller, darker packages behind the front product, making depth and future reveal order readable at DPR 3.

## Rules

- Six cabinet bays each begin with exactly three ordered products, front first.
- Only depth `0`, the visible front product, may move to the staging rail.
- The rail has exactly seven places.
- A moved item keeps its stable instance ID and source bay.
- The third rail item of one product type starts a visible triple-clear stage; exactly those three IDs leave the rail.
- A rail item may be dragged or keyboard-returned to the front of its own source bay while that bay is below depth three. This is a real undo/repack, not a reset.
- Returning does not itself clear a triple.
- Reaching seven occupied rail places without a triple first shows a full-rail impact, then ends in a distinct jam failure.
- Success requires every shelf stack and the rail to be empty after six exact triple clears.
- A back product request, an illegal return, and input while motion is locked are non-terminal and consume no item.
- Timeout preserves the actual shelves and rail in the retained frame.

## Finite authored generation and proof

Generation selects one of six authored 6 × 3 depth layouts directly. It has no search loop. Each product type appears exactly three times.

For every authored layout, task data stores and validation independently replays:

- an 18-take bounded success route;
- a seven-take bad-order route whose rail has seven items and no count of three, proving jam reachability;
- a six-take near-full route whose rail has six items and no triple;
- the exact stable rail item returned to its source bay from that near-full state; and
- a bounded recovery route that empties the modified shelves and rail after that return.

The pure simulator enforces front-only access, capacity seven, stable IDs, source-bound returns, and exact all-three removal. Validation reconstructs all instance IDs from authored stacks, checks the 3 × 6 inventory, replays every proof from plain JSON, and rejects any forged route, count, order, capacity, copy, or product semantic. State space is finite because there are 18 stable instances, six bounded ordered stacks, and a seven-place rail.

## Interaction

### Touch / pointer

- Drag a visible front package down to the brass rail to stage it.
- Drag a rail package back onto its highlighted source bay to repack it.
- A drag begun on a partly hidden back product produces a blocked/back explanation and a red depth marker.
- Dropping anywhere else returns the package visually without changing state.

### Keyboard

- Canvas receives initial focus with a visible plum-and-cream focus treatment.
- `←` / `→` moves among cabinet bays.
- `Enter` or `Space` stages the selected visible front product.
- `R` switches focus between shelf and rail.
- In rail mode, `←` / `→` chooses a staged item and `Enter` or `Space` returns it to its source bay.
- Accessible shelf and rail buttons mirror the same actions and maintain `aria-pressed`, labels, disabled state, and focus.

## Causal motion

Normal motion uses one context-owned frame only while an item or triple is moving. A package lifts from its exact bay, crosses to the next rail socket, settles, and—if it is the third match—the three matching packages tighten toward the center before a paper-wrap flash clears them. Return motion visibly travels from rail to the source bay. Full rail has a brass shake/pressure stage before jam.

Reduced motion owns no continuous animation frame. The same causes remain legible through deterministic non-zero tracked stages: lift/arrival, triple gather/clear, return midpoint/settle, and full/impact.

Input is locked during each causal stage. Every delayed operation uses `context.later`; every normal frame uses `context.frame`; every listener uses `context.listen`.

## Required retained visual states

1. Initial cabinet with all six front products and darker depth layers.
2. Dragging a visible front product toward the rail.
3. Partial rail with newly exposed back products.
4. Blocked attempt on a back product.
5. Near-full six-item rail, still recoverable.
6. Legal rail return/repack in progress and settled.
7. Third-match gather stage.
8. Triple-clear settled with three freed sockets.
9. Full seven-place rail impact.
10. Jam terminal.
11. Success terminal with empty shelf, wrapped triples, and clean rail.
12. Timeout retaining real remaining products and rail.

All states must remain legible at 390–430 CSS px and DPR 3 without overflow, seams, clipped labels, flat generic tiles, emoji, or external assets.

## Terminal hierarchy

- **Success:** cabinet back panels are fully visible, six tied paper parcels sit below the rail, warm shop light rises, and the result names six cleared triples.
- **Jam:** the rail becomes crowded edge-to-edge, brass end stops press inward, and a burgundy `レールが詰まりました` panel explains that no triple formed.
- **Timeout:** a cool closing-hour veil preserves exact shelf and rail contents and reports remaining physical products.

The kernel still owns generic score/feedback. The module commits exactly once and retained painting survives disposal.
