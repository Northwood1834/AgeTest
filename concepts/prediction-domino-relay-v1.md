# prediction-domino-relay-v1 — Original Game Concept

Status: original N08 implementation complete; exhaustive proof, causal browser matrix, corrected tabletop fit, lifecycle, and independent full-resolution review passed.

## Identity

- Stable ID: `prediction-domino-relay-v1`
- Introduced: `2.0`
- Category: `prediction`
- Family / step: `prediction-domino-relay` / `1`
- Tier / flavor: `3` / `wild`

## Player promise

Arrange three finite wooden dominoes on an authored tabletop relay, rotate one turntable toward the bell, then make exactly one irreversible push. Every fall is computed from the actual placement: a domino's literal height is its forward reach, and steps, a light obstacle, and a wide gap consume that reach. A failed relay remains visibly stopped at the exact unresolved edge.

## Finite authored board

The board has eleven authored route slots plus one endpoint bell, below the fourteen-slot cap.

- Fixed relay dominoes: `start(2)`, `step(2)`, `obstacle-after(3)`, `turntable(2)`, `gap-after(2)`, and `branch-end(2)`.
- Four reversible placement sockets: `low`, `obstacle`, `gap`, and off-route `branch`.
- Finite inventory: exactly `short(2)`, `medium(3)`, and `tall(5)`.
- Bell route: start → low → step → obstacle → obstacle-after → turntable → gap → gap-after → bell.
- Branch route: start → low → step → obstacle → obstacle-after → turntable → branch → branch-end → dead end.
- Authored reach costs are integers. The successful movable boundaries are exact: low `2`, obstacle `3`, gap `5`.
- The obstacle edge consumes reach `3`; the wide gap consumes reach `5`; step edges consume reach `2`.

The unique successful allocation is `short→low`, `medium→obstacle`, `tall→gap`, branch empty, turntable toward bell. All three pieces are causally necessary. The one-short obstacle boundary is `short(2)` against cost `3`; exact gap reach is `tall(5)` against `5`.

## Setup interaction

- Tap/click or keyboard-activate an inventory piece, then a socket, or pointer-drag from piece to socket.
- A placed piece can be picked back up or moved. Undo restores the preceding complete placement/orientation snapshot.
- Rotate toggles the authored turntable between bell and branch. It does not alter reach.
- Before push, all placement and turntable operations are reversible.
- Push is enabled in setup and is the one irreversible action. After it, inventory, sockets, rotate, undo, and push lock permanently.
- Native buttons, visible focus, touch pointer drag, keyboard activation, and concise live status are required.

## Deterministic propagation

At push, the module derives the active route from the actual turntable orientation and walks it once. For every edge:

1. The source domino must exist and its height must be at least the authored integer reach cost.
2. The destination domino must exist unless it is the bell/dead endpoint.
3. A valid edge appends the next slot to the retained chain.
4. A failed edge records exact `at`, `next`, `available`, `needed`, and `feature`; no downstream domino falls.

Normal motion uses a finite tracked `context.later` fall per segment. Reduced motion uses shorter but nonzero tracked segment stages with identical slot order and exact stop. Neither mode uses RAF or a prerecorded cascade.

## Outcomes

Every finish is single-shot and retains placements, orientation, fallen chain, and exact stop.

- `success`: the bell route reaches the bell; the tabletop bell visibly rings without audio dependency.
- `insufficient-reach`: a present piece cannot span an ordinary step/gap.
- `wrong-branch`: the turntable directs the deterministic relay away from the bell, retaining the actual branch chain/stop.
- `high-piece-exhaustion`: the gap socket is empty after the height-5 piece was spent elsewhere.
- `obstacle-stop`: the obstacle socket is absent or has less than reach `3`.
- `timeout`: before push retains setup; during a fall retains the exact prefix and next unresolved edge.

Timeout never fabricates progress. No restart or second push exists inside the game.

## Task and plain resume

The generated task is cloneable plain data containing the exact authored slots/routes, inventory, turntable, bell, duration, proof, and an initial setup resume. A validated resume may restore:

- a reversible `SETUP` placement/orientation/history state with push count zero, or
- a locked terminal `STOPPED`/`SUCCESS`/`TIMEOUT` state with push count one, exact chain, and exact stop/result.

A restored terminal board does not call finish again.

## Exhaustive proof

Generation computes rather than asserts the finite proof:

- `4P3 = 24` complete allocations of three labeled pieces into four sockets;
- both turntable orientations evaluated for `48` setup states;
- exactly one bell success;
- no success after removing any inventory piece;
- exact successful reaches `2/2`, `3/3`, `5/5`;
- one-short `2/3` obstacle boundary;
- reachable insufficient, wrong-branch, high-exhaustion, and obstacle failures.

Validation recomputes this enumeration and rejects changed routes, heights, costs, proof, or malformed resume.

## Visual direction

An original warm workshop tabletop uses unbranded wood grain, three visibly different domino heights, brass socket guides, a two-way wood/brass turntable, a light cork obstacle, a cut tabletop gap, and a small endpoint bell. Dominoes have upright/falling/fallen material states. No pipe/path skin, copied product branding, fake cascade, audio requirement, or external asset is used.

The board and controls fit 390–430 CSS px at DPR 3 without horizontal overflow. Terminal states keep the exact stopped chain and unresolved edge visible.

## Evidence gate

Focused tests cover exact generation/proof, all 24 allocations and 48 orientation states, unique solution/all-piece necessity, exact and one-short boundaries, every outcome, reversible place/move/rotate/undo, one irreversible push/finish, normal/reduced identical chain order and stop, setup/terminal plain resume, timeout before/during push, disposal, pointer/keyboard/focus, and forbidden APIs.

After explicit screw handoff, browser evidence covers the frozen generated task at 393×852 and 402×874 DPR 3, normal/reduced, for initial, placement, focus, exact-boundary, short-stop, branch-stop, obstacle-stop, success, and timeout, plus real touch drag, keyboard place/rotate/undo, causal chain, 390/430 layout, errors/external/overflow, performance, deadline, and disposal.
