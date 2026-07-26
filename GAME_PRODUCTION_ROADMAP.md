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

## Creative direction

New games are conceived one owner and one game at a time. The director does not generate a bulk list of 221 shallow ideas. When a lane becomes available, its owner first proposes one best concept; implementation begins only after that single brief is accepted.

A dedicated Claude Opus game planner/designer expands the reviewed concept backlog but never implements code, edits shared runtime files, operates QA lanes, or performs Git integration. The director reviews and records only sufficiently distinct briefs, then assigns each accepted brief to a separate end-to-end implementation owner when a production slot is available.

Preferred sources of playful recognition are:

- the memorable few seconds or mechanical beat people remember from a classic game, rebuilt as an original homage;
- the satisfying interaction promised by mobile-game advertising, developed into the complete game rather than used as bait;
- nostalgic physical play from school, parks, or home, such as ruler flicking or battle pencils, translated into touch interaction;
- familiar physical card games such as speed or sevens, rebuilt around fast, legible touch play; and
- an original draw → deploy a monster → resolve a normal attack card-battle moment, presented with the completeness of a commercial card-game UI.

An homage preserves the structure of the remembered moment, not another work's protected name, characters, artwork, card frame, zone layout, copy, music, or screen composition. Every concept must have its own terminology, card designs, creatures, visual identity, and meaningful mechanical difference rather than a cosmetic reskin.

High production value is a defining requirement, not a late polish task. New games do not use low resolution, pixelation, crude handmade graphics, or ironic amateur styling as a shortcut. At both required DPR3 viewports, cards, materials, type, icons, particles, lighting, transitions, and terminal effects must look deliberately designed and resolution-independent. Card games in particular need a complete readable hierarchy for deck, hand, field, legal targets, stats, turn state, draw/deploy/attack feedback, and victory or defeat—not loose rectangles with text placed on them.

A concept brief contains one provisional stable ID, category/tier/flavor, a 20–60 second core loop, win and failure conditions, touch and accessible controls, visual identity and celebration, generation/validation invariants, and the reason it is not redundant with an accepted game. Multiple alternatives and speculative idea dumps are rejected as the wrong work granularity.

## Production cadence

Work proceeds in waves of at most three games, matching the three isolated QA lanes. Each owner receives one complete game only. A lane does not receive its next game until its current game passes independent visual review, tests, browser integration, manifest generation, and legacy removal where applicable.

For each game:

1. write its specific concept/rules and lock its stable ID;
2. author only `src/games/<id>.js` and `test/<id>*`;
3. prove bounded generation, solvability, save/resume, outcome and disposal behavior;
4. for a port, produce same-task legacy/module captures at 393×852 and 402×874 DPR3; for an original, produce the complete required state set at both viewports and review it against the accepted concept;
5. obtain independent visual acceptance;
6. commit the accepted game; after a wave of up to three, regenerate the manifest and verify the published-baseline/300 catalogue invariant;
7. for a port, remove only that game's legacy implementation and verify again; and
8. assign the lane's next single game only after its wave is integrated.

A failed game stays isolated and is revised or withheld. It never blocks accepted modules from being curated independently.

## Active and queued published-game waves

### P02 — completed

- `spatial-flow-link-v1` — accepted
- `attention-screw-out-v1` — accepted
- `timing-tower-stack-v1` — accepted

### N01 originals — completed

- `timing-fish-grill-v1` — accepted
- `prediction-desk-ruler-duel-v1` — accepted
- `prediction-card-combo-v1` — accepted

### P03 — completed

- `prediction-chain-puzzle-v1` — accepted
- `spatial-lane-run-v1` — accepted
- `calculation-rpg-battle-v1` — accepted

### P04 — active port wave

- `reaction-emoji-runner-v1` — accepted and integrated
- `spatial-emoji-fps-v1` — accepted and integrated
- `prediction-lane3d-v1` — accepted and integrated

P04 takes the next three owner slots that become free after their current ownership contracts. It precedes further waiting original-game ideas. Each port requires same-task legacy/module source captures at both canonical viewports and removes only its own accepted legacy factory after integration.

### P05 — active ports

- `spatial-golf-putt-v1` — accepted and integrated
- `attention-author-boss-v1` — accepted and integrated
- `social-date-v1` — accepted and integrated

### P06 — active ports

- `reaction-target-v1` — accepted and integrated
- `memory-path-v1` — accepted and integrated
- `spatial-cube-v1` — accepted and integrated

### N02 — completed daily-ritual original series

- `spatial-sheep-home-v1` — accepted
- `attention-farm-close-v1` — accepted
- `spatial-commuter-seat-v1` — accepted

Series direction: [`DAILY_RITUAL_SERIES.md`](./DAILY_RITUAL_SERIES.md).

### N03 — completed

- `attention-driving-safety-v1` — accepted
- `spatial-screen-protector-v1` — accepted
- `social-thread-vibe-v1` — accepted

### N04 — completed

- `attention-laundry-rescue-v1` — accepted and integrated
- `calculation-change-smart-v1` — accepted and integrated
- `memory-phone-pin-v1` — accepted and integrated

### N05 — completed

- `calculation-number-tower-route-v1` — accepted and integrated
- `social-care-package-v1` — accepted and integrated
- `spatial-draw-shelter-v1` — accepted and integrated

### N06 — completed

- `attention-goods-shelf-sort-v1` — accepted and integrated
- `spatial-sand-channel-v1` — accepted and integrated
- `prediction-ricochet-knockback-v1` — accepted and integrated

### P07 — active pre-browser ports

- `timing-five-v1` — accepted and integrated after current-source CTA correction
- `attention-search-v1` — accepted and integrated
- `spatial-flip-v1` — accepted and integrated
- `prediction-shape-v1` — accepted and integrated
- `inhibition-stroop-v1` — accepted and integrated
- `attention-shape-count-v1` — accepted and integrated
- `timing-two-v1` — accepted and integrated
- `reaction-shape-v1` — accepted and integrated
- `timing-three-v1` — accepted and integrated
- `attention-odd-v1` — accepted and integrated
- `social-partner-mood-v1` — accepted and integrated
- `inhibition-flanker-v1` — accepted and integrated
- `memory-reverse-v1` — accepted and integrated
- `social-greeting-v1` — accepted and integrated
- `reaction-emoji-match-v1` — accepted and integrated
- `attention-kana-count-v1` — accepted and integrated
- `attention-animal-count-v1` — accepted and integrated
- `inhibition-parity-v1` — accepted and integrated
- `inhibition-opposite-v1` — accepted and integrated
- `inhibition-rule-switch-v1` — accepted and integrated
- `memory-missing-v1` — accepted and integrated

### N09 — active original

- `memory-recipe-order-v1` — accepted and integrated
- `calculation-balance-scale-v1` — pre-browser; waits for audit lane
- `inhibition-quiet-tidy-v1` — flow lane

### N08 — active original

- `attention-lint-shaver-v1` — accepted and integrated
- `timing-mochi-pound-v1` — accepted and integrated
- `language-particle-scene-v1` — audit lane
- `prediction-domino-relay-v1` — screw lane

### N07 — completed original

- `spatial-draw-bridge-v1` — accepted and integrated

### P08 — active pre-browser port

- `spatial-rotation-v1` — accepted and integrated

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

New games enter production only after an owner is available and that owner has proposed one accepted brief. Stable IDs are assigned when the individual brief is accepted, never through a speculative 221-ID dump.

New waves preferentially fill the largest category gaps (`social`, `timing`, `reaction`, `inhibition`, and `memory`) while maintaining quality and mechanic diversity. Milestone reviews occur at 120, 180, 240, and 300 accepted modules. At each milestone, weak modules may be withheld through `RETIRED_GAME_IDS` without affecting resume compatibility or the production count ledger.
