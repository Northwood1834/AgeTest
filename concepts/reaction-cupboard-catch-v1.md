# reaction-cupboard-catch-v1 — Original Game Concept

Status: complete — original N10 implementation from queue Q24.

## Identity

- Stable ID: `reaction-cupboard-catch-v1`
- Introduced: `2.0`
- Category: `reaction`
- Family / step: `reaction-cupboard-catch` / `1`
- Tier / flavor: `2` / `wild`

## Player promise

Eight fictional cupboard pieces visibly tip on a finite integer schedule. Direct two independent hand slots to catch each piece at its exact catch tick, then proactively unload each occupied hand to the piece's shape-marked counter zone before later falls consume both hands.

Nothing depicts injury or hazardous cleanup. A missed fictional piece remains whole and may show one single hairline crack only. There are never shards, broken glass, blood, cleanup instructions, alarm audio, or distressed characters.

## Authored finite schedule

- Integer ticks run from `0` through `22`.
- Eight items have exact catch ticks `[3,6,9,9,12,15,18,21]`.
- Each item exposes four visible stages: shelf, tipping, falling, catchable.
- Catch is accepted only on the item's exact catch tick. One tick early is still falling; one tick late is a retained miss.
- The pair at tick `9` requires both independent hand slots.
- Each hand performs at most one catch or unload action per tick. A hand used to catch cannot unload until a later tick.
- Correct zone mapping is finite and visible: round plate → circle, cup → arch, tray → square, bowl → diamond.
- Normal uses a tracked `500 ms` tick. Reduced motion uses a shorter but nonzero tracked `300 ms` tick with identical schedule, item order, boundaries, and retained state.
- The independent real deadline is `30000 ms`.

## Input

- Hand buttons catch the earliest still-uncaught item active on the current tick.
- A caught hand remains visibly occupied. When no active item is waiting, activating a hand selects it for unloading.
- Activating a shape zone unloads the selected occupied hand.
- Item buttons also support keyboard/touch catch using the selected hand, making simultaneous scheduling accessible.
- Native focus rings, live status, touch, and keyboard activation share the same finite actions.

## Outcomes

Every terminal result retains exact tick, queue states, both hands, stored IDs, selected hand, and failure detail.

- `all-stored`: all eight caught pieces are unloaded to correct zones.
- `miss`: a catch tick passes; the exact missed item remains at the counter edge with at most one crack.
- `wrong-zone-slide`: an occupied hand unloads to a nonmatching shape zone; the whole item slides and remains there.
- `two-hand-collision`: both hands are directed to the same item during its catch tick; both hand slots and item state remain visible.
- `overloaded-hands`: an already occupied hand is directed at another active item.
- `timeout`: exact queue, hands, stored pieces, selected hand, and current tick remain unchanged.

Finish is single-shot. No terminal board can restart, catch, unload, or finish twice.

## Exhaustive scheduling proof

Generation computes a finite integer-tick dynamic program rather than asserting solvability.

At every tick, each hand independently chooses one legal action: idle, unload its held item, or catch one active item. The search rejects duplicate catches, occupied-hand catches, missed windows, and wrong-zone unloads, and deduplicates complete physical states.

The proof records:

- all eight exact catch ticks and one-early/one-late boundaries;
- at least one complete schedule;
- no complete schedule when unload is forbidden before the final catch, proving proactive unloading is necessary;
- the simultaneous tick-9 pair and two-hand occupancy;
- reachability of miss, wrong-zone slide, two-hand collision, overloaded hands, and timeout;
- bounded state/tick counts.

Validation recomputes the proof and rejects schedule, item, hand, zone, timing, or proof changes.

## Plain resume

The task contains strict cloneable resume data. A running resume restores tick, item states, hand occupancy/action flags, stored IDs, and selected hand. A terminal resume restores the retained outcome without calling finish again. Cross-field validation rejects duplicate occupancy, impossible stored/caught states, changed IDs, or a second finish.

## Visual direction

An original abstract cupboard uses painted wood panels, eight unbranded geometric dish pieces, two cloth-glove hand slots, and four shape-marked padded counter zones. A visible schedule rail previews every tip. Item material states are discrete: shelf, tipping, falling, catchable, hand-held, safely stored, slid, or missed with one CSS crack.

No real product branding, real dish design, emoji, external assets, or audio is used. The full board and controls fit 390–430 CSS px at DPR 3 without horizontal overflow.

## Evidence gate

Focused tests cover the generated task/proof, exhaustive proactive schedule, exact catch boundaries, simultaneous pair, correct storage, every retained failure, strict running/terminal resume, single finish/input lock, normal/reduced equivalent order, real tracked deadline, disposal, touch/keyboard/focus, and forbidden APIs.

Browser QC covers 393×852 and 402×874 DPR 3 normal/reduced across initial, tipping, catchable, occupied hands, unload, simultaneous pair, miss, wrong-zone, collision, overloaded, success, and timeout, plus real touch/keyboard scheduling, actual 30-second deadline, disposal, 390/430 layout, errors/external/overflow, and performance.
