# attention-lint-shaver-v1 — tactile lint-restoration contract

## Identity

- Stable ID: `attention-lint-shaver-v1`
- Category / tier / flavor: `attention` / `3` / `satisfying`
- Introduced in: `2.0`
- Duration: `30000ms`
- Prompt: `編み目を傷めず、毛玉だけを整える`
- Help: `ゆっくり二度なぞります。飾りを避け、満杯になる前にカップを一度だけ空にします。`

## Product promise

A tactile knit panel fills the portrait play surface. The player drags a separated-head lint shaver over real quantized knit coordinates, watching raised pills collapse to fuzz and then settle into clean stitches. The tool is not a cursor that reveals a prerecorded mask: every sampled segment, its elapsed time, and its dwell per crossed cell irreversibly alter the retained cell geometry. The transparent dust cup fills from actual removed material and must be emptied exactly once before the remaining cleaning would overflow it.

The run is silent. Pills, fuzz, clean knit, thinning, holes, the shaver head, cup level, protected beads, embroidery, care tag, loose thread, progress, warning threshold, controls, and terminal evidence are all visible. No result depends on hidden-object recognition, a multiple-choice answer, storage, network data, or audio.

## Finite authored surface

Each authored layout is a `12 × 14` surface, below the `12 × 16` limit. Every coordinate has a retained integer processing level:

- `0` — raised pill;
- `1` — loosened fuzz;
- `2` — clean intact knit;
- `3` — visibly thinned knit;
- `4` — a local hole with retained frayed edges.

Exactly twelve authored coordinates begin at level `0`; all ordinary background coordinates begin at level `2`. Protected coordinates remain ordinary knit under their attached part, but any shaver contact records the protected part type and exact `{x,y}` snag coordinate before finishing a decoration-damage result.

The three layouts use distinct safe geometries: two horizontal passes, two vertical passes, and two separated diagonal passes. Every layout includes protected bead, embroidery, tag, and loose-thread coordinates adjacent to plausible but unsafe shortcuts. Its proof contains the complete safe strokes, threshold examples, and concrete plans reaching every required terminal.

## Deterministic sampled-path integration

Pointer coordinates map to the finite cell lattice. Each segment uses an integer Bresenham traversal; no crossed cell can be skipped by a long pointer jump. Event time is quantized to `50ms` ticks. For a segment crossing `N` new cells, integer `ticksPerCell = floor(deltaTicks / N)` determines irreversible exposure:

- `0–1` ticks/cell: `0` processing units — a too-fast pass visibly leaves the current state;
- `2–3`: `1` unit;
- `4–5`: `2` units;
- `6–7`: `3` units;
- `8+`: `4` units.

A stationary sample treats the occupied coordinate as one crossed cell, so over-dwell is causal. Units are applied one at a time: pill → fuzz produces one cup unit, fuzz → clean produces one cup unit, clean → thin retains a pale stretched patch, and thin → hole retains a frayed opening. Crossing a protected coordinate stops at the exact coordinate and retains a snag mark. Geometry and rules are identical for pointer, keyboard, normal motion, reduced motion, proof simulation, and resume.

## Dust cup causality

The transparent cup has capacity `14` and a warning line at `12`. Restoring twelve pills produces exactly `24` dust units. Therefore a successful run cannot avoid emptying, and one empty can be sufficient. The canonical route makes one safe pass over all twelve pills, reaches the visible warning at `12`, empties once, then repeats the two safe strokes to finish at `12/14`.

Adding a fifteenth unit without emptying triggers overflow. The cup retains `15/14`; three already-clean pill coordinates deterministically fall back to fuzz and are listed as redeposited coordinates. The overflow terminal shows those changed cells rather than a generic failure card. The empty control becomes unavailable after its single use; emptying too early leaves too little remaining capacity and eventually causes the same causal overflow.

## Interaction and state transitions

1. `READY` — whole knit, all protected details, twelve pills, empty cup, warning line, and both explicit controls are visible.
2. `DRAGGING` — a captured pointer moves the shaver. Normal motion may own one tracked frame only for the lifetime of the active drag; processing itself remains quantized by samples.
3. `SAMPLING` — reduced motion queues the same segments through nonzero tracked stages; no continuous frame runs.
4. `CUP WARNING` — level `12/14` changes the material rim and status without obscuring the knit.
5. `EMPTYING` — lift, separated cup, and reseated cup are bounded tracked stages. The empty count becomes exactly one.
6. `CHECK` — the explicit `仕上がりを確認` action evaluates retained geometry. Merely lifting the pointer never guesses completion.
7. `TERMINAL` — all controls lock immediately. One tracked finish stage commits exactly once.

Touch drags directly on the material. Keyboard focus rests on the canvas: arrows move a visible lattice cursor, Space toggles the shaver, movement while active uses the same safe one-unit segment geometry, `E` focuses/activates the cup action, and Enter checks the finish while the shaver is raised. Separate minimum-44px cup and finish buttons provide native focus and touch paths.

## Outcomes

- **Success:** every authored pill is exactly level `2`, every ordinary cell remains level `2`, no decoration is damaged, the cup was emptied exactly once, and it has not overflowed. The knit folds into an original finished still while retaining a small material ledger.
- **Retained pills:** explicit check while any target is level `0` or `1`; exact coordinates and remaining count remain visible.
- **Decoration damage:** contact with bead, embroidery, tag, or loose thread; exact type and snag coordinate remain visible.
- **Hole:** any cell reaches level `4`; the local opening and frayed coordinate remain visible.
- **Thinned knit:** explicit check with a level-`3` cell retains the pale stretched patch as a distinct incorrect result.
- **Overflow/redeposit:** cup reaches `15/14`; deterministic redeposited fuzz coordinates, full cup, and all other cell levels remain visible.
- **Timeout:** current full level array, tool coordinate, cup level, empty count, snag/redeposit arrays, and progress remain unchanged and are returned in the result payload.

## Generation, validation, proof, and resume

Generation chooses only one of three authored layouts through injected `randomInt`; hostile values fall back to layout zero. Tasks are finite cloneable plain data and contain no functions, DOM values, assets, dates, maps, or cyclic references.

Validation reconstructs the selected authored layout and rejects changed copy, duration, dimensions, processing thresholds, cup bounds, target/protected geometry, safe strokes, proofs, or malformed resume. It independently simulates:

- the canonical two-pass route with one empty to success;
- a one-tick fast route to retained pills;
- the exact `1/2`, `3/4`, `5/6`, and `7/8` dwell boundaries;
- protected-part contact to coordinate-retaining decoration damage;
- eight-tick local dwell to a hole;
- two cleaning passes without emptying to overflow and redeposit;
- a partial route followed by timeout.

A runtime snapshot is strict plain data: version, complete 168-cell level array, cup, empty count, result, tool/cursor coordinates, keyboard-tool state, snag, and redeposited coordinates. Attaching this as `task.resume` and rendering through a fresh module restores the exact geometry. Validator bounds every number, validates coordinates and protected-part identity, and rejects inconsistent terminal or overflow state.

## Motion, ownership, and disposal

Normal motion may own one context-tracked frame only while a pointer is actively dragging; pointer samples themselves repaint the following head and cup, so the frame performs bounded drag bookkeeping rather than repeatedly repainting the full DPR3 textile. Pointer release stops it immediately. Reduced motion owns no frame: each queued sample and the empty/finish feedback use deterministic nonzero `context.later` stages with the same integrated path geometry. No raw timer, animation-frame, event, audio, network, storage, image, font, or global-document API is allowed.

Abort synchronously clears drag, staged samples, feedback, deadline, listeners, QA, and the finish path. Late callbacks become inert. A terminal and a deadline can never commit more than once.

## Commercial visual direction

The board reads as one continuous garment panel, never as a flat visible grid. Deep indigo rib and stockinette bands have alternating stitch loops, grazing highlights, subtle folded edges, and a warm worktable shadow. Pills are irregular raised fiber clusters; fuzz has a short directional halo; clean cells restore aligned loops; thinning spreads the weave; a hole opens onto the dark backing with retained frayed yarn.

The shaver has an original ivory/brass body, perforated metal head, transparent amber-edged cup, separated latch, and a soft contact shadow. Beads are faceted glass, embroidery is dense contrasting thread, the care tag is unbranded woven cloth, and the loose thread curls visibly above the surface. Warning uses the physical cup rim and restrained amber UI; failures use coordinate callouts, not screen-filling red flashes. Success folds the same restored garment with a paper band and lint-free material highlight. No generic emoji, real fashion branding, copied appliance design, confetti, or audio.

If static assets are commissioned later, the brief is: one original 1206×2622-safe worktable/garment backing, separated transparent shaver body/head/cup layers, protected bead/embroidery/tag/thread parts, pill/fuzz/clean/thin/hole texture swatches, snag/redeposit overlays, and one folded-success knit still. Text and status remain live UI rather than baked into artwork.

## Required pre-browser evidence plan

Node evidence must cover metadata; 10,000 bounded generations; all three authored layouts; clone/JSON/fresh-module resume; independent path rasterization and threshold boundaries; canonical success; retained-pill, each decoration kind, thin, hole, overflow/redeposit, and timeout terminals; exact one-empty cup behavior; actual pointer timing/path capture; keyboard lattice/tool/cup/finish; native focus and touch controls; immediate lock; one finish; DPR3 backing; reduced nonzero stages with no frame; normal frame only during drag; ownerDocument creation; disposal through fake and real kernel; bounded paint workload; and source bans.

After explicit audit-lane handoff, browser evidence will use full-resolution 393×852 and 402×874 DPR3 normal/reduced captures for `initial`, `mid-clean`, `cup-full-warning`, `decoration-damage`, `hole`, `overflow`, `success`, and `timeout`, plus actual touch/keyboard paths, lock/deadline/dispose/performance evidence and supplemental 390/430 boundary checks. Browser work must not begin while the lane is occupied.
