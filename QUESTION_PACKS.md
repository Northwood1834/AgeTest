# Question packs and progression

## Additive content model

Every problem factory has:

- a stable `id` such as `memory-path-v1`;
- an `introducedIn` content-pack version;
- a required brain-level `tier`;
- one scoring category;
- one play flavor (`classic`, `satisfying`, `quirky`, or `wild`);
- a generator that produces randomized task parameters.

v1.2 includes 54 template families across reaction, memory, language, spatial recognition, prediction, inhibition, calculation, attention, time perception, and conversation. The author has permitted growth up to 100, with a rational stopping point any time after 50; the pilot stops at 52 so QA remains proportionate. Tier distribution is 18 / 23 / 13 for Tier 1 / 2 / 3. Nine families use the richer scenario/action layer: an emoji runner, an author-icon mid-boss, an emoji FPS-style lock-on scene, a perspective lane choice, a variable putting green, an image-backed otome-style date conversation, a separate image-backed partner-repair conversation, a dot-art command battle, and a pseudo-3D auto-running lane stage. `calculation-rpg-battle-v1` draws every monster from a 24×24 two-frame pixel sprite with a randomized palette, so the party, its weaknesses, and the enemy action pool differ on each generation; the player wins only by wiping the party out with たたかう・まほう・とくぎ・どうぐ・なかま, and 「にげる」 ends the task as incorrect. `spatial-lane-run-v1` renders a full-resolution perspective course on a device-pixel-ratio-aware canvas — gradient sky, parallax ridges, roadside trees, shaded crates and boulders, particle bursts, and a vector-drawn runner animated per frame: the runner advances on its own and the player only chooses a lane and a jump moment, clearing the stage by dodging rock walls, jumping trenches, smashing wooden crates, leaping over the author mascot who sweeps across the lanes as a nuisance, and — against the reflex the wooden crates train — *not* jumping at the red TNT box, which fails the task on contact or on a jump. Its stage layout, theme, and author appearances are generated per task. The date task randomly uses one of three fictional adult characters and requires three context-aware choices before the invitation succeeds. `language-english-v1` presents its prompt, help, answers, and distractors entirely in English.

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
