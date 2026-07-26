# spatial-sand-channel-v1 — 砂脈の水路

Status: implemented; exhaustive flow proof, focused/full Node, isolated browser, and independent full-resolution visual QC passed.

## Pitch

A small brass-framed cutaway tray holds layered tactile sand. A finite reservoir waits at the top and a glass collecting vessel sits below. Scrape a continuous channel directly into the terrain, inspect the granular wake, then explicitly release the water. The water is not a prerecorded reveal: a deterministic finite material simulation moves through the terrain mask the player actually excavated, pools behind blocked soil, follows deeper/downhill cuts, and can escape through a drain, contaminate a hazard bed, or burst a weakened wall.

This is not pipe rotation, pin pulling, a static line intersection check, or a draw-and-watch animation. Excavation mutates bounded terrain cells; flow reads those cells every simulation step and conserves all released quantity.

## Terrain and excavation

- Authored trays are 18×25 finite masks with a top reservoir, bottom vessel, packed-silt throat, rocks, drain, contamination bed, and one visibly stratified weak wall.
- Pointer movement is resampled at bounded sub-cell spacing. A circular brush touches only in-bounds cells.
- One continuous pointer stroke can deepen a cell at most once, preventing event-rate-dependent over-digging. A second deliberate pass deepens the same channel.
- Every removed layer is counted. Depth is capped at three layers and represented by a granular cutaway, darker channel floor, edge wake, and displaced grains.
- Keyboard users move a visible excavation cursor with arrows and press Space/Enter to remove one layer. `R` releases water and `X` clears the tray.

## Deterministic water model

The reservoir contains exactly 120 units. It releases at most two units per simulation step. Each unit occupies a passable excavated cell and advances at most one row per step. Candidate cells are evaluated from the current terrain depth, packed-silt capacity, downhill direction, local occupancy, and vessel bias. Deeper branches carry more water; a one-layer packed throat transfers only on alternating steps. Special terminal cells account separately for vessel, drain, contamination, and weak-wall loss.

The simulation stops after a bounded 118 steps. At every step:

`released = active + vessel + drain + contamination + weak-wall loss`

No unit is created or discarded. Unmoved units remain visibly pooled in the current channel or reservoir.

## Authored proof set

Each finite layout stores sparse plain-data plans and exact recomputed outcomes:

- canonical: two-layer continuous channel; all 120 units reach the vessel;
- near-pass: one-layer channel with a deliberately deepened silt throat; at least 90 units arrive before the finite window;
- near-fail: one-layer silt throat throttles arrival below 90;
- blocked: one uncut row leaves water physically pooled above soil;
- drain: a deeper downhill branch reaches the grate and loses material;
- contamination: a deeper branch reaches the marked hazard bed;
- weak wall: a second scrape opens the stratified side wall and water bursts through it.

Validation rebuilds every depth mask, runs the real water simulator, checks exact conservation and expected outcome class, and verifies canonical/near threshold ordering. Generation chooses only among a small authored family and always terminates.

## State and outcomes

1. `DIG` — scrape, clear, and reshape. Partial excavation is fully reversible with Clear and serializes as sparse plain `cuts` plus removed count.
2. `FLOW` — release locks excavation. Normal motion advances the deterministic simulation on an owned frame loop near 60fps while material steps use a fixed elapsed quantum.
3. Reduced motion uses nonzero tracked timer stages, advances the same deterministic steps in small batches, and never starts a continuous RAF.
4. Success requires vessel quantity at or above the authored threshold with no drain, contamination, or weak-wall loss.
5. Distinct terminal classes: `success`, `near-fail`, `blocked-flow`, `drain-leak`, `contamination`, `weak-wall`, `over-dig`, and `timeout`.

A release and every terminal outcome commit once. Busy input is locked. Deadline and dispose cancel all game-owned jobs, frames, listeners, and finish callbacks.

## Visual direction

A portrait cutaway has a brass-and-rubber instrument frame, layered ochre/umber soil, embedded stone inclusions, fine displaced grains, a cyan reservoir, a glass vessel with measurement ticks, a dark drain grate, violet contamination crystals, and a cracked weak seam. Excavation should feel rounded and continuous rather than like a visible tile grid. Water has a bright leading meniscus, darker pooled body, tiny foam rims, and legible quantity readouts. Failure scenes preserve the final terrain and show the actual loss location; success fills the vessel with a quiet refracted glow.

Final browser evidence at 393×852 and 402×874 DPR3 in normal and reduced motion covers: initial sand, excavated canonical channel, explicit release, active flow front, canonical success, near-pass, near-fail, blocked pool, drain leak, contamination, weak-wall burst, over-dig, and timeout. Supplemental 390×844 and 430×932 checks cover touch drag, keyboard cursor/dig/focus, quantity conservation, reduced elapsed steps, overflow, external requests/errors, deadline, dispose, and performance.

## Safety and ownership

All DOM construction uses `context.host.ownerDocument`. Lifetime work uses only `context.listen`, `context.later`, `context.frame`, and `context.setDeadline`. No network, audio, storage, external asset, global document construction, raw timer, or raw animation frame is used.
