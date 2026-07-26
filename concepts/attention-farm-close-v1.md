# attention-farm-close-v1 — 日暮れの畑じまい

## Identity

- Stable ID: `attention-farm-close-v1`
- Introduced: `2.0`
- Category: `attention`
- Tier: `3`
- Flavor: `satisfying`
- Step: `1`
- Family: `attention-farm-close`
- Intended duration: 48 seconds

## One-line fantasy

夕日が沈む前に畑を一巡し、散らばった農具を用途別の納屋へ戻し、荷台と門を指差し確認して、軽トラで家の灯りへ帰る。

## Why this is not a hidden-object game

The tools are always visible and named. The judgment is not “spot the object”; it is:

1. choose a short collection route while daylight remains,
2. respect the two-item carrying limit,
3. select the held tool and return it to the correct physical storage zone,
4. notice whether anything is still in the field or in hand before closing,
5. check the truck bed before latching the gate,
6. read each farm-road sign and steer the truck correctly.

Every action changes the depicted world: the worker marker travels, the sun drops, a tool leaves the soil and appears in hand, the matching barn fixture receives it, the doors close, the gate latches, and the truck follows the road home.

## Task model

A task is finite plain data selected from six authored field layouts and six authored road routes. It contains:

- six tools: hoe, rake, sickle, shears, basket, and hose,
- four semantic storage zones: long-tool rack, blade locker, shelf, and hose reel,
- normalized field coordinates,
- capacity `2`,
- a finite sunset action budget,
- a 48-second real deadline,
- the road-sign sequence,
- an authored, recomputed proof containing three collection trips, storage destinations, bed→gate checks, route choices, and total daylight cost.

Validation rebuilds the descriptor from its authored layout/route indices and rejects altered geometry, labels, acceptance rules, budget, route, proof, duration, or copy. Generation is bounded and has an authored fallback.

## Interaction loop

### 1. Collect

The worker begins beside the barn. Tool hotspots are spatially tied to the painted field. Taking a tool spends daylight according to route distance and moves the worker marker. At most two tools can be held. The inventory is visible rather than remembered off-screen.

### 2. Store

Select one held tool, then choose a barn zone. The first storage action returns the worker to the barn; subsequent nearby storage costs little. Wood handles, metal blades, woven basket, and rubber hose each have distinct drawings and matching fixtures.

A wrong zone is an immediate, explicit `wrong-zone` failure; it is not silently corrected.

### 3. Close and check

“戸締り確認” is available as a deliberate action. Using it while a tool remains in the field or in hand produces `left-behind` feedback and keeps the actual forgotten tools visible.

Once everything is stored, the view moves close to the barn and truck. The player must inspect the truck bed before latching the gate. Reversing that order produces `check` feedback. A checked bed and closed gate causally unlock the drive stage.

### 4. Drive home

At each short farm-road fork, a painted roadside sign indicates left, straight, or right. Touch buttons and Left/Up/Right keys steer. A wrong turn produces a distinct `drive` failure. Completing the route reveals the house windows, porch lamp, and the truck’s headlight beams.

## Outcomes

- `success`: all six tools stored correctly, barn close confirmed, bed checked, gate latched, every road sign followed; truck reaches the lit house.
- `wrong-zone`: selected tool placed against a fixture that does not accept it.
- `left-behind`: close attempted with a tool still in the field or carried.
- `check`: gate latched before truck-bed inspection.
- `sunset`: action budget exhausted or the real deadline expires.
- `drive`: wrong farm-road turn.

All outcomes commit at most once and preserve an inspectable final frame.

## Visual direction

High-resolution DPR-aware canvas, warm and grounded rather than flat:

- layered orange-violet sunset with a visibly descending sun,
- clodded soil, furrows, grass margins, dusty footprints,
- wood-grain handles, cold metal edges, woven basket strips, translucent green hose,
- weathered barn boards and fixture-specific storage silhouettes,
- compact kei truck with corrugated bed and mirrors,
- close-up gate latch and truck-bed inspection marks,
- road dust, rice-field silhouettes, utility poles,
- success: warm house windows and porch lamp against blue dusk, with two soft headlight cones.

No emoji, audio, network access, or borrowed character/IP treatment.

## Motion and accessibility

- Normal mode owns one tracked animation frame for restrained dust, sunset shimmer, travel/store transitions, and road movement.
- Reduced motion owns no continuous frame. Each causal transition uses a small number of tracked `context.later` stages and lands on a readable final composition.
- Every action has touch/click and keyboard access, visible focus, textual status, and an updated canvas ARIA label.
- DPR backing is capped at 3.
- Deadline, terminal state, and abort cancel every tracked transition, listener, frame, and QA exposure.

## Required QA frames

At 393×852 and 402×874 DPR3:

1. initial field scatter,
2. collect transition / two-item inventory,
3. correct barn storage,
4. truck-bed then gate check close-up,
5. farm-road drive decision,
6. success with headlights and house lights,
7. wrong-zone failure,
8. left-behind failure,
9. drive failure,
10. sunset timeout.
