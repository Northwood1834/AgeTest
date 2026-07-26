# Game idea and dispatch queue

Status: director-owned intake ledger for `rebuild/game-modules`.

The director records and sharpens user ideas, assigns exactly one game to one available owner, reviews evidence, and integrates accepted work. The director does not implement queued game modules. A new assignment is made when an owner has completed and released a game; no owner holds two games at once. Browser work still uses only the three isolated QA lanes.

Queue order follows user intake unless a category/lane dependency makes the next item temporarily impossible. A handoff contract locks the stable ID, scope, mechanic, acceptance states, and non-goals. Owners may improve the brief but may not replace its defining interaction with a generic quiz, tap target, or progress bar.

## Active owner assignments

| ID | Owner slot | State | Defining interaction |
|---|---|---|---|
| `memory-recipe-order-v1` | former Memory Missing owner | N09; flow lane | Hidden fictional four-action order causes irreversible visible pan-state changes |
| `timing-mochi-pound-v1` | former Rule Switch owner | N08 original; screw lane | Accumulated safe-window turning against a finite accelerating mallet schedule |
| `language-particle-scene-v1` | former Social Greeting owner | N08; audit lane | Particle and phrase edits deterministically rebuild an always-visible target scene |
| `prediction-domino-relay-v1` | former Memory Reverse owner | N08 pre-browser; waits for screw | Limited-height placement drives one deterministic retained domino cascade |
| `calculation-balance-scale-v1` | former Lint Shaver owner | N09 pre-browser; waits for audit | Up to three composed weighings narrow exact heavy/light token hypotheses |
| `inhibition-quiet-tidy-v1` | former Animal Count owner | N09 pre-browser; waits for flow | Stop an active drag on visible signals while floor-dependent noise remains causal |

## Waiting queue

### Q10 — `spatial-photo-booth-v1`

- Category/tier/flavor: spatial / tier 2 / quirky
- Core: inside an original ID-photo booth, directly drag a fictional adult subject's bent eyebrow control points and uneven mouth corners into a natural, camera-ready pose, then press the shutter.
- Required sequence: visible preparation state; reversible finger correction with over-adjustment possible; explicit ready/shutter action; authored `3, 2, 1` countdown; brief white camera flash; developed-photo result.
- Outcomes: a fully corrected face produces a clean accepted portrait; any remaining geometric misalignment produces a clearly retained rejected portrait; timeout remains distinct. The result must follow the actual final control-point geometry rather than a hidden multiple choice.
- Safety/privacy: fictional local illustration only—never request camera permission, access or store a real face, infer biometrics, upload data, or imitate a real photo-booth brand. Judge pose geometry, not skin, age, ethnicity, attractiveness, or identity.
- Proof: finite bounded facial control geometry, explicit tolerance bands, canonical correction, near-threshold pass/fail cases, overcorrection, single shutter/finish, and deterministic reduced-motion countdown/flash.

### Q11 — `spatial-sofa-turn-v1`

- Category/tier/flavor: spatial / tier 3 / satisfying
- Core: drag and rotate a long upholstered sofa through a narrow entrance and L-shaped apartment corridor, then settle it inside the living room.
- Required causality: moving the center translates the sofa while dragging either end rotates it; the full swept sofa polygon—not a point or hidden path—collides with walls, thresholds, a vase, and a hanging light. Wall contact leaves pressure/scuff marks at the actual contact position.
- Outcomes: clean placement; recoverable wall rub; excessive scuffing; broken obstacle; sofa wedged at the corner; and timeout retaining exact position, angle, and damage. The successful terminal shows the installed sofa with movers and resident taking a brief rest.
- Required distinction: not a grid maze, parking reskin, or multiple-choice rotation question. The player must discover a real translate–pivot–stand-up sequence in continuous geometry.
- Proof: finite authored floor plans, swept-polygon collision, canonical collision-free route, near-clearance boundary cases, deterministic damage accounting, plain resume, single finish, and equivalent reduced-motion geometry.

### Q12 — `social-airplane-boarding-v1`

- Category/tier/flavor: social / tier 3 / quirky
- Core: read a fictional boarding pass, move down a narrow aircraft aisle, stow the correct carry-on in an available overhead space, address people blocking the row appropriately, yield the aisle when needed, and finally sit in the assigned row/letter seat.
- Required causality: seat side and row, bin capacity, aisle occupancy, passenger position, and the order of `荷物を上げる／声を掛ける／道を譲る／座る` actions all remain visible and determine whether the assigned seat is reachable. It must not be a four-question etiquette quiz.
- Outcomes: correctly seated with bag secured; wrong row/letter; blocked aisle from premature stowing; unsuitable request; failure to yield; oversized/full bin; and timeout retaining the actual cabin state.
- Required distinction: unlike Commuter Seat, this is a multi-action boarding sequence with a boarding pass, overhead-bin state, and row-access negotiation—not seat availability recognition.
- Proof: finite cabin layouts, unique legal action sequence or tightly bounded valid variants, exact bin/aisle/passenger state transitions, plain resume, single finish, and no real airline branding or security instructions.

### Q13 — `memory-bus-boarding-v1`

- Category/tier/flavor: memory / tier 2 / quirky
- Core: remember a mother's short route-specific advice, then board a fictional local bus using the correct front/rear door and pay at the correct boarding/alighting phase.
- Required sequence: encoding scene explicitly teaches two independent facts—`前乗り／後ろ乗り` and `先払い／後払い`; the advice disappears; the player chooses the door and payment timing through an actual bus-stop/door interaction.
- Outcomes: correct boarding and payment; correct door but wrong payment phase; wrong door; attempting to sit before required prepayment; paying too early on a post-pay route; and timeout retaining progress.
- Safety/accuracy: systems vary by operator and region, so every task is a clearly fictional route whose displayed advice is the sole authority. Do not present one convention as universal Japanese transit guidance or copy a real operator.
- Proof: finite cue sets map uniquely to all four convention combinations, delayed recall, partial-action resume, no answer leak, three-step deterministic terminal sequence, and accessible keyboard path.

### Q14 — `calculation-transfer-ticket-v1`

- Category/tier/flavor: calculation / tier 3 / satisfying
- Core: use a fictional rail map and fare table to reach a stated destination, including journeys with one transfer, then insert coins and buy the correct total-fare ticket.
- Required causality: chosen origin/destination and transfer station determine the actual route legs; each leg's fare and any explicitly stated through-fare/transfer rule determine the payable amount. The ticket machine physically retains inserted denominations, selected fare, ticket, and change.
- Outcomes: correct ticket and route; wrong destination branch; omitted transfer leg; fare shortfall; overpayment with correct change but wrong ticket selection; invalid transfer; and timeout retaining map/money state.
- Required distinction: not a standalone arithmetic multiple choice or another Change Smart game. Route reading produces the amount; the objective is the correct ticket, not minimizing returned coin count.
- Proof: finite authored networks, exhaustive simple-route enumeration, unique accepted route/fare per task, exact denomination/change accounting, plain resume, single finish, and no real railway map, logo, or live fare claim.

### Q15 — `attention-lint-shaver-v1`

- Category/tier/flavor: attention / tier 3 / satisfying
- Core: drag a lint shaver across a finite knit surface, removing pills without touching beads, embroidery, labels, or loose threads; speed and dwell time irreversibly change each crossed cell.
- Required causality: fast passes leave pills, overlong dwell thins or holes the knit, protected details retain snag marks at contact coordinates, and a visible dust cup must be emptied once before it overflows and redeposits lint.
- Outcomes: fully restored knit; retained pills; damaged decoration; local hole; cup overflow; and timeout retaining every processed cell, mark, and cup level.
- Proof: at most 12×16 quantized cells, authored solvable layouts, deterministic sampled-path integration, exact speed/dwell boundaries, reachable failures, plain resume, and identical geometry under reduced motion.
- Art brief: original rib/stockinette textures in three processing states, separated shaver/cup, protected-detail parts, damage overlays, and one folded finished-knit still; no real fashion branding.

### Q16 — `timing-mochi-pound-v1`

- Category/tier/flavor: timing / tier 3 / wild
- Core: hold to turn the mochi only while an autonomous mallet is raised, then fully withdraw through increasingly short but visible safe windows over twelve strikes.
- Required causality: safe in-bowl hold accumulates turning progress, each strike changes the mochi, insufficient or excessive turning changes the retained final texture, and a late withdrawal triggers a harmless partner safety-stop rather than injury.
- Outcomes: glossy finished mochi; safety-stop; under-turned grainy result; overstretched tear; three empty strikes and sticking; and timeout retaining strike count, shape, and smoothness.
- Proof: finite integer period tables enumerate safe hold intervals with at least three ticks of final-stage margin and prove all boundaries/failures, one finish, plain resume, and equivalent three-stage reduced-motion timing.
- Art brief: original mortar/mallet, partner and hand pose stages, six mochi material states, and a finished tray; no real organization branding and no injury depiction.

### Q17 — `prediction-domino-relay-v1`

- Category/tier/flavor: prediction / tier 3 / wild
- Core: place a limited inventory of three domino heights into empty slots, then make one irreversible push whose deterministic reach must cross steps, gaps, turntables, and light obstacles to reach a bell.
- Required causality: domino height is literal forward reach; elevation and obstacles consume reach; an authored turntable redirects propagation; failed chains stop and remain at the exact unresolved gap.
- Outcomes: bell reached; insufficient reach; wrong branch; high-piece resource exhaustion; blocked obstacle; and timeout retaining placement or exact stopped chain.
- Proof: maximum fourteen slots, heights `{2,3,5}`, finite exhaustive placement search, one or two successful allocations, exact-reach/one-short boundaries, reachable failure branches, and segment-equivalent reduced motion.
- Art brief: original wooden dominoes in three heights and three fall states, steps/gap/turntable/obstacles, tabletop guide, and endpoint bell; no copied product design.

### Q18 — `memory-recipe-order-v1`

- Category/tier/flavor: memory / tier 3 / quirky
- Core: memorize one fictional four-step recipe card, then perform the hidden order through direct pours, drags, and tool actions that irreversibly change the pan.
- Required causality: wrong order visibly creates sticking, separation, premature sealing, missing ingredients, or exhausted materials and changes which later actions remain possible; real-world cooking knowledge is never an answer source.
- Outcomes: finished fictional dish; adjacent-order failure; early lid lockout; omitted step; duplicated step; and timeout retaining the actual pan and completed-step state.
- Proof: finite approved action permutations, neutral randomized execution layout, no order leak after encoding, reachable failures, strict physical-state transition table, plain resume, and static reduced-motion material swaps.
- Art brief: original fictional street-stall pan, folding recipe card, four separated tools, all intermediate/error material states, and one plated-success still; no real recipe or shop branding.

### Q19 — `calculation-balance-scale-v1`

- Category/tier/flavor: calculation / tier 2 / satisfying
- Core: design at most three physical balance-scale weighings to identify one visually identical counterfeit coin whose weight may be either heavier or lighter, then eject exactly one numbered coin.
- Required causality: players freely load both pans before each commit; deterministic left/right/balanced results persist in a visible log and update the explicit candidate set. The scale is the only information source.
- Outcomes: exact identification; wrong genuine coin; two-or-more candidates after three weighings; information-poor or empty weighing; and timeout retaining pans, log, candidates, and remaining uses.
- Proof: finite `{8,9,12}` coin tasks with heavy/light hypotheses, exhaustive adaptive-strategy verification within three weighings, nontrivial third-weigh boundary, reachable failures, cloneable logs, and zero visual counterfeit cue.
- Art brief: original tabletop balance with three result poses, one identical coin design plus UI number overlays, log frame, eject box, and wooden bench; no real currency imagery.

### Q20 — `inhibition-quiet-tidy-v1`

- Category/tier/flavor: inhibition / tier 3 / quirky
- Core: tidy five objects before time expires, but completely stop an in-progress drag whenever a sleeping cat gives the visible stop signal.
- Required causality: object-specific drag speed and floor material produce visible noise that depletes five-stage sleep depth; scheduled ear-twitch signals require zero pointer velocity through a finite stop window while the held object may remain suspended.
- Outcomes: correctly tidied room with sleeping cat; cumulative wake; repeated stop-window violation; harmless dropped cup; wrong placement; and timeout retaining every object, held state, sleep depth, and violation.
- Proof: finite 10×14 floor tiles and integer ticks exhaustively prove a route that requires at least one true stop, excludes uninterrupted success, uses rug/noise causally, covers stop-window boundaries and all failures, and supports plain resume/single finish.
- Reduced motion/art: discrete cat/sleep/noise states and proportionally extended stop windows; original overhead room, gentle five-pose cat, object/placement states, cable hazard, meters, and tidy success still with no animal distress or real brands.

### Q21 — `language-particle-scene-v1`

- Category/tier/flavor: language / tier 3 / satisfying
- Core: drag finite particle tiles and reorder phrase blocks; every edit deterministically rebuilds an illustrated agent/object/destination scene until it matches the always-visible target within six moves.
- Outcomes/proof: exact scene match; reversed roles; wrong destination/direction; move exhaustion; incomplete sentence; timeout retaining sentence and preview. Exhaustively verify the finite grammar-to-scene mapping, 3–6 move solutions, dummy rejection, no tile-order cue, and plain resume.
- Art/reduced motion: original neutral animals and destination props in composable poses, text rendered by UI; instant/cross-faded scene swaps and accessible snap targets, never copied textbook design.

### Q22 — `language-notice-trim-v1`

- Category/tier/flavor: language / tier 3 / quirky
- Core: remove and restore word chips until a fictional one-line notice fits its physical width while retaining the task-authored place, time, audience condition, action, and requested tone; the recipient preview changes behavior immediately.
- Outcomes/proof: concise valid notice; missing place/time; lost audience condition; meaningless deletion; width overflow; authored-tone miss; timeout. Enumerate at most 4,096 subsets, guarantee one or two valid solutions and exact-fit/one-over boundaries, and never generalize real-world politeness or safety guidance.
- Art/reduced motion: original fictional storefront board and recipients, UI-rendered chips, three-state recipient poses, discrete width units; no real public, medical, or emergency signage.

### Q23 — `social-shared-umbrella-v1`

- Category/tier/flavor: social / tier 3 / satisfying
- Core: continuously position and tilt one umbrella while matching walking pace so two fictional adults share visible rain coverage through changing wind, puddles, and sheltered reset points.
- Outcomes/proof: balanced dry arrival; companion soaked; player overexposed without glorifying self-sacrifice; distance break; puddle splash; timeout retaining geometry/wetness. Finite segment and quantized coverage search proves balanced solutions and rejects either-person-only strategies.
- Art/reduced motion: original rainy arcade, umbrella angles, neutral adults and wetness stages; static rain textures and stepped travel with identical coverage geometry, no romance assumption.

### Q24 — `reaction-cupboard-catch-v1`

- Category/tier/flavor: reaction / tier 2 / wild
- Core: direct two independently occupied hand slots to catch eight visibly tipping cupboard items, then unload each to its correct safe counter zone before the next fall.
- Outcomes/proof: all stored; retained miss; wrong-zone slide; two-hand collision; overloaded hands; timeout retaining queue/hands/counter. Integer-tick exhaustive scheduling guarantees a route requiring proactive unloading, exact catch boundaries, and all failures.
- Art/reduced motion: original cupboard, four dish types in finite tip/fall/catch/place states, two hand states, cloth/counter zones; four-step falls with no injury or flying shards.

### Q25 — `spatial-suitcase-pack-v1`

- Category/tier/flavor: spatial / tier 3 / satisfying
- Core: rotate finite polyomino luggage, compress soft items once where space permits, protect fragile pieces from hard stacks, include every visible essential, and physically close the case under a height limit.
- Outcomes/proof: closed valid case; raised lid; missing essential; crushed fragile item; recoverable bad packing; timeout retaining placement/rotation/deformation. Exhaustive ≤8×10 search proves 1–3 solutions requiring rotation/compression and exact height boundaries.
- Art/reduced motion: original open/raised/closed case and branded-free travel objects in rotation/deformation states; grid snapping, static height/hatching, and no copied luggage product.

### Q26 — `calculation-gear-train-v1`

- Category/tier/flavor: calculation / tier 3 / wild
- Core: fit finite `{8,12,16,24}`-tooth gears to fixed shafts so exact meshing, parity of contacts, rational speed ratios, one compound shaft, inventory, and beam clearance produce the displayed output direction and ratio.
- Outcomes/proof: exact mechanism; reverse direction; wrong ratio; disconnected train; frame interference; inventory failure; timeout. Exhaustively assign inventory with exact rational arithmetic and guarantee direction-only and ratio-only near misses.
- Art/reduced motion: original gears/shafts/handle/output/frame and contact/gap overlays; stepped angle states and numeric arrows rather than continuous spin or real machinery instruction.

### Q27 — `language-segment-sign-v1`

- Category/tier/flavor: language / tier 3 / quirky
- Core: insert, move, or remove up to four boundaries in an unspaced hiragana notice; each segmentation immediately changes a fictional visitor's visible behavior toward the always-visible target scene.
- Outcomes/proof: target interpretation; valid alternate behavior; undefined fragments; under-segmentation; line exhaustion; timeout. Enumerate all boundaries for ≤14 characters against an on-screen finite lexicon, guarantee at least two valid readings, no spacing cue, plain resume, and no external vocabulary/safety-sign knowledge.
- Art/reduced motion: original shop/sign/visitor/car poses with UI text and static three-stage behavior; no copied real sign or emergency instruction.

### Q28 — `social-share-platter-v1`

- Category/tier/flavor: social / tier 2 / satisfying
- Core: use tongs to distribute three finite dishes among four symmetric plates according only to visible task-specific dietary/served-state cards, with every moved item retained physically.
- Outcomes/proof: valid balanced distribution; explicit-card conflict; quantity outlier; excess leftovers; timeout retaining all plates. Exhaustively enumerate allocations, require a solution that reallocates an overfilled plate without privileging the player's plate, and never score general etiquette, self-sacrifice, or medical assumptions.
- Art/reduced motion: original table, foods, four neutral adults and card UI; two-state tong transfers and static serving levels with no real restaurant imagery.

### Q29 — `reaction-switchboard-v1`

- Category/tier/flavor: reaction / tier 3 / wild
- Core: pair visible source/destination jacks using four finite two-ended cords, then reclaim completed cords before twelve scheduled fictional calls exhaust their visible wait windows.
- Outcomes/proof: all connected; dropped call; wrong pairing; unreclaimed-cord jam; busy destination; timeout retaining every plug/call. Integer-tick search proves proactive reclamation, exact wait boundaries, busy conflict, all failures, and plain resume.
- Art/reduced motion: wholly fictional twelve-jack board and cords with static lamp/count states; not a reproduction or instruction for real communications equipment.

### Q30 — `memory-room-restore-v1`

- Category/tier/flavor: memory / tier 3 / satisfying
- Core: study an eighteen-object room, then directly restore six hidden changes across position, orientation, open/closed, and on/off states without disturbing unchanged objects.
- Outcomes/proof: exact restoration; missed change; over-correction; partial state; swapped twins; timeout retaining room edits. Authored finite states ensure four change types, visible encoding, no color-only cue, reachable errors, exact diff, and plain resume.
- Art/reduced motion: original private-data-free room and object state sets; fixed encoding still and snap updates with static diff reveal.

### Q31 — `prediction-shadow-shape-v1`

- Category/tier/flavor: prediction / tier 3 / satisfying
- Core: place/rotate finite cutout parts on three supports and move an unlit source along a measured rail, then commit one light activation to reveal whether the rational projection matches an undivided target silhouette.
- Outcomes/proof: exact shadow; oversized; undersized; overlap-filled void; wrong orientation; inventory failure; timeout retaining the unlit setup. Exhaustively solve integer geometry with exact rational scale, one or two solutions, inside/outside boundaries, and one irreversible reveal.
- Art/reduced motion: original dark room, supports/light/cutouts and generated masks; two-state illumination and static mismatch hatching, no copied character silhouettes.

### Q32 — `attention-counter-dual-v1`

- Category/tier/flavor: attention / tier 3 / wild
- Core: share one hand between packing six visible weighted/fragile items and removing three independently progressing fictional steamer trays within their visible readiness bands and a customer wait window.
- Outcomes/proof: all packed/ready; crushed item; overdone tray; early tray; wait expiry; capacity miss; timeout retaining both streams. Integer-tick exhaustive scheduling requires at least two true task switches and proves either-stream-only strategies fail.
- Art/reduced motion: original unbranded counter, bag/object states, harmless fictional three-stage appliance and adult customer; discrete readiness/counts with no heat, burn, hygiene, or real cooking instruction.

### Q33 — `language-modifier-scope-v1`

- Category/tier/flavor: language / tier 3 / quirky
- Core: connect up to three modifier chips to subsets of up to three product chips; every scope-line edit immediately rebuilds a fictional workshop preview toward an always-visible target object set within six moves.
- Outcomes/proof: exact order; excess scope; missing scope; crossed attributes; move exhaustion; timeout. Enumerate ≤512 scope assignments, guarantee a 3–6 move nontrivial solution, visible finite attribute glossary, no external vocabulary, and plain resume.
- Art/reduced motion: original workshop/products with UI text and redundant endpoint borders; snapped lines and cross-faded previews, no real order form or brand.

### Q34 — `timing-tidal-path-v1`

- Category/tier/flavor: timing / tier 3 / wild
- Core: choose departure and continuously budget walking pace, fatigue, collection time, and return travel against one fully visible, asymmetric fictional shallow-water curve.
- Outcomes/proof: collected round trip; return shortfall; too-early deep path; fatigue collapse-to-stop; insufficient collection; timeout retaining position/water/fatigue/count. Integer-tick exhaustive profiles reject always-fast and always-slow strategies and prove one-tick departure boundaries.
- Art/reduced motion: wholly fictional knee-deep sand path, walker/shell/water stages and abstract graph; static stepped water/scroll, never real tide or coastal-safety guidance.

### Q35 — `inhibition-float-strike-v1`

- Category/tier/flavor: inhibition / tier 3 / satisfying
- Core: ignore three visible decoy float events and flick only during the full-submerge event, with quantized flick distance controlling a displayed safe response band.
- Outcomes/proof: three harmless catch-and-release successes; premature-response exhaustion; too-strong automatic safety retraction; repeated weak response; missed true windows; timeout. Enumerate event ticks and force at least three true inhibitions with exact timing/strength boundaries.
- Art/reduced motion: abstract fictional clear pond, painless non-hook interaction, fish/float/rod static states and automatic line recovery; no biological harm, litter, real species, venue, equipment, or fishing instruction.

### Q36 — `reaction-ink-blot-v1`

- Category/tier/flavor: reaction / tier 2 / satisfying
- Core: move a finite-capacity blotter onto predicted falling drops; reaction delay deterministically becomes retained stain radius and obscured-character count, while saturation forces a timed replacement.
- Outcomes/proof: clean readable page; accumulated unreadability; reverse transfer; missed drop during replacement; protected-field stain; timeout retaining all radii/blotter/schedule. Integer-tick search requires replacement and proves each radius boundary/failure.
- Art/reduced motion: fictional document and UI text, four stain/blotter states and replacement stack; discrete radius stages, no real form or personal data.

### Q37 — `prediction-fold-cut-v1`

- Category/tier/flavor: prediction / tier 3 / satisfying
- Core: choose up to three finite folds, then draw one abstract grid-snapped cut line and commit one unfold whose reflected copies must form an undivided target silhouette.
- Outcomes/proof: exact cutout; excess symmetry; insufficient symmetry; disconnected paper; offset cut; timeout retaining folded state. Exhaustively apply exact discrete reflection transforms, constrain to one or two ≥2-fold solutions, and prove one-cell boundaries.
- Art/reduced motion: original paper/fold/cut masks and completion still; staged static unfold with the blade abstracted away and no real cutting instruction or copied motif.

### Q38 — `spatial-flatpack-assemble-v1`

- Category/tier/flavor: spatial / tier 3 / satisfying
- Core: orient and insert six asymmetric-hole panels in an order whose fixed pieces physically block later insertion paths; removal costs time and consumes finite reusable fasteners.
- Outcomes/proof: stable shelf; wrong orientation; order dead-end; fastener exhaustion; unstable completion; timeout retaining assembly. Exhaustively search all poses/orders, guarantee recoverable-once but not twice, exact fit/tilt boundaries, and plain resume.
- Art/reduced motion: wholly fictional panels/holes/fasteners and staged shelf states; snapped insert/remove and static tilt, not a real product manual or tool procedure.

### Q39 — `memory-errand-cue-v1`

- Category/tier/flavor: memory / tier 3 / quirky
- Core: encode three condition-triggered errands, then keep a carried bag level while recognizing and acting only at matching fictional streetscape cues during short visible windows.
- Outcomes/proof: all errands/bag safe; missed cue; decoy target; false condition; dropped contents; timeout. Integer-tick route search separates cue windows, guarantees recovery time and both condition branches, and preserves plain prospective-memory state.
- Art/reduced motion: original fictional arcade/cues/bag/worker and result still; stepped travel and five tilt states, no real postal/store imagery.

### Q40 — `social-turn-taking-v1`

- Category/tier/flavor: social / tier 3 / quirky
- Core: follow an explicitly displayed fictional shared-log protocol by starting after each geometric end marker and holding only enough length to preserve space for five alternating visual bands.
- Outcomes/proof: balanced protocol log; premature overlap; excessive gap; consumed shared rows; empty bands; timeout. Exhaustive start/hold grids reject always-fast/wait/long strategies and prove one-tick boundaries, without judging real conversation style, disability, personality, or politeness.
- Art/reduced motion: original non-branded band log and neutral fictional participants; stepped lengths, static markers/hatching, and no audio dependence.

### Q41 — `calculation-soil-blend-v1`

- Category/tier/flavor: calculation / tier 2 / satisfying
- Core: scale an always-visible fictional three-component ratio to a new batch count, then irreversibly pour exact integer/rational scoop units into a measured vessel with one costly reset.
- Outcomes/proof: exact batch; wrong ratio; correct ratio but insufficient total; overflow; unit confusion; failed reset; timeout retaining layers/history. Exhaustively generate only exactly reachable mixes, require small-scoop use in harder tasks, and prove all tolerance boundaries.
- Art/reduced motion: original inert textured media, scoops/vessel/pots and UI tables; static layer updates, no fertilizer, brand, or cultivation advice.

### Q42 — `attention-scoop-track-v1`

- Category/tier/flavor: attention / tier 3 / wild
- Core: track three briefly marked but then visually identical balls among twelve deterministic crossing trajectories while controlling scoop angle/speed and finite wet-paper durability.
- Outcomes/proof: exact three collected; decoy captures; both scoops broken; too slow; multi-ball overload; timeout retaining trajectories/scoop/bowl. Integer-path search guarantees ≥4 crossings, safe collection, exact tear boundaries, and no post-mark identity cue.
- Art/reduced motion: original creature-free festival basin, identical balls, mark overlay, four scoop states and bowl; stepped identical trajectories preserving crossings.

### Q43 — `timing-model-coupling-v1`

- Category/tier/flavor: timing / tier 2 / satisfying
- Core: hold to set initial speed, release one fictional model wagon into deterministic friction, and couple three successively heavier consists only inside visible impact-speed bands.
- Outcomes/proof: three couplings; too fast; short stop with costly retry; harmless static derail; repeated mass misread; timeout retaining positions/consist. Exact rational enumeration requires three distinct hold windows, each ≥3 ticks, and proves lower/upper boundaries.
- Art/reduced motion: wholly fictional tabletop wagons/rail/markers and coupling states; stepped positions, no real railway procedure, brand, damage, or accident drama.

### Q44 — `inhibition-tofu-carry-v1`

- Category/tier/flavor: inhibition / tier 3 / satisfying
- Core: use an explicit on-screen pressure slider plus plate-angle drag to carry a fragile fictional block; visible slip warnings tempt pressure increase, but success requires maintaining pressure and leveling the plate while continuing progress.
- Outcomes/proof: intact delivery; over-pressure collapse; low-pressure wooden-plate drop; angle slide; over-cautious timeout; timeout retaining all continuous state. Quantized exhaustive control proves warning-response substitution and exact pressure/angle boundaries without unsupported touch-force APIs.
- Art/reduced motion: original safe corridor, wooden plate/block/hands and pressure/angle UI; stepped slide/deformation, no heat, blade, broken crockery, brand, or food instruction.

### Q45 — `language-connective-machine-v1`

- Category/tier/flavor: language / tier 3 / quirky
- Core: insert and rearrange finite, always-explained connective chips between event chips; a fictional tabletop automaton immediately executes the resulting sequence toward an always-visible target state within five edits.
- Outcomes/proof: exact machine state; wrong condition; reversed dependency; excessive exception; move exhaustion; timeout. Enumerate all finite-automaton chip layouts, guarantee a unique/nontrivial 3–5 move solution and termination, and use only in-task fictional connector rules—not external grammar knowledge.
- Art/reduced motion: original abstract lever/lid/ball/light machine and UI text; stepwise stills, no real product, programming notation, or brand.

### Q46 — `attention-gate-count-v1`

- Category/tier/flavor: attention / tier 3 / wild
- Core: increment and decrement an unverified counter for simultaneous bidirectional abstract arrivals, then open/close a visible rope so a fictional exhibit stays at its displayed capacity without excessive queueing.
- Outcomes/proof: exact final count and bounded queue; over-capacity; premature closure; undo exhaustion; final mismatch; timeout. Exhaustively verify authored integer events with opposite-direction simultaneity, crossings, and exact capacity boundaries.
- Art/reduced motion: wholly fictional entrance, identical abstract silhouettes, arrows/counter/rope; three-stage lanes, not real crowd-management or admission guidance.

### Q47 — `prediction-cart-tip-v1`

- Category/tier/flavor: prediction / tier 3 / satisfying
- Core: arrange four soft miniature loads across six slots on an unmanned tabletop trolley, watching exact center-of-mass markers before one committed run over three known miniature bumps whose losses alter later balance.
- Outcomes/proof: all models delivered; high center; fore/aft bias; cascading loss; omitted load; timeout. Exhaustively enumerate stacks, constrain to 1–2 solutions, expose every parameter and prove exact tilt boundaries.
- Art/reduced motion: original tabletop diorama, toy trolley and soft model loads with static tilt/fall stages; no people, real warehouse, cargo procedure, injury, or safety instruction.

### Q48 — `reaction-leak-pad-v1`

- Category/tier/flavor: reaction / tier 2 / wild
- Core: allocate four fictional robotic suction pads among forecast leaks of three visible rates; releasing a pad restarts that leak, while two finite seal tokens permanently free pads before later openings.
- Outcomes/proof: water retained; threshold loss; major leak neglected; seal waste; all pads trapped on minor leaks; timeout. Integer-tick search requires at least one deliberate pad reassignment and proves warning/rate/level boundaries.
- Art/reduced motion: creature-free fictional tank, cracks/openings, four clearly robotic pads and abstract seals; static flow/level stages, never fingers or real repair/emergency guidance.

### Q49 — `timing-firework-shutter-v1`

- Category/tier/flavor: timing / tier 3 / satisfying
- Core: anticipate several distant fictional light-bloom peaks by pressing a camera shutter before each event, compensating for a constantly displayed capture delay and differing visible rise/tail profiles.
- Outcomes/proof: all peak photos; early trail; late afterglow; wrong profile lead; missed frame; timeout retaining album/schedule. Enumerate integer press times with ≥3-tick windows, mixed lead times, and exact edge failures.
- Art/reduced motion: original distant night-light display, non-branded camera rear and staged photo frames; discrete rise/bloom/fade, no fireworks handling, pyrotechnics, or real event.

### Q50 — `inhibition-trace-guide-v1`

- Category/tier/flavor: inhibition / tier 3 / satisfying
- Core: trace a thin solid target guide while suppressing attraction to a visually dominant dashed decoy that repeatedly crosses and swaps sides; speed trades completion time against accumulated integer deviation.
- Outcomes/proof: complete bounded trace; decoy transfer; cumulative drift; incomplete slow trace; excessive lifts; timeout retaining path. Quantized exhaustive profiles reject fastest/slowest strategies, require ≥4 crossings and prove deviation thresholds.
- Art/reduced motion: original abstract craft paper, solid/dashed lines, chalk marker and hatching; stepped samples, no blade, cutting, real pattern, brand, or sewing procedure.

## Dispatched brief archive

### Q9 — `spatial-draw-bridge-v1`

- Category/tier/flavor: spatial / tier 3 / satisfying
- Core: draw a load-bearing bridge between legal anchors with a limited material budget, release it, and watch a vehicle cross under real sag and joint stress.
- Required distinction: unlike Draw Shelter, the line supports a moving load across a gap rather than deflecting a swarm.
- Proof: bounded stroke graph and supports, deterministic load steps, canonical viable span, bottom-out, snap, rollover, success, and timeout.

### Q8 — `prediction-ricochet-knockback-v1`

- Category/tier/flavor: prediction / tier 3 / wild
- Core: aim one projectile through visible wall bounces to knock targets from platforms while avoiding a protected bystander and dangerous rebound into the shooter.
- Required distinction: incidence angle, remaining energy, impact direction, and changed platform occupancy remain causal and visible; not another golf putt.
- Proof: quantized deterministic trajectories, bounded bounce count, canonical shot, near miss, collateral hit, self-hit, and success.

### Q7 — `spatial-sand-channel-v1`

- Category/tier/flavor: spatial / tier 3 / satisfying
- Core: scrape a bounded channel through sand, then release water or balls and let the drawn terrain route them to the target while drains and hazards remain separated.
- Required distinction: continuous excavation changes actual deterministic flow and erosion; no prerecorded path reveal or discrete pipe rotation.
- Proof: bounded stroke sampling, terrain mask validation, conserved material count, canonical successful channel and reachable leak/block failures.

### Q6 — `attention-goods-shelf-sort-v1`

- Category/tier/flavor: attention / tier 3 / satisfying
- Core: move visible shop goods from layered shelves into a limited staging rail; three matching products clear and reveal occluded goods behind them.
- Required distinction: shelf depth, temporary-slot congestion, and reveal order matter. It must not collapse into a flat match-three grid.
- Proof: finite authored shelves, exact triple-clear simulation, reachable recovery from near-full staging, distinct jam/success/timeout.

### Q5 — `calculation-number-tower-route-v1`

- Category/tier/flavor: calculation / tier 3 / wild
- Core: route a numbered hero through a tower, absorbing weaker encounters and applying visible `+`, `−`, and multiplier rewards so the running value can defeat the final floor.
- Required distinction: the whole room order changes later comparisons; this is not another one-step gate runner or command RPG.
- Proof: finite tower graph, exhaustive route outcomes, at least two plausible losing branches, one bounded winning route, plain-data resume.

### Q4 — `social-care-package-v1`

- Category/tier/flavor: social / tier 2 / quirky
- Core: a parent packs a limited “relief supplies” box for a 20-year-old university son living alone. Helpful, low-pressure necessities add points steadily; intrusive items impose a much larger penalty.
- Always supportive items: cup noodles, dry pasta, canned food, an Amazon gift card, new underwear, socks, rice. These ease ordinary solo living without prescribing his personality or social life.
- Always intrusive items: a swimsuit-gravure photo book and a “how to make friends” book. Their failure meaning is unwanted sexual/personal curation and implied criticism, not prudishness or inability.
- Context layer: the son's latest short message can make one or two supportive items especially timely, but never changes the allowed/forbidden classification. A finite authored proof scores every legal box composition.
- Outcome: packing helpful items raises a visible but non-gamey care score; including either intrusive item causes a large loss. After sending a bad parcel, the original messaging view shows `既読` with no reply. A genuinely helpful parcel ends with an original video-call still showing the adult son at ease with the delivered supplies.
- Visual identity: tactile cardboard box, packing paper, pantry and clothing materials, shipping label, and a restrained original chat interface. Do not copy LINE branding, logos, screen composition, or assets; the culturally recognizable `既読` behavior is enough.
- Art path: the owner may request an original Utage Sol brief for the successful video-call still. The son must read as an adult university student, not a child; the gravure-book cover remains non-explicit and abstract.
- Non-goals: moralizing quiz, “all male students are the same” stereotype, rapid good/bad tap grid, real messaging/network access, or treating a lack of reply as punishment by the son.

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
