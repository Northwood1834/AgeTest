# social-share-cookies-v1 — Shape Bubbles at the Café Table

## Identity

- **Queue:** N12 / Q121
- **Category / tier / flavor:** social / tier 1 / satisfying
- **Audience:** mainstream women 30–40
- **Readability:** the task is understandable in about three seconds from two plates, four large slots per plate, eight cookies, and one shape bubble attached to each plate.
- **Duration:** exactly 20 seconds.
- **Primary action:** drag a cookie into a plate slot. Keyboard uses Space to pick up, arrows to choose a slot, and Space to drop through the same placement function.

## One-sentence play

Drag all eight cookies into the two four-slot plates, making sure each plate includes at least one cookie matching the shape in its own visible picture bubble.

## Correctness authority

Correctness comes only from finite visible task data:

1. each plate visibly has exactly four slots;
2. each plate has one attached picture bubble containing one cookie silhouette;
3. a completed allocation is valid only when all eight slots are occupied and each plate contains at least one cookie with the same shape family as its bubble.

The game does not label people, recipients, owners, fairness, equality, deservedness, etiquette, or any social norm. Plate names describe table locations only: window-side and shelf-side. It never says the plates should receive equal shares; the four visible slots are simply the authored capacity of each plate. No hidden preference, color inference, or real-world advice participates in scoring.

## Authored finite set

There are four authored variants. Every variant contains the same eight original cookies in an authored order and changes the two visible favorite bubbles. Cookies use only three unmistakable silhouette families:

- five-point star;
- six-petal flower;
- crescent.

There are three star cookies, three flower cookies, and two crescent cookies. Surface scoring, seed marks, and pastry tones make the eight pieces individually recognizable, but a favorite match is determined only by silhouette family, never color. No variant can become impossible: every favorite family has at least two cookies, and each plate needs only one.

For each variant, proof exhaustively enumerates all 70 full allocations (`8 choose 4` choices for the window-side plate; the complement fills the shelf-side plate). The task stores every valid and invalid full-allocation mask plus a canonical valid mask. Validation independently recomputes the complete list. This is the entire answer authority.

## Interaction

### Pointer and touch

A cookie is a target larger than 44px. Pressing picks it up. Normal motion follows the pointer through one tracked animation-frame loop. Dropping on any of the eight large slots calls the shared placement operation. Dropping on an occupied slot swaps the two cookies; dropping over the tray returns the cookie to the tray. Nothing is irreversible.

### Keyboard

Focusing a cookie and pressing Space picks it up. Arrow keys move a clearly drawn destination cursor among the eight slots. Space drops into the selected slot using the same placement operation as pointer input. Delete, Backspace, or Escape can return the carried cookie to the tray. Focus follows the moved cookie.

### Rearrangement and invalid completion

Cookies may be moved or swapped without limit until success or timeout. A full but invalid layout never commits failure and never locks. Instead, the plate missing its pictured favorite receives a calm amber ring and a visible `この形がまだありません` cue. Moving or swapping remains available. Success is automatic only after both plates have four cookies and both bubble matches are present.

## Outcomes

- **Success:** both plates are full and each contains at least one cookie matching its own visible bubble. Input locks immediately, the plates warm subtly, and the game finishes correct once.
- **Full invalid layout:** nonterminal and fully playable; missing-favorite cues identify only what the task bubbles already show.
- **Timeout:** at exactly 20,000ms, current cookie locations, filled slots, and any missing-favorite cues remain visible; the game finishes incorrect once.

No manual submit button exists, so a partially filled arrangement cannot be accidentally committed.

## Art direction

The scene is an original warm café table with two ceramic plates, two plain cups, a linen strip, pastry crumbs, and soft window light. It contains no real café name, product packaging, logo, photograph, external asset, emoji, or audio. Plate bubbles are cream cards with a dark silhouette and a short `好きな形` caption. Cookie silhouettes are high-contrast at contact size and use baked texture marks rather than color as the identifying feature.

The primary composition keeps both plates and all eight cookie targets visible at 390–430px widths. Slot and cookie hit regions remain at least 44×44 CSS px. Copy is short and no dense numeric dashboard appears.

## Motion and accessibility

- **Normal motion:** an active pointer drag owns one tracked frame loop and the cookie follows smoothly; drop uses a short tracked settling stage.
- **Reduced motion:** no animation frame is requested. Pick-up is one still, and placement is a second snapped still scheduled through tracked context timing. Steam and table lighting remain static.
- Keyboard focus has a thick, high-contrast ring. The carried cookie, destination slot, plate favorite, full-invalid cue, and completion state are expressed with shape, border, and text as well as color.
- ARIA labels describe cookie shape, current location, picked-up state, destination slot, and each plate's visible favorite.

## Resume and lifetime

The strict cloneable task state stores only stable allocation state: one location per authored cookie and phase `playing`. Locations may be `tray` or one unique authored slot ID. Validation rejects unknown slots, duplicate occupancy, reordered cookies, altered bubbles, forged proof, terminal state, and extra fields. A fresh module can render a JSON round-trip and continue through the same placement and success path.

Transient drag coordinates, frame handles, focus, busy stages, and finish locks are never serialized. All deadlines, settling stages, frame loops, listeners, and abort cleanup use the supplied context. Disposal removes the QA handle and leaves no timer, frame, listener, or finish path alive.

## Required QA

Focused Node QA covers metadata; 10,000 bounded cloneable generations; every authored variant; independent exhaustive 70-allocation proofs; non-color favorite classification; strict validation and fresh-module resume; pointer and keyboard shared placement; occupied-slot swaps; tray return; unlimited correction from every full invalid arrangement sampled or enumerated; automatic success only for valid full layouts; exact 20,000ms timeout retention; immediate lock and one finish; normal single frame versus reduced zero-frame two-still placement; disposal; DPR3; 44px targets; and source bans.

Browser QA on Audit9332/8862 captures all four variants at 393×852 and 402×874 DPR3 in normal and reduced modes for initial, carried, partial, full-invalid-left, full-invalid-right, corrected success, timeout, and focus states. It adds 390×844 and 430×932 boundaries, real touch and keyboard correction routes, exact deadline, disposal, 90-frame performance, target geometry, external/error/overflow checks, and a contact-sheet director review before lane release.
