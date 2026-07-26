# 300-game production roadmap

Status: active production plan for `rebuild/game-modules`.

## Product target

The public catalogue targets 300 independently owned games: 30 games in each of the ten established categories (`reaction`, `memory`, `attention`, `inhibition`, `calculation`, `language`, `spatial`, `timing`, `prediction`, and `social`). One stable ID always maps to one ES module and one acceptance record. A game can be added, withheld from new sessions, restored, or retired without changing another game.

The generated manifest is availability inventory. Public curation is `selectableGameCatalog = manifest − RETIRED_GAME_IDS`; adding one stable ID to `RETIRED_GAME_IDS` withholds that game from new sessions while its module remains loadable for saved-session resume. Poor games are not padded into a release to satisfy a count.

No production unit may combine several stable IDs into a generic game module. Shared lifecycle and selection stay in the kernel; a game's rules, generator, validation, visuals, interaction, and disposal stay in its own file.

## Current inventory and target

| Category | Current published IDs | Target | New concepts eventually needed |
|---|---:|---:|---:|
| attention | 10 | 30 | 20 |
| calculation | 9 | 30 | 21 |
| inhibition | 5 | 30 | 25 |
| language | 14 | 30 | 16 |
| memory | 7 | 30 | 23 |
| prediction | 9 | 30 | 21 |
| reaction | 5 | 30 | 25 |
| social | 3 | 30 | 27 |
| spatial | 13 | 30 | 17 |
| timing | 4 | 30 | 26 |
| **Total** | **79** | **300** | **221** |

The 79 published IDs are compatibility work, not automatically the final public selection. They are ported faithfully first so quality can be judged module by module. New concepts then fill category gaps without weakening the acceptance gate.

## Production cadence

Work proceeds in waves of at most three games, matching the three isolated QA lanes. Each owner receives one complete game only. A lane does not receive its next game until its current game passes independent visual review, tests, browser integration, manifest generation, and legacy removal where applicable.

For each game:

1. write its specific concept/rules and lock its stable ID;
2. author only `src/games/<id>.js` and `test/<id>*`;
3. prove bounded generation, solvability, save/resume, outcome and disposal behavior;
4. produce same-task legacy/module captures at 393×852 and 402×874 DPR3;
5. obtain independent visual acceptance;
6. commit the game, regenerate the manifest, and verify the 79/300 catalogue invariant;
7. remove only that game's legacy implementation and verify again; and
8. assign the lane's next single game.

A failed game stays isolated and is revised or withheld. It never blocks accepted modules from being curated independently.

## Active and queued published-game waves

### P02 — active

- `spatial-flow-link-v1` — flow lane
- `attention-screw-out-v1` — screw lane
- `timing-tower-stack-v1` — audit lane

### P03 — assign one-by-one after P02 acceptance

- `prediction-chain-puzzle-v1`
- `spatial-lane-run-v1`
- `calculation-rpg-battle-v1`

### P04

- `language-word-order-v1`
- `social-date-v1`
- `social-partner-mood-v1`

### P05

- `attention-author-boss-v1`
- `spatial-emoji-fps-v1`
- `prediction-lane3d-v1`

Later published waves are selected from the remaining legacy IDs in threes. Priority goes to distinct mechanics and lifecycle risk before simple choice games, so the foundation is exercised rather than padded.

## New-game programme (IDs 80–300)

New games are conceived in waves of three only after an owner is available. Each concept brief must state the mechanic, success condition, failure condition, accessibility path, visual identity, generation proof, and why it is not a cosmetic variant of an existing game. Stable IDs are assigned when that brief is accepted, not in a speculative 221-ID dump.

New waves preferentially fill the largest category gaps (`social`, `timing`, `reaction`, `inhibition`, and `memory`) while maintaining quality and mechanic diversity. Milestone reviews occur at 120, 180, 240, and 300 accepted modules. At each milestone, weak modules may be withheld through `RETIRED_GAME_IDS` without affecting resume compatibility or the production count ledger.
