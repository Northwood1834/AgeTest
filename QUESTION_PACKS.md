# Question packs and progression

## Additive content model

Every problem factory has:

- a stable `id` such as `memory-path-v1`;
- an `introducedIn` content-pack version;
- a required brain-level `tier`;
- one scoring category;
- one play flavor (`classic`, `satisfying`, `quirky`, or `wild`);
- a generator that produces randomized task parameters.

v1.9 includes 64 template families across reaction, memory, language, spatial recognition, prediction, inhibition, calculation, attention, time perception, and conversation. The author has permitted growth up to 100, with a rational stopping point any time after 50; the pilot stops at 52 so QA remains proportionate. Tier distribution is 18 / 31 / 15 for Tier 1 / 2 / 3. Nineteen families use the richer scenario/action layer: an emoji runner, an author-icon mid-boss, an emoji FPS-style lock-on scene, a perspective lane choice, a variable putting green, an image-backed otome-style date conversation, a separate image-backed partner-repair conversation, a dot-art command battle, a pseudo-3D auto-running lane stage, a chain-reaction drop puzzle, a pin-pull flow puzzle, a water-sort puzzle, a number-gate run, a parking-jam puzzle, a rope-untangle puzzle, a colour-linking puzzle, a pipe-rotation puzzle, a bolt-removal puzzle, and a block-stacking test. `calculation-rpg-battle-v1` draws every monster from a 24×24 two-frame pixel sprite with a randomized palette, so the party, its weaknesses, and the enemy action pool differ on each generation; the player wins only by wiping the party out with たたかう・まほう・とくぎ・どうぐ・なかま, and 「にげる」 ends the task as incorrect. `spatial-lane-run-v1` renders a full-resolution perspective course on a device-pixel-ratio-aware canvas — gradient sky, parallax ridges, roadside trees, shaded crates and boulders, particle bursts, and a vector-drawn runner animated per frame: the runner advances on its own and the player only chooses a lane and a jump moment, clearing the stage by dodging rock walls, jumping trenches, smashing wooden crates, leaping over the author mascot who sweeps across the lanes as a nuisance, and — against the reflex the wooden crates train — *not* jumping at the red TNT box, which fails the task on contact or on a jump. Its stage layout, theme, and author appearances are generated per task. `prediction-chain-puzzle-v1` is a 6×9 drop puzzle whose board is built backwards from a planned three-step chain and then verified by a full search of every column, so a three-chain always exists; groups of four connected faces clear, the stack falls, and cascades score as chains. Random column play succeeds 28.5% of the time — comparable to the four-option questions — while reading the chain solves it in one drop. `prediction-pin-pull-v1` asks for the order in which three pins are pulled: lava kills the hero, water sets lava into stone, coins must reach the hero, and a chamber whose pin is already out passes later flows straight through. Every generated layout is checked over all six orders and kept only when exactly one order wins and at least two kill the hero, so guessing succeeds one time in six. The four families added in v1.8.0 are all verified by search before they are served: `attention-water-sort-v1` keeps only bottle layouts a breadth-first search solves in 4–7 pours and allows three spare moves; `calculation-gate-run-v1` enumerates all eight gate paths and keeps only boards where one or two of them beat the enemy; `spatial-park-jam-v1` keeps only 5×5 lots whose shortest escape is 4–8 moves; `spatial-rope-untangle-v1` keeps only layouts starting with 3–7 exact segment crossings, which a convex arrangement always resolves. `spatial-flow-link-v1` builds its 5×5 board backwards from a Hamiltonian path — randomised by backbite moves, which cost a single reversal each and cut generation from 3s to 5ms — then cuts that path into four or five coloured segments, so a full-coverage solution always exists; the player wins by linking every pair and covering all 25 squares. `spatial-pipe-flow-v1` lays a connected pipe run from source to goal and then spins each piece at random, so rotation alone always restores it; boards that happen to start connected are discarded, and lit pipes are drawn in water blue so the player can see how far the flow reaches. `attention-screw-out-v1` lays three bars across a 3×3 hole grid; a bar buries the bolts of the bars under it, touching a buried bolt ends the task, and only layouts where at most 20% of the 720 orders succeed are kept — buried bolts show through as shadows so their position is never a guess. `timing-tower-stack-v1` slides a block back and forth, faster with every level; the overhang is cut away and a clean drop keeps the full width, so five or six levels have to be landed before the block runs out of width.

## Difficulty steps

Every family in the catalogue — all 64, not only the minigames — ships as **step 1**: the basic form of its mechanic. A harder version of the same play is added as a **new stable ID with a higher step**, never as a retune of an existing ID, so a player's history, category strength and breadth points keep their meaning. Each factory therefore carries `step` (1 today) and `family` (its ID without the version suffix) alongside `tier`, `flavor` and `category`, and both appear in the QA catalogue.

A step-2 sibling raises the load of the same mechanic and enters at Tier 3:

| Mechanic | What step 1 does | What step 2 would change |
|---|---|---|
| Multiple choice (vocabulary, proverbs, readings, English) | Three distractors, one clearly right | Near-miss distractors, shorter deadline |
| Flash memory (missing item, position, n-back) | 4–5 items, 5s exposure | 6–7 items, shorter exposure, longer gap |
| Path memory | 3 flashes on a 3×3 grid | 4–5 flashes, 4×4 grid |
| Reaction (signal, target, emoji match) | Generous window, one target | Tighter window, moving or multiple targets |
| Spatial (rotation, mirror, cube, perspective) | One rotation, three visible faces | Two axes, hidden faces, more turns |
| Calculation (mental, missing term, multistep) | Two terms inside 40 | Three terms, carries, larger range |
| Inhibition (stroop, flanker, rule switch) | One rule for the whole task | Rule switches mid-task |
| Attention (counting, odd-one-out, dual) | One target among 14–25 | Two targets, denser field, closer lookalikes |
| Time sense | 3s or 5s, ±650–800ms | 7s, tighter tolerance |
| Conversation | Three steps, three choices | Four steps, four choices, one trap that reads well |
| Command battle | 2–3 monsters, 3 chains of action | 4 monsters, resistances, limited turns |
| Auto-runner | Three lanes, one hazard type per group | Moving hazards, faster stage |
| Chain puzzle | Three chains, one drop | Four chains, two drops, taller board |
| Pin pull | Three pins, six orders | Four pins, twenty-four orders |
| Water sort | Three colours, five bottles | Four colours, six bottles, fewer spare moves |
| Number gates | Three gates, eight paths | Four gates, sixteen paths, division |
| Parking jam | 5×5, shortest escape 4–8 | 6×6, shortest escape 8–12 |
| Rope untangle | 6–7 pegs, 3–7 crossings | 8–9 pegs, one extra chord |
| Colour link | 5×5, 4–5 pairs | 6×6, 5–6 pairs |
| Pipe rotation | 4×4, one run | 5×5, two runs sharing a source |
| Bolt removal | Three bars, six bolts | Four bars, eight bolts |
| Block stacking | 5–6 levels | 8 levels, faster slide | The date task randomly uses one of three fictional adult characters and requires three context-aware choices before the invitation succeeds. `language-english-v1` presents its prompt, help, answers, and distractors entirely in English.

Tier 1 contains intentionally simple, quickly understood families for new players. Tier 2 and Tier 3 stay out of selection until the player's brain level reaches the matching tier. A session selects 12 eligible factories, seeds at least one eligible family from each play flavor, caps one category at two questions, prioritizes unseen and weaker categories, and penalizes recently used factories. The author-icon mid-boss is inserted at position 6 only at brain level 2 or above. The final order is cryptographically shuffled before that insertion, so the next category is not previewed.

Future releases add factories to `TASK_FACTORIES`; they do not replace an existing stable ID. A semantic rewrite receives a new ID. This makes “each version adds new problems” observable in progression and lets new content expand the mastery ceiling.

## XP and anti-grind rule

A correct answer always grants 8 base XP plus a small speed bonus. The first correct answer in a template family grants a larger discovery bonus; the second and third grant a smaller bonus. XP and category statistics are committed after every answered task, so leaving mid-session does not erase completed work. The unfinished task set remains resumable; a final score, grade, and ranking entry are created only after the full session.

Level is:

```text
1 + min(floor(total XP / 120), floor(breadth points / 6))
```

`breadth points` is the sum of each template's correct count capped at three. Therefore:

- repeating one easy problem cannot independently raise level;
- correct play still grants XP;
- a player needs competence across multiple problem families;
- newly added templates create new breadth without invalidating old progress.

The cooldown and randomized, capped-category session selection add further friction against farming a single task.

## Score

The 100-point session score combines:

- correctness: 75 points;
- response quality/speed: 15 points;
- category breadth encountered: 10 points.

Correctness is intentionally dominant. Speed is only a small bonus, and timing thresholds are game rules rather than clinical norms.
