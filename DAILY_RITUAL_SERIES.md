# 日常所作連作 — 帰る場所まで

Status: N02 production series commissioned by the user.

This series turns ordinary end-of-day and commuting movements into complete 20–55 second games. Each game follows the same dramatic shape without sharing rules or a generic renderer:

1. read a familiar lived-in space;
2. choose a safe route or order;
3. move people, animals, or tools without disturbing the surroundings; and
4. reach a quiet, materially visible state of completion.

The stakes stay grounded. Failure comes from a reachable everyday consequence—an exposed sheep, a forgotten tool at dusk, a collision or lost seat—not from combat framing, currencies, or arbitrary arcade hazards. Success is relief: a latched barn under evening light, a closed shed and truck arriving at a lit home, or settling into a train seat as the carriage resumes moving.

Every game remains an independent ES module with its own task model, proof, renderer, lifecycle, and visual acceptance. The series shares no runtime, level format, central renderer, or copied screen. Its common identity is authored material detail, environmental time, restrained typography, readable human-scale motion, and silent visual feedback under AgeTest's no-audio policy.

## Commissioned games

- `spatial-sheep-home-v1` — guide the flock through gates and away from a wolf's predicted path until every sheep is inside the barn.
- `attention-farm-close-v1` — collect and store each farm tool correctly, close the worksite, and drive the light truck home before dark.
- `spatial-commuter-seat-v1` — read passenger movement and choose a collision-free route through a commuter carriage to an available seat.

Original-game acceptance uses full-resolution 393×852 and 402×874 DPR3 state sets. Each owner must show the initial read, active choice, meaningful progress, danger or invalid action, success, distinct failure, and timeout, plus mechanic-specific transitions.
