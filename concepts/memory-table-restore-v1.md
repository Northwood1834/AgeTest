# memory-table-restore-v1 — テーブルを元どおりに

## Audience lock

Mainstream adults in their 30s–40s, tier 2, one primary gesture, understandable within three seconds. The player sees a warm original tabletop, remembers it, then drags the three changed whole objects into their faint remembered silhouettes. No quiz, submit button, dense rules, brand, emoji, audio, or network asset.

## Exact round

- Normal encoding: 4,000 ms. Reduced-motion encoding: 6,000 ms.
- A tracked two-still transition hides the remembered arrangement and reveals the changed table; no RAF is used.
- Restore phase: exactly 20,000 ms, owned by `context.setDeadline`.
- Six authored, shape-distinct tabletop objects remain visible. Exactly three differ from memory: one by position, one by direction, and one by open/closed state. Color is never the only cue.
- Drag a whole object into its own remembered silhouette/socket. A matching drop restores its complete original position, direction, and open state.
- Objects may be moved again. Wrong drops and accidental moves are reversible. Unchanged objects should stay put; moving one simply adds a gentle extra-move mark and it can be returned.
- A three-segment extra-move meter is visible and caps at three without ending play. There is no submit trap.
- Arrow keys move object/socket focus. Space picks up and drops through the same socket resolution path. Every object and socket has at least a 44 CSS px interaction area.

## Finite authored data and proof

Three authored tabletop variants store exact original and changed states for six objects, the three changed IDs and change kinds, geometry, 4/6-second encoding contract, 20-second restore duration, and all six viable correction orders. Plain JSON resume stores phase, current full states, restored IDs, extra moves, focused object/socket, pickup, and terminal outcome. Validation compares authored semantics and rechecks exactly one position, one direction, and one open-state change.

The proof route restores each changed ID into its own socket. All six permutations succeed, proving correction order is not prescribed. Witnesses retain one restored object on timeout, three nonterminal extra moves, and a moved unchanged object that can be restored.

## Outcomes

- `table-restored`: completed tabletop remains visible with a warm before/current merge glow.
- `extra-one`, `extra-two`, `extra-three`: nonterminal, recoverable meter states; play continues at three.
- `timeout`: current positions, directions, open states, sockets, restored IDs, and meter remain visible.

## Visual and lifecycle QA

Capture encode, both transition stills, restore start, each change kind, extra-move states, progress, success, and retained timeout at 393/402 DPR3 in normal/reduced mode for all three variants. Real QA covers 390/430 touch, keyboard/focus, exact encoding and 20-second restore deadline, disposal, DPR3, overflow, and performance. All timers and listeners are context-owned; disposal aborts QA and leaves zero work.
