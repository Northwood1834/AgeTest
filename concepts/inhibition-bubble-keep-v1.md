# inhibition-bubble-keep-v1 — Quiet Bubbles at the Bath Window

## Identity

- **Queue:** N12 / Q125
- **Category / tier / flavor:** inhibition / tier 1 / quirky
- **Audience:** mainstream women 30–40
- **Duration:** exactly 18 seconds
- **Primary action:** tap
- **Three-second read:** all eight bubbles are visible from the opening; the instruction names the small circles to tap and the visibly larger stars to leave.

## One-sentence play

Tap every small round bubble and leave the larger star-shaped bubbles floating by the bath window.

## Rule authority

Correctness is entirely visual and local to the board:

- five targets have a small circular silhouette;
- three targets have a materially larger five-point star silhouette with indented edges;
- only the small circles should be tapped.

Circle versus star is encoded simultaneously by size and edge silhouette. Color never determines the rule: every piece shares the same pale glass-and-water treatment, and authored boards remain solvable in grayscale. All targets are visible before the first action. Nothing moves, appears late, changes category, or switches the rule.

## Authored finite boards and proof

There are four authored 4×2 boards. Each rearranges the same five round IDs and three star IDs while preserving generous spacing. Every board has exactly eight targets and no overlap.

For each board, the proof exhausts stable task state rather than relying on a hidden answer:

- 32 subsets exist for the five round bubbles;
- the all-tapped subset auto-finishes and is not a resumable playing state;
- 31 incomplete round subsets × three recoverable meter levels (0, 1, or 2 star taps) gives exactly 93 playable/timeout states;
- 62 of those states have a visible recoverable star-meter mark (levels 1 or 2);
- 15 success-frontier states have four of five circles tapped at each recoverable meter level;
- 31 exhaustion-frontier states have meter level 2 and become neutral exhaustion on one more star tap;
- all 5! = 120 round-only tap orders succeed.

The authored task stores those exact proof totals and IDs. Validation recomputes them and rejects retuned shapes, sizes, positions, rule copy, duration, proof, or resume state.

## Interaction

### Tap / click

Each bubble is a real button with a hit region larger than 44×44 CSS px. Tapping an untapped small circle runs one calm, non-flashing two-state pop: a pressed glass ring, then an empty damp ring. Correct taps are retained immediately. Tapping a star leaves that star present and advances the visible three-step calm meter.

### Keyboard

Arrow keys move focus around the fixed 4×2 board. Space activates the focused bubble through the same `activate(index)` operation used by click/touch. Tapped circles are skipped by later focus moves; stars remain focusable because leaving them is the inhibition decision. Focus is always visible.

## Recoverable mistakes and outcomes

- **First star tap:** meter moves to step one; all remaining circles and stars stay playable.
- **Second star tap:** meter moves to step two; play still continues.
- **Third star tap:** neutral completion, `星形を三回さわりました。ここでおしまいです。` No blame or alarm treatment.
- **Success:** after the fifth correct circle settles, input locks and the three large stars remain visibly present. They sit slightly higher with a soft static settled glow; there is no flashing celebration.
- **Timeout:** at exactly 18,000ms, tapped circles, remaining circles, all stars, and the calm meter remain visible and are returned in the result.

Repeated taps on an already popped circle do nothing. A star mistake never removes a star. There is no score, speed bonus, moving target, tiny search object, surprise, or manual submit.

## Art direction

The board is an original warm bath-window fiction: frosted glass, peach tile, a wooden sill, folded towel, small bottle silhouettes without labels, and a quiet evening glow. Bubbles are translucent line art created locally in DOM/SVG. No real product, logo, photograph, external asset, emoji, audio, or network resource is used.

The five circles use a visibly smaller art disk inside large forgiving hit buttons. The three stars occupy larger art silhouettes and have deep edge notches that remain recognizable at contact-sheet size. Surface glints are identical across both categories so they cannot become color-coded answers. The board avoids dense counters; the only progress display is a labeled three-segment calm meter for recoverable star taps.

## Motion and reduced motion

- **Normal:** one correct pop may own one tracked animation-frame loop for the brief two-state press/settle; only one pop runs at a time.
- **Reduced:** no animation frame is requested. The same two stills are scheduled through one nonzero tracked settle interval. Stars, steam, and finish art are static.
- No flashing, shaking, target travel, or continuous background animation exists in either mode.

## Resume and lifetime

Stable task state contains only `tappedRoundIds`, `starTaps` (0–2), and phase `playing`. A valid resumable state must be incomplete, use authored round IDs only, contain no duplicates, and match no terminal success. Busy pop state, frame handles, focus, finish lock, and QA scenes are transient.

A JSON round-trip rendered by a fresh module continues through the same activation path. All deadlines, settle stages, frame work, listeners, and abort cleanup are context-owned. Disposal removes the QA handle and leaves no timers, frames, listeners, or finish path alive.

## Required QA

Focused Node QA covers metadata; 10,000 bounded cloneable generations; all four boards; exact 93-state proof; all 120 success orders; every recoverable meter state; third-star exhaustion; exact 18,000ms timeout retention; strict validation and fresh-module resume; touch/click and arrow/Space activation; repeated input lock; normal one-frame versus reduced zero-frame tracked stills; DPR3; 44px targets; disposal; and source bans.

Browser QA on Audit9332/8862 captures all variants at 393×852 and 402×874 DPR3 in normal/reduced modes for initial, pop, partial, meter one, meter two, success, exhaustion, timeout, and focus. It adds real 390×844 touch and 430×932 keyboard routes, exact deadline, disposal, 90-frame performance, boundary captures, target geometry, external/error/overflow checks, and a director contact sheet before release.
