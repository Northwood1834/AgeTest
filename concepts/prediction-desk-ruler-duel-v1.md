# 机上定規バトル

Status: accepted concept; implementation waits for the current migration wave to integrate.

- Provisional stable ID: `prediction-desk-ruler-duel-v1`
- Category: `prediction`
- Tier: 3
- Flavor: `satisfying`
- Family: `prediction-desk-ruler-duel`
- Concept owner: flow lane owner

## Core loop

A top-down wooden school desk holds the player's transparent ruler, two or three enemy rulers, and fixed eraser obstacles. Pull backward from the player's ruler to set direction and force, then release. The pencil tip flexes and flicks it; rulers slide, rotate, collide, reflect, tip at the edge, and settle before the next shot. Within three shots and about 45 seconds, knock every enemy ruler off the desk while keeping the player's ruler aboard.

The prediction line ends at the first contact. Multi-body consequences must be read rather than disclosed. Long-ruler torque, bank shots through erasers, ruler-to-ruler chains, and careful follow-up against a half-overhanging opponent are the game's decisions.

## Outcomes and controls

Victory requires every enemy to fall within three shots while the player remains. The player falling, shots expiring with an enemy present, or timeout is failure. A ruler that settles only partly over the edge survives.

Pointer input pulls opposite the intended shot; length sets force and angle sets velocity. Keyboard input uses left/right for angle, up/down for power, Shift for fine adjustment, and Enter to fire. Motion locks input until every body settles. Reduced motion uses readable staged movement rather than teleporting.

## Visual identity

The desk has wood grain, pencil marks, worn doodles, and window light. Rulers have thick translucent resin edges, millimetre markings, scuffed print, internal reflection, and soft desk shadows. The pencil bends before release; contact produces a short pressure wave and highlight. A falling ruler tilts at the edge and develops a deeper shadow before disappearing.

Success uses only school-desk materials: the last enemy hesitates at the edge, falls, the player settles after a half-turn, window light crosses its resin, pencil shavings and paper scraps follow the collision path, and a short `机上王` stamp lands on the desk. The game remains silent, matching AgeTest's no-audio product contract; impact is communicated visually and haptics are not required.

## Data and proof contract

Plain task data contains the desk boundary, ruler poses/dimensions/mass/friction/inertia, fixed eraser poses/restitution, shot limit, duration, action lattice, and a verified solution. A quantized fixed-step simulator must produce deterministic results after structured cloning and across reload.

Generation is bounded and proves a 2–3 shot solution over a finite angle/power lattice. Initial bodies are non-overlapping and safely inside the desk; the board is not already won; the player survives the authored solution; only enemies fall; at least two legal first actions exist; each simulation settles under a fixed step cap without NaN, tunnelling, overlap accumulation, or infinite reflection. An authored fallback is mandatory. Session generation must remain within the established interactive budget rather than performing an unbounded physics search.

## Distinction and homage boundary

Unlike golf putting, this is multi-body elimination driven by contact point, torque, and persistent board state. Unlike parking jam, motion and collision are continuous. It inherits only the remembered timing structure—one brief input followed by several seconds of readable collisions and an opponent balancing at the edge—from classic action and tabletop play. It copies no title, character, board, UI, audio, asset, or named rule from another work.
