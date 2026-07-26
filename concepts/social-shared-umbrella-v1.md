# social-shared-umbrella-v1 — 雨のアーケード、ふたりの傘

## Product promise

雨のアーケードを歩く二人の架空の成人の間で、一本の傘を連続的に左右へ動かし、傾きと歩調を合わせる20–30秒の社会・空間調整ゲーム。正解は誰か一人が我慢することではなく、二人の可視カバレッジを同時に保つこと。関係性や恋愛、現実の礼儀作法を推定・教授しない。

- Stable ID: `social-shared-umbrella-v1`
- Metadata: introducedIn `2.0`, category `social`, tier `3`, flavor `satisfying`, step `1`, family `social-shared-umbrella`
- Duration: 30 seconds
- Inputs: direct umbrella drag/tilt, pace buttons, keyboard
- No audio, emoji, external assets, network, storage, romance assumption, injury, blame, or self-sacrifice praise

## Quantized continuous mechanic

The illustrated walk consists of twelve finite segments. Each segment is plain data with `kind`, integer crosswind `−2…2`, and the other adult's integer pace `0…2`.

The controlled state is also integer and bounded:

- umbrella center `−2…2`;
- umbrella tilt `−2…2`;
- walking pace `0…2`;
- signed separation `−3…3` before a distance break;
- each person's retained wetness `0…3` before terminal exposure.

At every segment boundary each control may move by at most one unit. Normal motion continuously shows the canopy and people travelling between boundaries under one kernel-owned frame. Reduced motion uses static rain textures and `context.later` travel steps with the identical integer geometry.

For a wet segment:

- the controlled adult is at cross-path position `−1 + separation`;
- the other adult is at `+1`;
- effective rain coverage center is `umbrellaCenter + tilt − wind`;
- a person stays dry only when distance from that effective center is at most one;
- excess distance adds visible integer wetness immediately.

Pace changes separation by `pace − companionPace`. Reaching absolute separation four is `distance-break`. Pace 2 on a puddle is the separate harmless `puddle-splash`. A shelter segment has no rain and visibly resets separation to zero, giving both people a neutral repositioning point without erasing retained wetness.

Direct touch/pointer dragging positions the canopy horizontally and derives tilt from vertical drag. Keyboard arrows move the canopy, `Q/E` change tilt, and `1/2/3` choose pace. Large pace and adjustment controls expose the same state. Coverage cones, each person's dry/wet meter, signed distance, wind pennants, puddles, and shelter roofs remain visible.

## Outcomes

- `both-dry`: both adults arrive with wetness exactly zero.
- `companion-wet`: the other adult's retained coverage failed.
- `player-overexposed`: the controlled adult's retained coverage failed. Copy is neutral and explicitly does not praise self-sacrifice.
- `distance-break`: pace mismatch separates the pair beyond the shared canopy.
- `puddle-splash`: a harmless visible splash from rushing across a puddle; no fall or injury.
- `timeout`: retains exact segment, umbrella center/tilt, pace, separation, wetness, and coverage geometry.

Every terminal payload retains the actual controls, positions, wetness, history, segment, and result. The umbrella and both adults remain in place.

## Exhaustive proof

Generation chooses only a horizontal mirror and clones its bounded proof. The proof engine searches all 27 legal per-segment control deltas (`center × tilt × pace`) over the finite authored schedule, deduplicating exact integer states.

Validation reconstructs the authored mirror and proof and verifies:

- twelve exact segments including two puddles and three sheltered reset points;
- bounded control, distance, wetness, and coverage arithmetic;
- one minimum all-dry route with both people covered on every rainy segment;
- the route requires wind-dependent umbrella changes and pace changes;
- an uninterrupted center-only strategy cannot pass the changing winds;
- idealized player-only coverage accumulates companion wetness, and idealized companion-only coverage accumulates player wetness;
- either-person-only strategies are never accepted as `both-dry`;
- all five failures are reachable and success is exact;
- plain JSON resume and single finish are deterministic.

## Visual direction

An original rainy arcade with dimensional stone paving, shop awnings without brands, drain channels, puddle reflections, shelter pools, receding lamps, and parallax columns. The two adults are abstract authored figures differentiated only by coat color and geometric silhouette. No romance coding, gender-role cue, or real-world etiquette text.

The umbrella has a ribbed canopy, shaft, handle, cast rain shadow, wind bend, and two translucent coverage wedges. Rain is drawn as static local texture in reduced motion and tracked streak motion normally. Wetness changes coat material in four discrete stages. Shelter segments place both figures beneath a visible roof and reset the distance gauge. Success retains both dry coats under a warm arcade light; failures localize the exact cause without distress or blame.

## Required evidence

Full-resolution DPR3 captures at 393×852 and 402×874 for initial, active drag/tilt, wind correction, pace mismatch, shelter reset, balanced progress, both-dry success, companion wet, player overexposed, distance break, harmless puddle splash, timeout, and reduced stepped travel. Also verify 390×844 and 430×932, real touch drag, keyboard/focus, exact coverage boundaries, plain JSON resume, actual deadline, normal/reduced disposal, no overflow/external requests, and frame performance.
