# Game idea and dispatch queue

Status: director-owned intake ledger for `rebuild/game-modules`.

The director records and sharpens user ideas, assigns exactly one game to one available owner, reviews evidence, and integrates accepted work. The director does not implement queued game modules. A new assignment is made when an owner has completed and released a game; no owner holds two games at once. Browser work still uses only the three isolated QA lanes.

Queue order follows user intake unless a category/lane dependency makes the next item temporarily impossible. A handoff contract locks the stable ID, scope, mechanic, acceptance states, and non-goals. Owners may improve the brief but may not replace its defining interaction with a generic quiz, tap target, or progress bar.

## Active owner assignments

| ID | Owner slot | State | Defining interaction |
|---|---|---|---|
| `reaction-cupboard-catch-v1` | former Domino Relay owner | N10; screw lane | Catch eight visibly tipping fictional cupboard items using two independently occupied hand slots |
| `language-notice-trim-v1` | former Balance Scale owner | N10; audit lane | Trim a fictional notice to width while retaining only task-authored required slots and tone |
| `social-shared-umbrella-v1` | former Quiet Tidy owner | N10; flow lane | Balance two visible coverage regions through wind, puddles, and sheltered resets |
| `spatial-suitcase-pack-v1` | former Particle Scene owner | N10; pre-browser | Rotate, compress, protect, and close a finite essential-item packing grid |

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

### Q51 — `language-loom-pattern-v1`

- Category/tier/flavor: language / tier 3 / satisfying
- Core: resize and nest always-explained repeat/edge-condition enclosures around finite action chips, then commit once to a previously hidden fictional cloth pattern with only thread consumption as an incomplete checksum.
- Interdependence/proof: in-task scope rules define the predicted result, while one-shot execution is the only full scope check. Exhaustive layouts guarantee 1–2 solutions, equal-consumption wrong patterns, nesting/boundary cases, finite termination and all retained outcomes.
- Art/reduced motion: original abstract tabletop loom/chips/grid cloth; row stills, no real notation, traditional motif, or weaving instruction.

### Q52 — `memory-tally-board-v1`

- Category/tier/flavor: memory / tier 3 / wild
- Core: capture eight briefly visible fictional values using only three memo slots; merging values frees capacity but irreversibly destroys marked breakdowns required alongside the final total.
- Interdependence/proof: arithmetic strategy determines retained information while capacity forces arithmetic. Enumerate all finite slot operations, require ≥2 merges, defeat always-merge, and prove total/detail/overflow boundaries with plain resume.
- Art/reduced motion: original abstract tally counter, notched slips, three-slot board/history and fictional units; immediate slip/slot states, no real ledger or currency.

### Q53 — `attention-ring-toss-track-v1`

- Category/tier/flavor: attention / tier 3 / wild
- Core: track three briefly marked but then identical pins among eight deterministic swaps while aiming three rings at their forecast positions after a constantly displayed fixed flight delay and announced speed changes.
- Interdependence/proof: tracking supplies extrapolation identity while speed reading competes for the same visual attention. Integer trajectories require ≥5 crossings, reject current-position aiming, provide generous windows, and retain every outcome.
- Art/reduced motion: original creature-free fictional rotating stall, identical pins/rings/indicators; stepped rotation and three-stage flight, no weapon or brand.

### Q54 — `social-two-person-carry-v1`

- Category/tier/flavor: social / tier 3 / satisfying
- Core: coordinate two neutral stagehands moving a lightweight fictional scenery prop; a visible task-specific response delay makes abrupt motion raise an abstract synchronization-load meter, while explicit signals reduce the next delay at a time cost.
- Interdependence/proof: forecast errors increase synchronization load, which further increases delay; signalling jointly changes both. Exhaustive finite paths require signals at corners, reject always-fast/always-signal strategies and prove tilt/contact boundaries.
- Art/reduced motion: original stage corridor, foam prop, neutral adults and task meters; stepped poses, no health/ability judgment, relationship norm, or real lifting procedure.

### Q55 — `inhibition-token-swap-v1`

- Category/tier/flavor: inhibition / tier 3 / quirky
- Core: encode four shaped token-to-socket mappings for a fictional machine; after two correct insertions an always-visible notice swaps only two mappings, requiring selective suppression of learned responses while two remain unchanged.
- Interdependence/proof: learned mapping strength creates the response that must be selectively inhibited, and wrong old-map insertions consume later time. Enumerate operations, reject global reversal/brute force, prove all error/time boundaries and plain resume.
- Art/reduced motion: original abstract machine, four non-security tokens/sockets, mapping card and swap notice; snapped static insertion, no key, lock, door, warehouse, or bypass instruction.

### Q56 — `spatial-parcel-shelf-v1`

- Category/tier/flavor: spatial / tier 3 / wild
- Core: place ten arriving abstract tokens of 1–3 cell shapes into a 3×4 fictional custody board under visible dwell windows; fragmented placement increases search/rearrangement time and marked tokens must remain retrievable later.
- Interdependence/proof: spatial history changes later response budget while urgency tempts fragmentation. Exhaustive tick/placement search defeats nearest-slot greed, proves retrievability and exact dwell/capacity boundaries, and retains board/counter state.
- Art/reduced motion: original unmanned token counter/board and abstract shapes; snapped updates, not a parcel, warehouse, courier, or logistics procedure.

### Q57 — `calculation-mosaic-order-v1`

- Category/tier/flavor: calculation / tier 3 / satisfying
- Core: commit an abstract piece count for a finite notched mosaic grid before placing/rotating 2×1 pieces and making at most three grid splits whose reusable remnants determine the true minimum.
- Interdependence/proof: quantity fixes spatial feasibility while exact spatial split plan defines quantity. Exhaustive finite tilings require the split cap, defeat area-only estimates, and prove shortage/excess/dead-end boundaries.
- Art/reduced motion: original abstract mosaic board/pieces/order dial; snapped states, not flooring, construction, tools, real material, or installation instruction.

### Q58 — `prediction-marble-gate-v1`

- Category/tier/flavor: prediction / tier 3 / wild
- Core: read deterministic visible peg routes and begin one slow gate switch early enough for three target marbles while suppressing switches for visibly distinct decoys arriving just before them.
- Interdependence/proof: decoy response consumes the only correct-switch window, while inhibition alone cannot choose route. Enumerate integer paths/actions, guarantee ≥3-tick windows, no randomness, and all timing/direction failures.
- Art/reduced motion: original tabletop marble board and staged gate/balls; no gambling, score, payout, real gaming-machine motif, or brand.

### Q59 — `reaction-order-return-v1`

- Category/tier/flavor: reaction / tier 3 / wild
- Core: monitor three identical abstract request terminals whose visual bands complete at differing deterministic times, then return tokens only in the task-defined FIFO completion order while new requests continue.
- Interdependence/proof: faster servicing shortens remembered queue; sequence errors consume time and lengthen it. Exhaustive ticks require queue depth three, unique completion times, and prove wrong-order/overflow/empty-return boundaries.
- Art/reduced motion: original unmanned signal console, identical terminals/bands/tokens; stepped completion, no people, reception, service priority, or real social norm.

### Q60 — `timing-sprinkler-route-v1`

- Category/tier/flavor: timing / tier 3 / satisfying
- Core: route three fictional plant tokens across a visible grid while one slider inversely couples a deterministic sweep sector’s rotation frequency and angular width, changing both when and where paths are open.
- Interdependence/proof: route length sets needed window, which sets slider state, which reshapes route. Exhaustive discrete valves/paths require a change, reject both extremes, and prove exact window/placement boundaries.
- Art/reduced motion: wholly fictional greenhouse board, tokens, sweep/dry textures and UI; stepped angles, no real irrigation, equipment operation, cultivation, chemical, or safety guidance.

### Q61 — `memory-vending-rule-v1`

- Category/tier/flavor: memory / tier 3 / quirky
- Core: encode three finite shape-exchange rules, then feed irreversible token multisets into an opaque fictional machine toward a visible target; one optional test reveals output but consumes scarce resources.
- Interdependence/proof: memory is the sole prediction source while irreversible prediction tests are the sole memory check. Enumerate finite exchanges, guarantee success with/without costly test, order-dependent dead ends and all retained outcomes.
- Art/reduced motion: original abstract exchange box/shapes/rule cards/trays; three static stages, no vending, currency, gambling, or real machine.

### Q62 — `inhibition-companion-route-v1`

- Category/tier/flavor: inhibition / tier 3 / satisfying
- Core: draw a guide route around abstract display zones while two fictional light-sprite companions follow within a distance bound; shortest-path attraction risks contact, but excessive detours make sprites approach displays unless the guide pauses.
- Interdependence/proof: successful detour raises companion-management demand, while direct grouping violates avoidance. Exhaustive quantized routes require ≥2 waits, defeat shortest/max-detour strategies and prove distance/contact boundaries.
- Art/reduced motion: original abstract gallery, display shapes, guide marker and two nonhuman light sprites; stepped movement, no plants, visitors, attention/ability judgment, etiquette, or real venue procedure.

### Q63 — `language-reference-narrow-v1`

- Category/tier/flavor: language / tier 3 / satisfying
- Core: add up to four always-explained attribute chips to narrow highlighted matches in a 48-cell abstract shelf, trading fixed phrasing time against per-candidate inspection time for three targets.
- Interdependence/proof: precision reduces search while costing the same time resource; exhaustive chip strategies make both always-maximal and never-filter approaches fail, prove changing break-even points and candidate boundaries.
- Art/reduced motion: original abstract shelf/pieces/chips/target frames; static hatching and stepped inspection, no external vocabulary, product, or real classification.

### Q64 — `spatial-blackout-route-v1`

- Category/tier/flavor: spatial / tier 3 / wild
- Core: encode obstacles on a 10×14 abstract board before signal blackout, then route a visible token while deterministic accumulated position drift requires exactly one planned touch of a clearly marked safe calibration rail to reset.
- Interdependence/proof: remembered geometry loses alignment with drift, while calibration consumes route/time budget. Exhaustive paths make zero calibration exceed drift, two exceed contact/time, and treat every obstacle contact as error with exact boundaries and no hidden randomness.
- Art/reduced motion: original abstract signal board/obstacles/token/calibration rail; stepped grid motion, no facility, darkness, evacuation, accessibility, or real-world guidance.

### Q65 — `social-shared-grid-v1`

- Category/tier/flavor: social / tier 3 / satisfying
- Core: schedule one player-controlled fictional arm’s four token operations on a 6×4 board around a second autonomous arm’s always-visible timed region plan; blocking rewrites that arm’s later plan into larger alternatives.
- Interdependence/proof: forecast constrains placement, while placement changes the forecast source and can amplify conflict. Exhaustive schedules reject always-self/always-other policies and prove wait/rewrite/deadlock boundaries.
- Art/reduced motion: original shared board, two abstract arms/tokens/schedule UI; snapped states, no people, yielding virtue, workplace division, skill judgment, or real cooperation norm.

### Q66 — `timing-water-clock-v1`

- Category/tier/flavor: timing / tier 3 / satisfying
- Core: open/close three visible unitless-flow channels with differing visible actuation delays so irreversible integer accumulation lands in a target band at an exact target tick.
- Interdependence/proof: calculated timing changes the next calculation’s initial quantity; exhaustive operation sequences require ≥2 channels, reject delay-free arithmetic, and prove both band edges and over-operation outcomes.
- Art/reduced motion: original abstract tabletop channels/reservoir/markers; tickwise levels, no real clock, plumbing, measurement device, or operating guidance.

### Q67 — `attention-still-water-pick-v1`

- Category/tier/flavor: attention / tier 3 / wild
- Core: identify five subdued pieces among twenty by a continuously visible two-feature shape rule while suppressing visually dominant, always-wrong double-outline pieces whose touch deterministically permutes the whole board.
- Interdependence/proof: inhibition failure destroys search progress, increasing urgency and later inhibition demand. Exhaustive finite layouts guarantee no-touch success, reachable distinct errors, deterministic complete permutations and contact boundaries.
- Art/reduced motion: original creature-free shallow abstract basin, shape pieces/sample/bowl; two-frame rearrangement, no real collection, sorting, mineral, or game-of-chance motif.

### Q68 — `reaction-capacity-gate-v1`

- Category/tier/flavor: reaction / tier 3 / wild
- Core: accept or pass twelve arriving integer tokens within visible windows so irreversible capacity ends in a target band; current token, next three, and suffix total are always visible.
- Interdependence/proof: deliberation can forfeit the choice, while each quick choice reduces later combinatorial freedom. Exhaustive 2^12 outcomes constrain to ≤2 solutions and prove an observation-equivalent policy: every hidden suffix sharing visible history/next-three/total has the same correct current decision.
- Art/reduced motion: original abstract terminal/tokens/capacity/waiting row; discrete updates, no currency, trade, gambling, or real allocation system.

### Q69 — `prediction-calibration-launch-v1`

- Category/tier/flavor: prediction / tier 3 / satisfying
- Core: use exactly the first two of five abstract launches at distinct integer settings to identify one run-fixed hidden linear slope/intercept from retained landing pairs, then hit three narrow target bands with the remaining launches.
- Interdependence/proof: launches are the only parameter observations and finite achievement opportunities; the first two landing tokens remain and must be chosen not to block later target bands. Exhaustive candidate relations prove no <2-observation guaranteed hit, exact identification after two, safe and blocking calibration pairs, and unique three-target completion.
- Art/reduced motion: original non-weapon tabletop launcher/scale/targets/history; three-stage stills, no real experiment, measurement procedure, or device.

### Q70 — `calculation-approach-dial-v1`

- Category/tier/flavor: calculation / tier 3 / satisfying
- Core: reach three exact increasing targets using finite stocks of three positive integer steps with differing visible lockout delays; overshooting irreversibly resets that stage and costs time.
- Interdependence/proof: residual arithmetic defines when to inhibit the tempting fast large step, while failure invalidates that residual. Exhaustive sequences require step switching, reject always-large/small, and prove inventory/reachability boundaries.
- Art/reduced motion: original abstract numeric panel/buttons/stocks; discrete values and lockout states, no currency, score, gambling, or real instrument.

### Q71 — `memory-blueprint-switch-v1`

- Category/tier/flavor: memory / tier 3 / satisfying
- Core: switch at a fixed time cost between mutually exclusive abstract reference and assembly views, choosing how many of twelve shape/position/orientation instructions to retain per trip; correctness appears only on returning to reference.
- Interdependence/proof: larger memory batches reduce switches but create costly corrections that require more switches. Exhaustive strategies place optimum batch at 2–4 and reject one-at-a-time/all-at-once with confusion/orientation boundaries.
- Art/reduced motion: original abstract board/pieces/reference list; instant view swap and snapped pieces, no real blueprint, drafting notation, product, or assembly procedure.

### Q72 — `inhibition-release-lag-v1`

- Category/tier/flavor: inhibition / tier 3 / satisfying
- Core: hold one abstract lever to increase an integer value and release before a truthful target indicator, compensating for an always-visible release-lag table whose lag grows with release value across three targets.
- Interdependence/proof: calculation defines how long the salient but truthful indicator response must be inhibited; late response increases lag and overshoot. Enumerate release ticks with ≥3-tick bands, distinct leads and exact edges.
- Art/reduced motion: original abstract lever/value/band/table; tick states, no industrial/measurement equipment or operation instruction.

### Q73 — `attention-window-schedule-v1`

- Category/tier/flavor: attention / tier 3 / wild
- Core: schedule one viewpoint among nine abstract windows whose full opening timetable is always visible; movement and marking cost time, concurrent openings force choices, and discovered symbols persist while three sample matches must be marked.
- Interdependence/proof: current observation choice changes later reachable opportunities, while accumulated records narrow future needs. Exhaustive schedules prohibit observing all nine, require ≥3 conflicts and prove exact move-window boundaries.
- Art/reduced motion: original abstract nine-window panel/symbols/timetable/marker; instant windows and two-state travel, no surveillance, real timetable, or public display.

### Q74 — `spatial-clearance-run-v1`

- Category/tier/flavor: spatial / tier 3 / satisfying
- Core: move six abstract tokens across three scheduled clearance sections in 2–3 trips; vertical versus horizontal loading changes carrier height/width, and rest areas alone permit costly reshaping.
- Interdependence/proof: load shape changes passage windows while smaller loads increase trips; exhaustive plans require ≥1 reshape, defeat max-load/single-token strategies and prove clearance/timing edges.
- Art/reduced motion: original abstract route/carrier/tokens/clearance schedule; stepped movement and two-state reshape, no warehouse, railway, equipment, or loading procedure.

### Q75 — `language-assembly-order-v1`

- Category/tier/flavor: language / tier 3 / satisfying
- Core: reorder five in-task instruction rows and place always-explained immediate/wait connector chips before one commit; the abstract assembler executes literally, while inserted parts and arm retreat time can block later paths.
- Interdependence/proof: physical feasibility constrains expressible row order and the written sequence creates that physical order. Exhaustively search 5! arrangements/connectors, require a wait, and prove one-swap/dead-end boundaries.
- Art/reduced motion: original abstract board/arm/parts/instruction chips; row stills, no real machine, drawing notation, manual, or assembly process.

### Q76 — `calculation-supply-cycles-v1`

- Category/tier/flavor: calculation / tier 3 / satisfying
- Core: distribute finite integer supply among three abstract units across four fully previewed cycles; each shortage deterministically increases that unit’s next-cycle requirement while excess is discarded.
- Interdependence/proof: allocation writes the next arithmetic inputs, which constrain later allocation. Exhaustive schedules require non-greedy choices in ≥2 cycles and defeat concentrated/equal/deferred strategies with exact shortage edges.
- Art/reduced motion: original abstract three-unit supply panel/tables; discrete fills, no people, fairness, aid, medicine, utilities, or real allocation norm.

### Q77 — `prediction-catch-frame-v1`

- Category/tier/flavor: prediction / tier 3 / wild
- Core: place finite frame elements on a deterministic vertical grid before five scheduled abstract drops; every installed catcher also becomes an obstacle that changes all later routes.
- Interdependence/proof: construction creates the future system being predicted. Exhaustive placement histories catch all five but require ≥1 deliberately minimal current catcher preserving later routes, defeating greedy maximal frames without ever skipping a required catch.
- Art/reduced motion: original deterministic vertical board/pegs/frame pieces/tokens; peg-step stills, no gambling, score, payout, or real apparatus.

### Q78 — `reaction-arm-cross-v1`

- Category/tier/flavor: reaction / tier 3 / wild
- Core: choose between two independently dragged abstract arms for twelve brief requests; arms cannot pass through each other, and crossing narrows future reachable regions until a costly coordinated reset.
- Interdependence/proof: locally fastest responses can irreversibly reduce later response capacity. Exhaustive schedules require slower-side choices and temporary managed crossing, defeating always-fast/never-cross policies and proving reach/window/deadlock edges.
- Art/reduced motion: original abstract two-arm grid/reach outlines/requests; snapped positions, no real robot or equipment procedure.

### Q79 — `timing-interval-stamp-v1`

- Category/tier/flavor: timing / tier 3 / satisfying
- Core: encode three distinct visual interval lengths, then stamp each from the prior mark; each interval’s signed error deterministically changes the next cursor speed (overshoot faster, undershoot slower), with current speed always visible.
- Interdependence/proof: remembered next length must be translated into timing under a speed generated by prior accuracy. Enumerate integer stamps/speeds, guarantee ≥3-tick bands, changing speeds and exact interval/error boundaries without claiming mere origin shift propagates interval error.
- Art/reduced motion: original abstract strip/cursor/stamps/encoded spans; tickwise cursor, no real measuring, drafting or marking process.

### Q80 — `calculation-region-sum-v1`

- Category/tier/flavor: calculation / tier 3 / satisfying
- Core: locate one unique connected 3–5-cell target sum on a 6×8 board whose values initially show only truthful interval classes; a movable exact-read frame costs time proportional to area and permanently reveals cells.
- Interdependence/proof: interval arithmetic chooses high-information reads, which tighten overlapping candidate intervals. Exhaustive connected regions require ≥5 coarse candidates, prohibit reading all, and prove a bounded unique-information plan and selection edges.
- Art/reduced motion: original abstract density-pattern grid/read frame/region outline; snapped reveals, no currency, score, gambling, or real measurement system.

### Q81 — `social-signal-relay-v1`

- Category/tier/flavor: social / tier 3 / satisfying
- Core: predict a deterministic limited-view partner unit and spend only three direction overrides among five obstacles; every message changes its later position and therefore the future being predicted.
- Proof/outcomes: exhaustive finite send plans include ≥2 self-solvable and ≥2 intervention-required obstacles; always-send and never-send both fail, with exact late/invalid/waste/dead-end edges and retained timeout.
- Art/reduced motion: original abstract grid/unit/vision outline/rule card; discrete steps, no people, etiquette, or hidden partner information.

### Q82 — `language-conditional-cue-v1`

- Category/tier/flavor: language / tier 3 / quirky
- Core: build three in-task commands for a fully visible cycling mechanism, trading quick unconditional execution against slower conditional forms for short versus sustained state windows.
- Proof/outcomes: exhaustive integer-tick command plans require both forms and both task-explained condition chips; all-conditional times out and all-unconditional misses overlapping windows, with empty/waiting/order/timeout states retained.
- Art/reduced motion: original abstract state board and annotated chips; instant state swaps and static wait marks, no external grammar authority or real mechanism.

### Q83 — `attention-fragment-match-v1`

- Category/tier/flavor: attention / tier 3 / wild
- Core: search twelve irregular fragments by visible edge features, but rotation and joining change the current outer contour and thus the candidate set for every later search.
- Proof/outcomes: enumerate finite four-rotation join histories; require deceptive visual candidates, one-rotation boundaries, solvable simplifying order and recoverable costly/complex dead ends without target split-line leakage.
- Art/reduced motion: original abstract fragments/contours/target silhouette; snapped rotations and two-state joins, shape and hatching rather than color alone.

### Q84 — `inhibition-habit-gauge-v1`

- Category/tier/flavor: inhibition / tier 3 / wild
- Core: repeated responses to one of three abstract sockets build a visible deterministic speed gauge, while that same gauge increases the explicitly previewed initial pull toward the practiced direction after a switch.
- Proof/outcomes: exhaustive integer schedules require ≥3 gauge levels but defeat always-max and never-build policies; exact counter-input boundaries produce success, pull error, reset loop, overcorrection, slow timeout.
- Art/reduced motion: original abstract arm/sockets/gauge/prediction arrows; discrete velocity and fixed initial offsets, no real device operation.

### Q85 — `timing-completion-order-v1`

- Category/tier/flavor: timing / tier 3 / satisfying
- Core: route one capacity-three collector among five abstract progress sources with fixed visible rates; each collection changes position and every third forces a visible depot trip, altering which later completions remain reachable.
- Proof/outcomes: exhaustive integer routes prove all eight impossible but ≥6 achievable, ≥3 mutually exclusive completion pairs, greedy failure, and exact travel-time edges; full/late/depot/wait/timeout states retain progress and position.
- Art/reduced motion: original abstract reservoirs/tokens/collector/depot; stepped progress/travel, no industrial process, real procedure, payout, or gambling.

### Q86 — `spatial-field-drift-v1`

- Category/tier/flavor: spatial / tier 3 / wild
- Core: guide a token through three fully visible abstract vector bands and two gates; stronger counter-drag adds visible deterministic inertia that can push the token into a stronger region and amplify later drift.
- Proof/outcomes: exhaustive quantized controls require at least two weak-drag waits while defeating always-maximum and always-minimum policies; exact inertia boundaries cover overshoot, accumulated drift, timeout and oscillation.
- Art/reduced motion: original abstract field bands/gates/token with static density arrows and numeric drift/inertia; discrete coarse drag updates and no real navigation instruction.

### Q87 — `memory-freshness-watch-v1`

- Category/tier/flavor: memory / tier 3 / satisfying
- Core: encode all six initial integer values together for six seconds, then allocate a one-item magnifier while their always-visible fixed rates continue; use remembered or reobserved values to set three target-time controls.
- Proof/outcomes: exhaustive observation orders make observing all impossible and require ≥1 rate-based memory update; one-order-step boundaries cover stale, overcorrected, never-seen, overobserve and retained timeout states. No initial parameter is hidden.
- Art/reduced motion: original abstract six-channel board/magnifier/control sliders; stepped values, visible rates and observation-age counters, no real monitoring process.

### Q88 — `prediction-counter-table-v1`

- Category/tier/flavor: prediction / tier 3 / wild
- Core: choose five finite moves on an abstract board where a fully visible deterministic response table maps each prior player move and current position to the opposing unit’s next move, creating the three-step future being predicted.
- Proof/outcomes: exhaustive histories allow only 1–2 target routes and defeat greedy one/two-step reading; exact overrun, induced dead end, hand-limit and retained timeout states, with no cycles or target-path leak.
- Art/reduced motion: original abstract pieces/board/response table; immediate player move and two response stills, no competition or gambling framing.

### Q89 — `reaction-verify-gate-v1`

- Category/tier/flavor: reaction / tier 3 / satisfying
- Core: route ten scheduled two-attribute tokens; visible shape narrows the second attribute to two task-stated possibilities, and inspection costs time. Some pairs provably share one route and need no inspection, while differing-route pairs must be inspected—never guessed.
- Proof/outcomes: exhaustive integer schedules defeat inspect-all and skip-all, prove shared-route/different-route cases and exact window/jam boundaries; wrong routes jam the abstract gate and causally shorten later windows.
- Art/reduced motion: original tokens/inspection frame/abstract gate; immediate arrivals and two-state inspection, no gambling, hidden-random decision, or real screening process.

### Q90 — `social-role-recall-v1`

- Category/tier/flavor: social / tier 3 / satisfying
- Core: encode a six-second task-authored schedule for two autonomous abstract units, then place four pieces on their shared board; a collision deterministically changes one role and re-displays only that updated entry.
- Proof/outcomes: exhaustive placement histories prove a zero-collision route, recoverability after one but not three collisions, and exact old/new-memory conflicts; success, overyield, repeated conflict, alternate conflict and timeout retain occupancy/history.
- Art/reduced motion: original abstract shared grid/units/schedule card; discrete steps and static update markers, no people, virtues, etiquette or collaboration norm beyond the shown table.

### Q91 — `spatial-one-way-bridge-v1`

- Category/tier/flavor: spatial / tier 3 / wild
- Core: allocate finite links among marked abstract islands and visit all collection nodes before returning; each link deterministically deactivates after one crossing, so placement and traversal order jointly determine future reachability.
- Proof/outcomes: exhaustive finite build/move histories allow 1–2 routes, defeat greedy shortest links and prove exact supply/isolation/double-link edges with immediately visible dead ends and retained timeout.
- Art/reduced motion: original abstract nodes/link sockets/active-spent links; discrete moves and two-state deactivation, no collapsing structure, debris, person, or real route instruction.

### Q92 — `calculation-drift-sum-v1`

- Category/tier/flavor: calculation / tier 3 / satisfying
- Core: select one connected four-cell region on a twelve-cell board whose fully visible integer values and fixed signed rates sum to the target at a stated future commit tick; selection and changes themselves consume known time.
- Proof/outcomes: enumerate all ticks/regions to guarantee one future solution plus a deceptive current-time solution, exact commit-start and ±1-tick boundaries; wrong-now, late, indecision, disconnected and timeout states retain selection.
- Art/reduced motion: original abstract signed-value grid/selection outline/commit timer; stepped updates, no money, score, real forecasting, or hidden parameter.

### Q93 — `language-lexicon-recall-v1`

- Category/tier/flavor: language / tier 3 / satisfying
- Core: encode a six-symbol fictional lexicon simultaneously, then compose commands using always-visible task grammar; an incorrect send reveals that symbol’s true action but irreversibly changes the finite board.
- Proof/outcomes: exhaustive automaton histories guarantee an error-free route, recovery from any one symbol error but not two, and exact lexicon/word-order/error/hand-limit/timeout states without external language knowledge.
- Art/reduced motion: original abstract device/symbol chips/encoding card; sequential action stills and eight-second reduced encoding, no real control language.

### Q94 — `social-turn-handover-v1`

- Category/tier/flavor: social / tier 3 / satisfying
- Core: schedule two alternating abstract units with different task-authored processing rates; longer turns save fixed handover cost but consume the other unit’s visible deadline margin.
- Proof/outcomes: exhaustive integer schedules prove a successful 2–4-action cadence while zero handovers and every-task handovers fail; exact deadline/handover/slow assignment/idle/timeout states retain positions.
- Art/reduced motion: original abstract shared board/units/task tiles; discrete action and static handover states, no people, workplace norm, virtue, or authority beyond shown values.

### Q95 — `prediction-preset-queue-v1`

- Category/tier/flavor: prediction / tier 3 / wild
- Core: precommit exactly three timed actions before an abstract device runs; each deterministic action changes the state and duration conditions under which every later reservation executes.
- Proof/outcomes: enumerate all finite reservation triples to allow only 1–2 successes, defeat one-step plans, enforce minimum action spacing and finite termination; empty, chained-state, overlap, impossible-third and timeout states retain the queue.
- Art/reduced motion: original abstract state device/three-slot timeline/transition table; sequential stills and one commit, no real scheduling procedure.

### Q96 — `timing-phase-align-v1`

- Category/tier/flavor: timing / tier 3 / satisfying
- Core: trigger four transfers where two fully visible integer-period discs align, using at most three one-tick delays that each alter every subsequent phase and alignment opportunity.
- Proof/outcomes: exhaustive delay placements yield only 1–2 valid plans, prove zero-delay maximum three and front-loaded failure, with ≥3-tick windows and retained phase/transfer/timeout states.
- Art/reduced motion: original abstract two-disc transfer board; discrete angles and static alignment highlight, no real rotating equipment.

### Q98 — `reaction-shared-head-v1`

- Category/tier/flavor: reaction / tier 3 / wild
- Core: react to twelve deterministic arrivals across two visible channels using one switchable processing head; fixed switch dead time couples dense short windows to sparse long windows that later expire together.
- Proof/outcomes: exhaustive integer switch histories require a bounded cadence and defeat never-switch/max-switch policies; exact switch-cost edges cover neglected channel, switch-loss, dense-return, sparse-late and retained timeout.
- Art/reduced motion: original abstract dual-channel gate/head/tokens; immediate arrivals and static switch state, no real processing device.

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
