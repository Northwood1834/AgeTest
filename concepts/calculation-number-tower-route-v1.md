# calculation-number-tower-route-v1 — 数の塔・一筆攻略

## Identity

- Stable ID: `calculation-number-tower-route-v1`
- Introduced: `2.0`
- Category: `calculation`
- Tier: `3`
- Flavor: `wild`
- Step: `1`
- Family: `calculation-number-tower-route`
- Intended duration: 60 seconds

## One-line fantasy

切り開かれた機械塔を最上階まで見通し、数字を背負う探索者の全行程を先に組み立てて、弱い番人と演算室を順番に突破し、最後の塔主を倒す。

## Core distinction

This is a **route-planning number tower**, not another momentary gate runner and not a command RPG.

- The complete layered tower graph is visible from the start.
- The player deliberately chooses one adjacent room on each next floor.
- Entering a weaker enemy room defeats that enemy and adds its number to the hero.
- Entering `＋`, `−`, or `×` machinery applies that operation to the current number.
- The resulting number persists on the hero badge and changes every later enemy comparison.
- Cleared rooms, defeated guardians, activated machinery, the lit route, and blocked branches all remain visible.
- The top boss is not a separate battle system. It is the final comparison produced by the route.

A locally attractive room can therefore ruin the entire climb. The answer is the ordered path, not any one arithmetic choice.

## Finite authored task model

Six authored tower descriptors each contain:

- a start value from 11 to 15,
- four visible room floors, three rooms per floor,
- one top-floor boss,
- room kinds `enemy`, `add`, `sub`, and `mul`,
- integer values only,
- a fixed layered adjacency graph: the next room must be one column left, straight above, or one column right,
- a 60-second deadline,
- exhaustive simulation of every complete start-to-boss route.

The graph has exactly 41 complete routes. Exhaustive simulation records, for every route:

- ordered room IDs,
- terminal outcome (`success`, `too-strong`, `operator-trap`, or `boss-defeat`),
- final/current value,
- number of rooms resolved.

Each authored tower proves:

1. exactly one route defeats the boss,
2. at least two plausible routes lose,
3. both an enemy-strength loss and a subtraction trap are reachable,
4. at least two routes reach the boss but remain too weak,
5. all successful operations stay positive integers,
6. no simulated value exceeds 999,
7. every room transition changes the running value,
8. the unique winning trace recomputes exactly from the visible room data.

Generation selects one of the six finite descriptors with a bounded exact fallback. Validation rebuilds the complete descriptor and proof from its authored variant and rejects changed rooms, edges, values, copy, duration, proof, or extra fields. The task is JSON-serialisable plain data.

## Room rules

### Enemy room

The hero may defeat a guardian only when the current hero value is **strictly greater** than the guardian value. Victory adds the guardian value to the hero. A guardian that is equal or stronger produces the distinct `too-strong` terminal.

### Addition workshop

A brass lift battery applies `＋N`. Its dial visibly rolls from the old number to the new number.

### Multiplier turbine

A copper gear train applies `×2` or `×3`. Gear teeth engage, then the hero badge expands to the exact product.

### Subtraction drain

A cracked blue-gray counterweight applies `−N`. If the result is zero or below, the counterweight drops out of the shaft and produces the distinct `operator-trap` terminal. Otherwise the reduced value persists.

### Boss

The roof guardian uses the same strict comparison as every enemy. If the hero is stronger, its value is absorbed and the roof beacon lights; otherwise the retained final comparison produces `boss-defeat`.

## Interaction and causality

1. The player sees every room number, operator, edge, and boss before moving.
2. Rooms on the next floor are focusable. Reachable adjacent rooms glow along their actual elevator cable; nonadjacent or wrong-floor rooms remain visible but muted.
3. Touch/click chooses a room. Left/Right moves keyboard focus across the upcoming floor; Up or Enter confirms it.
4. Choosing a nonadjacent room does not silently ignore input. Its cable flashes broken, the status says which current room it does not connect to, and the climb remains live (`invalid-nonadjacent`).
5. A valid choice locks input and performs a causal transition:
   - the hero rides the selected cable,
   - the before value is shown,
   - the guardian falls or the machinery engages,
   - the badge rolls to the after value,
   - the traversed cable stays lit and other rooms on that floor become blocked.
6. The next set of reachable rooms then becomes active. The route ledger under the tower retains every arithmetic step.
7. Enemy defeat, operator trap, boss defeat, success, and timeout each preserve the inspectable final tower and commit at most once.

## Outcomes

- `success`: the unique authored route reaches the roof with a value strictly above the boss; boss is defeated and absorbed.
- `too-strong`: an entered ordinary guardian is equal to or stronger than the current hero.
- `operator-trap`: subtraction makes the hero value zero or negative.
- `boss-defeat`: the completed room route reaches the boss without enough value.
- `invalid-nonadjacent`: explicit nonterminal invalid feedback; current value and route do not change.
- `timeout`: current floor, value, selected focus, lit route, cleared rooms, and route ledger remain visible.

## Visual direction

A portrait cutaway tower assembled from original industrial-fantasy materials:

- dark plum masonry shell with chipped edges and inset mortar,
- four stacked floors of three distinct rooms,
- brass elevator rails and steel cable joints showing graph adjacency,
- warm amber room lamps and cool blocked-room shadows,
- an original compact explorer with leather coat, orange scarf, and enamel number shield,
- enemy guardians built from stone masks, riveted limbs, and colored core lenses,
- addition batteries with glass charge tubes,
- multiplier turbines with interlocking copper gears,
- subtraction drains with counterweights and cracked blue channels,
- a broad clockwork roof guardian and beacon cage,
- enamel number badges with bevel, rim light, shadow, and readable high-contrast numerals,
- defeated guardians slumped in place, machinery left in its activated position, and traversed cables glowing warm gold.

The tower, hero, guardians, room frames, number badges, and UI are original AgeTest compositions. No Hero Wars art, character silhouette, tower skin, room arrangement, typography, icon, or UI is copied. No emoji substitutes for authored material.

## Layout and hierarchy

- Top status: current value, upcoming floor, and short causal message.
- Main: dominant DPR-aware tower canvas with transparent semantic room buttons precisely over painted rooms.
- Current hero and route are foreground; future rooms stay legible for lookahead without competing with reachable highlights.
- Under the tower: a compact retained route ledger such as `15 → ＋9 = 24 → ×3 = 72`.
- Bottom: keyboard hint only; room choice occurs in the spatial tower, not in generic answer cards.
- Success: roof masonry opens to dawn, boss core breaks, beacon lights, and the final hero badge locks beside `塔主撃破`.
- Failures: distinct material treatment—guardian impact, dropped subtraction counterweight, boss shield impact, or amber timeout shutter.

## Motion, accessibility, and lifecycle

- Normal mode owns one tracked `context.frame` loop for restrained torch shimmer, gear idle, cable travel, and number-roll interpolation. It returns false after a terminal state settles.
- Reduced motion owns no frame loop. Every valid room resolution uses a small deterministic set of tracked `context.later` stages and lands on the same retained causal composition.
- Invalid nonadjacent feedback uses no untracked lifetime work and never changes the route.
- Every room has a DOM button with a full label including floor, room type/value, reachable state, and current comparison where applicable.
- Focus uses a distinct visible dashed outline and updates the canvas route preview.
- Status and route ledger are polite live regions. Canvas ARIA text states current value, floor, visited rooms, and outcome.
- Touch targets are at least 48 CSS px in both axes.
- Color is never the only cue: reachable/blocked text, room material/icon geometry, operation glyphs, before/after values, and terminal words remain explicit.
- Canvas backing uses CSS dimensions × DPR capped at 3.
- Deadline, finish, and abort make transitions inert, remove QA exposure, and leave no tracked listener, timeout, or frame alive.
- No audio, network, external asset, or browser-global lifetime primitive.

## Required QA frames (browser deferred)

At 393×852 and 402×874 DPR3 once a lane is explicitly handed off:

1. complete initial tower with all rooms and boss visible,
2. reachable-room hover/focus and route preview,
3. invalid nonadjacent cable feedback,
4. hero cable travel,
5. enemy defeat and absorbed value,
6. addition workshop before/after,
7. multiplier turbine before/after,
8. retained three-floor route with blocked branches,
9. too-strong guardian defeat,
10. subtraction trap,
11. boss defeat,
12. success roof beacon,
13. partial-progress timeout,
14. reduced-motion landed resolution,
15. touch and keyboard focus states.

Browser capture is intentionally deferred until an isolated lane is explicitly assigned.
