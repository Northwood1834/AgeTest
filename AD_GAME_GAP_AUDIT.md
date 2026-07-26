# Advertised-game mechanic gap audit

Checked: 2026-07-26. Purpose: identify recognizable mobile-ad interactions that the catalogue does not yet let the player actually play. This is a gap audit, not a bulk production queue. Only one audited concept is dispatched at a time.

## Sources and interpretation

Industry and player-facing coverage consistently identifies fake or weakly representative mobile ads built around pin pulling, rescue scenes, number towers, runners, sorting/merging, line drawing, and exaggerated physics puzzles. D3 Publisher's *Those Games* collections are useful corroboration because they deliberately turn several of those advertised interactions into real minigames.

References:

- Global Games Forum, “The Rise of Deceptive Mobile Game Ads”: https://www.globalgamesforum.com/features/the-rise-of-deceptive-mobile-games-ads
- Udonis, “Fake Mobile Game Ads”: https://www.blog.udonis.co/mobile-marketing/mobile-games/fake-mobile-game-ads
- Ars Technica, coverage of *Those Games*: https://arstechnica.com/gaming/2024/01/those-games-turns-crappy-mobile-game-ads-into-actually-good-puzzles/
- Aksys, *Those Games 1 & 2* physical release summary: https://www.aksysgames.com/blog/2025/04/24/those-games-12-physical-edition-coming-to-nintendo-switch-and-ps5/

The audit identifies interaction patterns, not titles or protected artwork. A production game must build an original setting, terminology, composition, and complete mechanic.

## Already covered

| Advertised interaction | Current playable coverage |
|---|---|
| Pull pins in a causal order | `prediction-pin-pull-v1` |
| Sort colored liquid | `attention-water-sort-v1` |
| Remove layered screws/plates | `attention-screw-out-v1` |
| Unjam a parking lot | `spatial-park-jam-v1` |
| Untangle crossing ropes | `spatial-rope-untangle-v1` |
| Connect pipes or fill a flow grid | `spatial-pipe-flow-v1`, `spatial-flow-link-v1` |
| Choose arithmetic gates while running | `calculation-gate-run-v1` |
| Dodge lanes and obstacles | `spatial-lane-run-v1` |
| Stack a moving tower | `timing-tower-stack-v1` |
| Tactical arithmetic battle | `calculation-rpg-battle-v1` |
| Chain-clearing drop puzzle | `prediction-chain-puzzle-v1` |

Cash-run, crowd-gate, and generic endless-runner ads are close enough to the existing gate/lane games that they are not immediate priorities. Another pin, liquid, screw, pipe, rope, or parking reskin would not fill a real gap.

## Confirmed uncovered shortlist

### 1. Draw and guard — dispatched

Recognizable promise: draw one physical line to shield a vulnerable subject from bees or another moving hazard, then watch whether gravity and collisions defeat the drawing.

Gap: no current game turns a freehand stroke into a constrained physical barrier. `spatial-draw-shelter-v1` is assigned with an original garden-courier setting, anchored limited ribbon, sag/collision behavior, and a real survival phase. It must not copy doge artwork or reduce the result to a static circle hitbox.

### 2. Number tower route

Recognizable promise: a numbered hero chooses an order through tower rooms, absorbs weaker enemies or weapons, and grows strong enough for the top floor.

Gap: Gate Run makes momentary arithmetic choices and RPG Battle resolves commands, but neither asks the player to plan a whole spatial encounter order whose running total changes every later comparison. This is the strongest calculation candidate after Draw and Guard.

### 3. Goods shelf triple-sort

Recognizable promise: move visible products among crowded shop shelves so three matching goods clear and expose what is behind them.

Gap: Water Sort and Screw Out have different state spaces; no game combines limited shelf slots, occlusion, triple clearing, and congestion management. Production must use readable product silhouettes and shelf depth rather than a flat match grid.

### 4. Dig a channel

Recognizable promise: scrape sand or soil with a finger so water, balls, or another material reaches a goal while lava, drains, and weak walls remain separated.

Gap: Pipe Flow uses discrete rotations and Pin Pull uses discrete barriers. No current game provides continuous excavation whose shape controls later material flow. A real implementation needs bounded terrain, deterministic flow, and erosion—not a prerecorded path reveal.

### 5. Ricochet knockback shot

Recognizable promise: aim one projectile through wall bounces to knock enemies from platforms without rebounding into the player or a hostage.

Gap: Golf Putt predicts a rolling shot, but there is no multi-bounce combat geometry, knockback, or changing platform occupancy. A production version must visibly preserve angle, remaining energy, impact, and collateral risk.

### 6. Draw a load-bearing bridge

Recognizable promise: draw a bridge or support under a vehicle, release it, and see whether the vehicle crosses under real load.

Gap: related to Draw and Guard but mechanically distinct: the line must support a moving load across a gap rather than deflect a swarm. It stays below the five gaps above until Draw and Guard proves that freehand geometry, touch sampling, and reduced-motion simulation are robust.

## Selection rule

The next audited mechanic enters the owner queue only when a compatible owner is free and earlier queued user ideas are already assigned. Priority is based on mechanical gap, recognizability, ability to prove deterministic behavior in a static site, and distance from accepted games—not on how many ad tropes can be listed.
