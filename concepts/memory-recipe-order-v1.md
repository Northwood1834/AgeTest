# memory-recipe-order-v1 — Original Game Concept

Status: original N09 implementation target from queue Q18.

## Identity

- Stable ID: `memory-recipe-order-v1`
- Introduced: `2.0`
- Category: `memory`
- Family / step: `memory-recipe-order` / `1`
- Tier / flavor: `3` / `quirky`

## Player promise

A fictional night-stall card shows one four-action order. After the card folds completely away, carry the four neutral tools to a visible pan in the remembered order. Every use is irreversible: liquid and powder leave their containers, the spiral paddle folds the material, and the moon lid physically closes the pan. The authored card—not real culinary knowledge—is the only authority.

The activity is fantasy material assembly, not a recipe or cooking lesson. It gives no heat, temperature, knife, food-safety, injury, or real-world preparation guidance and uses no real dish, ingredient, restaurant, or brand.

## Four fictional actions

The exact action inventory is fixed:

1. `dew` — `しずく玉を注ぐ` (`pour`)
2. `dust` — `きら粉を振る` (`shake`)
3. `fold` — `うずべらを一周` (`tool`)
4. `lid` — `月ぶたを閉じる` (`cover`)

All six permutations of `dew / dust / fold` followed by `lid` are approved card orders. Generation selects one approved order, then makes exactly one independent shuffle call for all four tools. A finite structural filter maps that shuffled candidate to a cue-free layout: it may not equal any cyclic rotation of the order, any cyclic rotation of its reverse, preserve more than one directed adjacent order pair when the last/first wrap pair is included, or place all four remembered transitions on the horizontal/vertical perimeter of the 2×2 grid. Every four-node grid cycle has at least two adjacent transitions, so the accepted grid count is exactly two rather than four. Each approved order has 8 of the 24 layouts available under this stricter rule. Thus neither a starting point, one reversal, nor tracing the tool-card perimeter reconstructs the card, and remembering a spatial cycle cannot replace four-item order memory. Tool positions, size, material, color hierarchy, labels, focus treatment, and hit areas are otherwise neutral with respect to the selected order.

## Encoding and hidden execution

- For exactly 6000 ms, one card presents all four actions as a numbered vertical order.
- The final 400 ms contains two finite tracked fold poses; the order remains readable until folding begins.
- At 6000 ms, the card contents are removed, the card is hidden, and no order text, numbering, silhouette, ghost, ARIA description, reflection, or layout relation remains.
- Only then do the four shuffled tool controls and explicit `できあがり` finish control appear.
- The 14000 ms execution deadline starts only after the card is fully hidden.
- Reduced motion uses the same information and exact phase boundaries. It still performs nonzero lifecycle-owned fold and material-swap stages, but uses no continuous animation.

## Direct interaction

Each tool is a native focusable button with an original CSS-drawn bottle, shaker, spiral paddle, or lid. Pointer/touch operation drags a tool onto the pan. Keyboard Enter/Space applies the focused tool directly, and arrow keys navigate the neutral 2×2 tool layout. A tool mutation locks all input for a short nonzero tracked material swap.

The pan always reflects the actual applied actions. A retained action rail records only what the player physically did; it never marks correctness or reveals the expected next action. Used tools remain activatable so the duplicate-material failure is genuinely reachable. `できあがり` is an explicit physical decision rather than an automatic list submission.

## Total deterministic transition table

For each of the six approved orders, each correct-prefix length `0..3`, and each of the four actions, the generated proof contains one transition: `6 × 4 × 4 = 96` total action rows. For each order and prefix length it also contains one explicit-finish row: `6 × 4 = 24` rows. A separate exhaustive `6 × 24 = 144` layout audit records cyclic, reverse-cycle, directed array adjacency including wrap, 2×2 geometric adjacency including wrap, and acceptance for every approved order/layout pair; each order must expose exactly 8 cue-free layouts.

Given stable state plus one action:

1. Append the attempted action to retained `history`.
2. If its one-use material/tool was already spent, no second physical action completes; terminate `duplicate` with the empty vessel/dry scrape retained.
3. Otherwise spend it and append it to retained `completed`.
4. If it is `lid` before the expected fourth step, physically seal the pan and terminate `lid-lock`; remaining tools cannot enter.
5. If it is the expected next action, advance `correctPrefix`; the fourth expected action closes the lid and terminates `success`.
6. Any other unused action terminates `adjacent-error`. A misplaced spiral fold visibly sticks the material; the other wrong ordering visibly separates its layers.

The table is total for every reachable active prefix/action pair. There is no hidden correction, random physics, or post-failure continuation.

Explicit finish before all four expected actions terminates `omission` and retains the exact pan and completed actions. Timeout retains the same actual state and adds only a timeout seal. A terminal transition locks every control and finishes once after its finite material response.

## Outcomes

- `success`: all four actions match the hidden card; the closed pan opens into an original pearlescent stall cake still.
- `adjacent-error / stuck`: the wrong early spiral fold retains a tacky spiral mass.
- `adjacent-error / separated`: another unused out-of-order action retains clearly separated fictional layers.
- `lid-lock`: an early moon lid visibly covers the pan and physically blocks every remaining tool.
- `omission`: explicit finish retains the incomplete pan and exact missing-action count without identifying the hidden next action.
- `duplicate`: the second use retains the first completed action plus an empty dispenser/dry scrape state.
- `timeout`: the actual pan, action rail, spent tools, closed/open lid, and completed actions remain unchanged.

No result substitutes a generic reordered list. Wrong, omission, duplicate, lid lock, success, and timeout have distinct pan material states and status hierarchy.

## Plain task and resume

The generated task is structured-cloneable plain data containing:

- exact action descriptors;
- one approved hidden `order`;
- one independent four-action `layout` permutation;
- `encodingMs: 6000`, `duration: 14000`;
- the complete 96-row action, 24-row finish, and 144-row structural layout proof; and
- a stable `resume` snapshot.

A snapshot retains `phase`, `history`, `completed`, `used`, `correctPrefix`, `panState`, `lidClosed`, `result`, and `remainingMs`. Validation replays history from empty state, applies explicit finish/timeout terminals when present, and rejects impossible prefixes, changed pan state, post-terminal actions, duplicate fields, altered proof, or order/layout cues. A resumed active state continues from its exact physical pan; a resumed terminal state renders without committing again.

## Visual direction

An original dusk-blue street-stall worktop surrounds a deep indigo pan with brass rim and side handles. Fictional materials use pearlescent teal drops, violet-gold dust, a tactile spiral fold, separated bands, a sticky web, an empty-vessel mark, a fitted moon lid, and one plated success still. Four tool cards have equal ivory/brass materials and equally sized targets. No emoji, external image, copied shop design, live canvas dependency, real ingredient likeness, or generic quiz/reorder-list skin is used.

Normal and reduced modes preserve identical pan geometry and information. CSS material swaps are finite, tracked, and resolution-independent. The board fits 390–430 CSS px at DPR 3 without horizontal overflow.

## Accessibility and lifecycle

- All nodes come from `context.host.ownerDocument`.
- Pointer drag and keyboard activation share the exact transition function.
- Arrow navigation follows the visible 2×2 layout, with a gold dashed focus ring distinct from success/failure.
- Live text describes only the actual pan, action, and terminal state; it never states the expected next action.
- Encoding, fold poses, material swaps, feedback, deadline, listeners, and abort are context-owned.
- Abort removes QA and leaves no timer, frame, drag capture, or listener alive.
- No raw browser lifetime primitive, continuous RAF, network, storage, audio, external asset, unsafe cooking instruction, or real recipe exists.

## Evidence gate

Focused Node tests cover both random-call order and hostile helpers; all six approved orders; all 96 action, 24 finish, and 144 structural layout proof rows; all 144 order/layout combinations independently checked for cycle/reverse/adjacency leakage; exact 6000/14000 timing; full concealment and neutral layout; every success/failure/timeout; retained causality; real drag, keyboard 2×2 focus, action locks, last-moment deadline, plain active/terminal resume, single finish, reduced nonzero folds/swaps, disposal, and forbidden APIs.

After explicit Flow handoff, original-game full-resolution evidence covers representative frozen orders/layouts at 393×852 and 402×874 DPR 3, normal and reduced, for encode, fold, hidden-ready, each action, focus, adjacent-stuck, adjacent-separated, lid-lock, omission, duplicate, success, and timeout, plus 390/430 boundaries, real touch/keyboard causality, overflow/errors/external requests, performance, deadline, and disposal. There is no invented legacy comparison.
