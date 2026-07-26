# Game idea and dispatch queue

Status: director-owned intake ledger for `rebuild/game-modules`.

The director records and sharpens user ideas, assigns exactly one game to one available owner, reviews evidence, and integrates accepted work. The director does not implement queued game modules. A new assignment is made when an owner has completed and released a game; no owner holds two games at once. Browser work still uses only the three isolated QA lanes.

Queue order follows user intake unless a category/lane dependency makes the next item temporarily impossible. A handoff contract locks the stable ID, scope, mechanic, acceptance states, and non-goals. Owners may improve the brief but may not replace its defining interaction with a generic quiz, tap target, or progress bar.

## Active owner assignments

| ID | Owner slot | State | Defining interaction |
|---|---|---|---|
| `calculation-number-tower-route-v1` | former Driving Safety owner | pre-browser; waits for flow | Plan a whole numbered tower route whose running value changes every later fight |
| `spatial-draw-bridge-v1` | former Ricochet owner | pre-browser; waits for audit | Draw a limited anchored span that must carry a real moving vehicle load |
| `reaction-emoji-runner-v1` | former Draw Shelter owner | P04 port pre-browser; waits for screw | Faithfully port the published one-jump log runner with same-task visual parity |
| `attention-laundry-rescue-v1` | former Sheep Home owner | browser/visual, flow lane | Drag only laundry into a top-loader; wife or dog is an immediate comic failure |
| `spatial-emoji-fps-v1` | former Goods Shelf owner | P04 port pre-browser; waits for audit | Faithfully port the published three-target 3D lock-on corridor with parity evidence |
| `prediction-lane3d-v1` | former Sand Channel owner | P04 port pre-browser; waits for screw | Faithfully port the published three-lane future-hazard choice with parity evidence |

## Waiting queue

### Q10 — `spatial-photo-booth-v1`

- Category/tier/flavor: spatial / tier 2 / quirky
- Core: inside an original ID-photo booth, directly drag a fictional adult subject's bent eyebrow control points and uneven mouth corners into a natural, camera-ready pose, then press the shutter.
- Required sequence: visible preparation state; reversible finger correction with over-adjustment possible; explicit ready/shutter action; authored `3, 2, 1` countdown; brief white camera flash; developed-photo result.
- Outcomes: a fully corrected face produces a clean accepted portrait; any remaining geometric misalignment produces a clearly retained rejected portrait; timeout remains distinct. The result must follow the actual final control-point geometry rather than a hidden multiple choice.
- Safety/privacy: fictional local illustration only—never request camera permission, access or store a real face, infer biometrics, upload data, or imitate a real photo-booth brand. Judge pose geometry, not skin, age, ethnicity, attractiveness, or identity.
- Proof: finite bounded facial control geometry, explicit tolerance bands, canonical correction, near-threshold pass/fail cases, overcorrection, single shutter/finish, and deterministic reduced-motion countdown/flash.

### Q11 — `spatial-sofa-turn-v1`

- Category/tier/flavor: spatial / tier 3 / satisfying
- Core: drag and rotate a long upholstered sofa through a narrow entrance and L-shaped apartment corridor, then settle it inside the living room.
- Required causality: moving the center translates the sofa while dragging either end rotates it; the full swept sofa polygon—not a point or hidden path—collides with walls, thresholds, a vase, and a hanging light. Wall contact leaves pressure/scuff marks at the actual contact position.
- Outcomes: clean placement; recoverable wall rub; excessive scuffing; broken obstacle; sofa wedged at the corner; and timeout retaining exact position, angle, and damage. The successful terminal shows the installed sofa with movers and resident taking a brief rest.
- Required distinction: not a grid maze, parking reskin, or multiple-choice rotation question. The player must discover a real translate–pivot–stand-up sequence in continuous geometry.
- Proof: finite authored floor plans, swept-polygon collision, canonical collision-free route, near-clearance boundary cases, deterministic damage accounting, plain resume, single finish, and equivalent reduced-motion geometry.

## Dispatched brief archive

### Q9 — `spatial-draw-bridge-v1`

- Category/tier/flavor: spatial / tier 3 / satisfying
- Core: draw a load-bearing bridge between legal anchors with a limited material budget, release it, and watch a vehicle cross under real sag and joint stress.
- Required distinction: unlike Draw Shelter, the line supports a moving load across a gap rather than deflecting a swarm.
- Proof: bounded stroke graph and supports, deterministic load steps, canonical viable span, bottom-out, snap, rollover, success, and timeout.

### Q8 — `prediction-ricochet-knockback-v1`

- Category/tier/flavor: prediction / tier 3 / wild
- Core: aim one projectile through visible wall bounces to knock targets from platforms while avoiding a protected bystander and dangerous rebound into the shooter.
- Required distinction: incidence angle, remaining energy, impact direction, and changed platform occupancy remain causal and visible; not another golf putt.
- Proof: quantized deterministic trajectories, bounded bounce count, canonical shot, near miss, collateral hit, self-hit, and success.

### Q7 — `spatial-sand-channel-v1`

- Category/tier/flavor: spatial / tier 3 / satisfying
- Core: scrape a bounded channel through sand, then release water or balls and let the drawn terrain route them to the target while drains and hazards remain separated.
- Required distinction: continuous excavation changes actual deterministic flow and erosion; no prerecorded path reveal or discrete pipe rotation.
- Proof: bounded stroke sampling, terrain mask validation, conserved material count, canonical successful channel and reachable leak/block failures.

### Q6 — `attention-goods-shelf-sort-v1`

- Category/tier/flavor: attention / tier 3 / satisfying
- Core: move visible shop goods from layered shelves into a limited staging rail; three matching products clear and reveal occluded goods behind them.
- Required distinction: shelf depth, temporary-slot congestion, and reveal order matter. It must not collapse into a flat match-three grid.
- Proof: finite authored shelves, exact triple-clear simulation, reachable recovery from near-full staging, distinct jam/success/timeout.

### Q5 — `calculation-number-tower-route-v1`

- Category/tier/flavor: calculation / tier 3 / wild
- Core: route a numbered hero through a tower, absorbing weaker encounters and applying visible `+`, `−`, and multiplier rewards so the running value can defeat the final floor.
- Required distinction: the whole room order changes later comparisons; this is not another one-step gate runner or command RPG.
- Proof: finite tower graph, exhaustive route outcomes, at least two plausible losing branches, one bounded winning route, plain-data resume.

### Q4 — `social-care-package-v1`

- Category/tier/flavor: social / tier 2 / quirky
- Core: a parent packs a limited “relief supplies” box for a 20-year-old university son living alone. Helpful, low-pressure necessities add points steadily; intrusive items impose a much larger penalty.
- Always supportive items: cup noodles, dry pasta, canned food, an Amazon gift card, new underwear, socks, rice. These ease ordinary solo living without prescribing his personality or social life.
- Always intrusive items: a swimsuit-gravure photo book and a “how to make friends” book. Their failure meaning is unwanted sexual/personal curation and implied criticism, not prudishness or inability.
- Context layer: the son's latest short message can make one or two supportive items especially timely, but never changes the allowed/forbidden classification. A finite authored proof scores every legal box composition.
- Outcome: packing helpful items raises a visible but non-gamey care score; including either intrusive item causes a large loss. After sending a bad parcel, the original messaging view shows `既読` with no reply. A genuinely helpful parcel ends with an original video-call still showing the adult son at ease with the delivered supplies.
- Visual identity: tactile cardboard box, packing paper, pantry and clothing materials, shipping label, and a restrained original chat interface. Do not copy LINE branding, logos, screen composition, or assets; the culturally recognizable `既読` behavior is enough.
- Art path: the owner may request an original Utage Sol brief for the successful video-call still. The son must read as an adult university student, not a child; the gravure-book cover remains non-explicit and abstract.
- Non-goals: moralizing quiz, “all male students are the same” stereotype, rapid good/bad tap grid, real messaging/network access, or treating a lack of reply as punishment by the son.

### Q1 — `calculation-change-smart-v1`

- Category/tier/flavor: calculation / tier 2 / satisfying
- Core: choose a payment from a limited Japanese wallet so the returned change uses the fewest coins.
- Required causality: underpayment is reversible; ordinary ¥1,000 payment is legal but suboptimal; exact payment is unavailable; exhaustive subset proof gives one optimal payment amount; returned ¥500/¥100/¥50/¥10/¥5/¥1 coins are shown physically.
- Non-goal: exact-payment drill or a multiple-choice arithmetic card.
- Note: an uncommitted director exploration exists and is not accepted production work. The eventual owner may replace it and owns the final concept, implementation, tests, and visual QC.

### Q2 — `attention-laundry-rescue-v1`

- Category/tier/flavor: attention / tier 2 / wild
- Core: an inept fictional husband clears scattered laundry into a top-loading washer while distinguishing clothes from his wife and dog in the clutter.
- Input: direct pick/drag into the open vertical washer; only actual laundry advances the load.
- Immediate failures: grabbing the wife or dog ends the run exactly once. The retained terminal illustration shows the unharmed, furious wife or dog rising from the open washer in exaggerated cartoon disbelief.
- Visual identity: cramped domestic laundry space, readable garment materials and silhouettes, deep cylindrical top-loader, escalating tidy floor, expressive husband reaction. No gore, injury, or realistic animal harm.
- Non-goal: generic hidden-object grid, indiscriminate rapid tapping, or flat emoji targets.
- Art path: owner may commission original character/outcome illustrations from the available Utage Sol lane; no copied characters or external runtime assets.

### Q3 — `memory-phone-pin-v1`

- Category/tier/flavor: memory / tier 2 / quirky
- Core: memorize a fictional four-digit PIN, then unlock an original phone interface. Soft floating thought bubbles around the lock screen retain meaningful memory cues.
- Structure: brief encoding phase; PIN disappears; keypad phase permits three complete attempts. A wrong attempt shakes the entered row and consumes one visible attempt. Third failure produces a distinct lockout; exact PIN produces a clean unlock.
- Invariants: every cue set maps uniquely to the four digits; plain-data resume retains phase and remaining attempts; partial input is reversible; one terminal finish only.
- Privacy: never request, infer, transmit, or store the player's real PIN. Generated digits and cues exist only inside the game task.
- Visual identity: an original handset and lock screen rather than an iOS/Android copy; depth-blurred wallpaper, frosted bubbles, tactile keypad, three-attempt indicator, and legible focus states.
- Non-goal: random PIN guessing, real-device imitation, or four independent arithmetic questions.

## Dispatch rule

When an active owner releases a slot, assign the first compatible waiting item with a complete ownership contract. The contract authorizes only its concept, module, tests, fixtures, and evidence. Shared files, manifest, acceptance records, Git operations, and other games remain director-owned. After owner evidence, a different reviewer must inspect all required full-resolution source frames before integration.
