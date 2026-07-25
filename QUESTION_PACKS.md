# Question packs and progression

## Additive content model

Every problem factory has:

- a stable `id` such as `memory-path-v1`;
- an `introducedIn` content-pack version;
- a required brain-level `tier`;
- one scoring category;
- one play flavor (`classic`, `satisfying`, `quirky`, or `wild`);
- a generator that produces randomized task parameters.

v1.6 includes 61 template families across reaction, memory, language, spatial recognition, prediction, inhibition, calculation, attention, time perception, and conversation. The author has permitted growth up to 100, with a rational stopping point any time after 50; the pilot stops at 52 so QA remains proportionate. Tier distribution is 18 / 28 / 15 for Tier 1 / 2 / 3. Sixteen families use the richer scenario/action layer: an emoji runner, an author-icon mid-boss, an emoji FPS-style lock-on scene, a perspective lane choice, a variable putting green, an image-backed otome-style date conversation, a separate image-backed partner-repair conversation, a dot-art command battle, a pseudo-3D auto-running lane stage, a chain-reaction drop puzzle, a pin-pull flow puzzle, a water-sort puzzle, a number-gate run, a parking-jam puzzle, a rope-untangle puzzle, and a colour-linking puzzle. `calculation-rpg-battle-v1` draws every monster from a 24×24 two-frame pixel sprite with a randomized palette, so the party, its weaknesses, and the enemy action pool differ on each generation; the player wins only by wiping the party out with たたかう・まほう・とくぎ・どうぐ・なかま, and 「にげる」 ends the task as incorrect. `spatial-lane-run-v1` renders a full-resolution perspective course on a device-pixel-ratio-aware canvas — gradient sky, parallax ridges, roadside trees, shaded crates and boulders, particle bursts, and a vector-drawn runner animated per frame: the runner advances on its own and the player only chooses a lane and a jump moment, clearing the stage by dodging rock walls, jumping trenches, smashing wooden crates, leaping over the author mascot who sweeps across the lanes as a nuisance, and — against the reflex the wooden crates train — *not* jumping at the red TNT box, which fails the task on contact or on a jump. Its stage layout, theme, and author appearances are generated per task. `prediction-chain-puzzle-v1` is a 6×9 drop puzzle whose board is built backwards from a planned three-step chain and then verified by a full search of every column, so a three-chain always exists; groups of four connected faces clear, the stack falls, and cascades score as chains. Random column play succeeds 28.5% of the time — comparable to the four-option questions — while reading the chain solves it in one drop. `prediction-pin-pull-v1` asks for the order in which three pins are pulled: lava kills the hero, water sets lava into stone, coins must reach the hero, and a chamber whose pin is already out passes later flows straight through. Every generated layout is checked over all six orders and kept only when exactly one order wins and at least two kill the hero, so guessing succeeds one time in six. The four families added in v1.8.0 are all verified by search before they are served: `attention-water-sort-v1` keeps only bottle layouts a breadth-first search solves in 4–7 pours and allows three spare moves; `calculation-gate-run-v1` enumerates all eight gate paths and keeps only boards where one or two of them beat the enemy; `spatial-park-jam-v1` keeps only 5×5 lots whose shortest escape is 4–8 moves; `spatial-rope-untangle-v1` keeps only layouts starting with 3–7 exact segment crossings, which a convex arrangement always resolves. `spatial-flow-link-v1` builds its 5×5 board backwards from a Hamiltonian path — randomised by backbite moves, which cost a single reversal each and cut generation from 3s to 5ms — then cuts that path into four or five coloured segments, so a full-coverage solution always exists; the player wins by linking every pair and covering all 25 squares. The date task randomly uses one of three fictional adult characters and requires three context-aware choices before the invitation succeeds. `language-english-v1` presents its prompt, help, answers, and distractors entirely in English.

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
