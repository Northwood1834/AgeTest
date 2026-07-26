# attention-leaf-trim-v1 — やさしい葉先のお手入れ

## Audience and comprehension lock

- Mainstream adults in their 30s–40s; tier 1; one action only.
- In three seconds: **tap the leaves with dry, jagged edges**. Smooth-edged healthy leaves are left alone.
- One round lasts exactly 18 seconds. Every dry leaf is visible from the opening frame.
- No quiz, hidden rule, dense counter, brand, romance, audio, or emoji.

## Original setting and interaction

A warm fictional houseplant sits by a softly lit apartment window in an authored ceramic pot. Seven leaves are spread around an unobstructed stem. Three leaves have visibly notched, irregular silhouettes and short edge hatching; four healthy leaves have smooth continuous silhouettes. All leaves use the same green fill family: the distinction is shape plus edge treatment, never a red/green or brown/green color code.

The player taps a leaf. A dry-edged leaf is gently trimmed and immediately swaps to a clean, smooth silhouette. A healthy-leaf tap is recoverable: a visible three-segment `葉の元気` meter softly dims one segment and the selected leaf receives a brief neutral ring. The first and second mistakes remain playable; only the third exhausts the meter.

Each leaf owns a hit area of at least 44 CSS pixels. Touch/pointer and keyboard share the same activation path. Arrow keys move the visible leaf cursor; Space or Enter taps the focused leaf. Native focus is visible.

## Finite task and proof

- Three authored plant arrangements, selected by one bounded integer draw.
- Exactly seven visible leaves: three dry-edged and four healthy.
- The task stores every leaf ID, position, angle, scale, edge kind, shared fill material, duration, meter size, exact solution, and failure witnesses as cloneable plain data.
- Exact success proof taps all three dry IDs once and reaches `all-dry-trimmed` with health 3.
- Exact recoverability proof taps one then two authored healthy IDs; health is 2 then 1, the round remains live, and the remaining dry IDs are unchanged.
- Exact exhaustion proof taps three distinct healthy IDs and reaches `health-exhausted` with health 0.
- Exact timeout witness trims one dry leaf, then expires; the other two dry leaves and current health remain visible and retained.

## Outcomes

- **all-dry-trimmed** — bright success: all former dry edges are smooth, the plant gains a warm static glow, and the full retained layout remains visible.
- **mistake-one / mistake-two** — nonterminal recoverable states: one or two health segments dim; no blame or alarm framing.
- **health-exhausted** — neutral stop after the third healthy-leaf tap; touched state, remaining dry leaves, and empty meter remain visible.
- **timeout** — remaining dry leaves, trimmed leaves, selected leaf, and meter are retained exactly.

## Motion and lifecycle

Normal motion uses short tracked `context.later` trim/ring stages. Reduced motion swaps the leaf silhouette immediately and uses a static tracked glow stage; it uses no frame loop. The kernel owns the exact 18,000 ms deadline and every delayed stage. Disposal aborts the signal, clears QA, and leaves no listener, timeout, deadline, or animation frame.

## Visual QA states

Capture initial, dry-leaf focus, trimmed progress, first recoverable mistake, second recoverable mistake, bright success, health exhausted, timeout, and reduced static glow at 393×852 and 402×874 DPR3, plus real 390/430 touch, keyboard/focus, deadline, disposal, and performance evidence. This is an original game; no fabricated legacy comparison exists.
