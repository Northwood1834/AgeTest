# memory-phone-pin-v1 — ミネモラ・ロック

Status: implemented; exhaustive Node, isolated browser, credential-safety, and independent full-resolution visual QC passed.

## Pitch

A fictional handset briefly shows a four-digit practice PIN together with one coherent “evening memory trail.” The number disappears. Four soft thought bubbles remain around the lock screen, each carrying one object from that trail. Read the bubbles in their marked order and reproduce the PIN on a tactile numeric keypad before the handset locks.

This is not a credential prompt. The phone is an original `MNEMORA` handset, every number is generated fiction, the screen says `架空の練習用PIN`, and the game never asks for, guesses, stores, or transmits a real PIN. It does not copy an iOS or Android lock screen.

## Memory language

Digits use a finite, authored mnemonic alphabet rather than four arithmetic questions:

- 0: an eclipse ring
- 1: one lighthouse beam
- 2: paired ticket stubs
- 3: a triangular cake slice
- 4: a four-pane window
- 5: a plum blossom
- 6: a honeycomb cell
- 7: rainbow bands
- 8: an hourglass loop
- 9: a nine-tile mosaic

Generation selects four distinct digits and rotates the visual treatment of the shared evening trail. Encoding cards explicitly bind each ordered digit to its mnemonic for a brief study phase. In recall, digits vanish and the four bubbles show only ordered mnemonic objects and short semantic names. The fixed decoder exhaustively proves every bubble has exactly one digit and the ordered set reconstructs exactly one PIN. No independent sums or random guessing are involved.

## Loop and states

1. `ENCODE` — the fictional PIN and all four digit-to-object bindings are visible.
2. `VEIL` — the digits soften and slide behind frosted glass; reduced motion keeps a nonzero tracked intermediate stage.
3. `CUE` — ordered thought bubbles bloom around the handset.
4. `INPUT` — tapping or typing digits fills four neutral lock dots. Backspace reverses partial input without consuming an attempt.
5. A complete wrong four-digit attempt performs a causal shake, clears only after a tracked settle, and marks one of three attempt lamps.
6. Exact input opens the lock once. The wallpaper gains depth and a calm glass aperture rises.
7. A third wrong complete attempt enters a distinct lockout once. Deadline enters a distinct timeout once.

Maximum complete attempts: three. Input is locked during wrong-answer feedback and after any terminal state.

## Generated task and proof

Plain task data contains `pin`, four ordered cue records, visual palette, duration, encoding timing, attempt limit, and a plain `resume` record (`phase`, `input`, `attempts`). Validation checks exact metadata-independent schema, distinct digits, cue IDs/kinds/names, the fixed kind-to-digit decoder, order, unique reconstruction, phase/input/attempt coherence, bounded timing, palette, and an exhaustive 10^4 candidate proof count of exactly one PIN matching all cues.

A resumed task restores phase, partial input, and attempts without mutating task data. A complete terminal resume is not persisted; the kernel owns committed outcomes.

## Interaction and accessibility

- Ten numeric keys plus a 56px delete key; pointer/touch and physical digits share one action.
- Backspace/Delete reverses one partial digit. Enter is inert unless an unsubmitted four-digit buffer exists.
- Strong `:focus-visible`, pressed/disabled states, live status, named keypad group, readable ordered cue text, and attempt lamps with text equivalents.
- Normal motion uses tracked staged timers and a short owned frame shake. Reduced motion uses nonzero tracked veil, wrong, settle, and unlock stages without continuous decorative motion.
- No audio, network, raw timers, global document construction, browser storage, or real credential path.

## Visual direction

The vertical hero is an original graphite-and-brass handset with asymmetrical speaker slots, a depth-blurred midnight wallpaper, luminous orbital arcs, a faceted camera jewel, and a glass `MNEMORA` wordmark. Frosted thought bubbles sit in a reserved 2×2 upper lock-screen lane, clear of dots and keypad, and use authored CSS motif art. The keypad has deep translucent wells, rim light, tactile pressed travel, and wide spacing. Wrong attempts turn the inner glass rose-red and physically displace the handset; success opens a layered iris with quiet particles; lockout lowers a heavy shutter. Terminal panels stay compact and preserve handset, cues, attempts, and causal final state.

Required final full-resolution frames at 393×852 and 402×874 DPR3 in normal and reduced motion: encoding, cue, partial input, wrong attempt 1, wrong attempt 2, success, lockout, and timeout. Also verify 390×844 and 430×932, overflow, external requests/errors, pointer, keyboard/focus, deadline, dispose, and generation/render performance.
