# spatial-sheep-home-v1 — 夕暮れの牧羊

## Product promise

夕方の牧場で、牧羊犬を群れの反対側へ回し、4頭の羊を木柵の門から納屋へ戻す20–50秒の空間予測ゲーム。狼を攻撃するゲームではない。プレイヤーは風、柵、門、群れのまとまり、狼の次の巡回位置を同時に読み、距離を保ったまま帰還させる。

- Stable ID: `spatial-sheep-home-v1`
- Metadata: introducedIn `2.0`, category `spatial`, tier `3`, flavor `satisfying`, step `1`, family `spatial-sheep-home`
- Duration: 45 seconds
- Inputs: pasture tap / large touch controls / keyboard
- No audio, emoji, combat, external assets, or network

## Core interaction

The pasture is a finite 7×7 spatial model rendered as a rich top-down evening scene.

- Four authored sheep begin as a connected 2×2 flock.
- The barn pen is an authored 2×2 set behind a two-cell wooden gate.
- Fence edges are explicit blocked transitions. A blocked command is a non-terminal invalid action and does not advance the wolf.
- The dog moves to the side opposite the requested flock direction. Arrow keys or the four direction controls issue the same command. Tapping around the flock places the dog on that side and moves the flock away from it.
- `G`, Space, or the center “群れをまとめる” control gathers the flock without translating it.
- The wind is authored cardinal data and shown by a windsock/grass stream. Moving directly against it without first gathering causes the outer sheep to break away: a distinct escape failure. A successful against-wind move consumes the gathered state.
- Every valid gather or movement advances the nonviolent wolf patrol by one authored waypoint. The next three patrol cells are previewed. Occupying/crossing a sheep cell or entering the barn is a wolf failure.
- Success requires every sheep in the barn, no sheep escaped, no wolf contact, and no wolf barn intrusion.

This creates three coupled decisions: align the flock with the gate before crossing the fence, spend a turn gathering before an against-wind move, and ensure that the extra gather turn does not place the wolf on the flock’s route.

## Deterministic rules and proof

Task data is structured-cloneable plain data:

- `grid`, `sheep`, `barn.cells`, `fences`
- `wind`
- `wolf.path` and `wolf.index`
- `duration`, `maxMoves`
- exact `solution`
- bounded proof metadata

Actions are the finite lattice `N/E/S/W/G`. Simulation is quantized and side-effect free. BFS explores at most depth 12 with a hard node ceiling. Its state key contains sorted live sheep cells, home sheep IDs, wind-gather state, wolf patrol index, escape/contact/intrusion state, and move count. Generation chooses only from a small authored mirror family and re-proves it. Validation replays the stored proof, rejects a shorter false proof, and checks geometry, fence edges, connectivity, wolf route, wind, terminal invariants, and bounded proof metadata.

The authored base challenge requires two gathered against-wind steps plus northward gate alignment; their timing must also avoid the patrol preview. Mirroring changes east/west while retaining the same rule and proof quality.

## Motion and causal feedback

Normal motion uses one kernel-owned frame loop only while the game is alive. A valid command has readable phases:

1. dog circles behind the flock and a short route arrow appears;
2. sheep translate together, leaving paired hoofprints while the wolf advances on its preview path;
3. the flock settles, fence/gate/wolf distance is re-evaluated, and status text explains the result.

Reduced motion owns no continuous frame. The same command is shown in two tracked `context.later` stages (mid-command and settled) with input locked. Abort invalidates every pending phase.

Invalid fence input makes the struck rail/gate pulse and leaves both flock and wolf unchanged. Against-wind escape stretches one sheep downwind with grass/hoof trails. Wolf contact localizes a dusk-red danger ring around the contact without depicting violence. Timeout desaturates the pasture and preserves the real remaining sheep/wolf state.

## Visual direction

Commercially finished, warm pastoral diorama rather than generic grid art:

- layered high-resolution grass gradient, mown paths, individual blades, clover, and long evening shadows;
- dimensional timber fence/gate with grain, bevels, posts, iron hinges, and warm barn interior;
- sheep made from clustered translucent wool curls, small faces/ears/legs, body shadows, and distinct collar marks;
- a compact collie with white ruff and a calm gray wolf silhouette kept spatially separate;
- wind shown through a small cloth streamer plus bent grass, not text alone;
- wolf preview as restrained dashed paw-path and numbered next positions;
- paired hoofprints and dog pawprints make movement history legible;
- dedicated light HUD above the playable pasture for sheep count, gathered state, wind, and move count;
- quiet success: all sheep visible in the warm barn, gate eases shut, lantern glow/floating grass seeds and fireflies; no explosive confetti;
- each failure keeps its cause visible and does not cover the whole board.

## Required independent evidence

Final full-resolution DPR3 captures at 393×852 and 402×874 for:

1. initial
2. gather
3. valid move
4. wind-blocked warning
5. fence-invalid command
6. wolf pressure
7. success
8. sheep escape
9. wolf contact
10. timeout

Also verify 390×844 and 430×932, touch/tap controls, keyboard controls, visible focus, reduced stages, plain JSON resume, deterministic proof, distinct terminal results, disposal, no overflow/external requests, and frame performance.
