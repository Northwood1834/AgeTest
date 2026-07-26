# Game idea and dispatch queue

Status: director-owned intake ledger for `rebuild/game-modules`.

The director records and sharpens user ideas, assigns exactly one game to one available owner, reviews evidence, and integrates accepted work. The director does not implement queued game modules. A new assignment is made when an owner has completed and released a game; no owner holds two games at once. Browser work still uses only the three isolated QA lanes.

Queue order follows user intake unless a category/lane dependency makes the next item temporarily impossible. A handoff contract locks the stable ID, scope, mechanic, acceptance states, and non-goals. Owners may improve the brief but may not replace its defining interaction with a generic quiz, tap target, or progress bar.

## Active owner assignments

| ID | Owner slot | State | Defining interaction |
|---|---|---|---|
| `attention-driving-safety-v1` | former Chain Puzzle owner | browser/visual, flow lane | Five original exam-format safety questions verified against current official Japanese primary sources |
| `spatial-screen-protector-v1` | former Lane Run owner | browser/visual, audit lane | Press a protector from the phone's bottom edge, physically vent bubbles, peel back when needed, finish bubble-free |
| `social-thread-vibe-v1` | former RPG Battle owner | browser/visual, screw lane | Keep an original anonymous-board thread in its context-appropriate temperature for three replies |
| `attention-laundry-rescue-v1` | former Sheep Home owner | pre-browser; waits for flow | Drag only laundry into a top-loader; wife or dog is an immediate comic failure |
| `calculation-change-smart-v1` | former Farm Close owner | pre-browser; waits for audit | Build a payment whose returned change uses the fewest coins |
| `memory-phone-pin-v1` | former Commuter Seat owner | pre-browser; waits for screw | Recall one fictional four-digit PIN from meaningful floating cues in three attempts |

## Waiting queue

None. New user ideas are appended here in intake order.

## Dispatched brief archive

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
