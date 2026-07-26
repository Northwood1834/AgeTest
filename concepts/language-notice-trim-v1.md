# language-notice-trim-v1 — 幅に合わせる架空店のお知らせ

Status: N10 original module specification (Q22).

## Identity

- ID: `language-notice-trim-v1`
- category / tier / flavor: `language` / `3` / `quirky`
- introduced in: `2.0`
- family: `language-notice-trim`
- task kind: `noticeTrim`
- duration: `30000ms`
- prompt: `お知らせを一行に収めて、大事な内容を残して`
- help: `ことばを外したり戻したりします。場所・時・対象・行動と、指定された調子を残してください。`

This is a finite physical-width editing game, not etiquette instruction. Every notice, storefront, clock name, recipient marker, product, and tone label is fictional and authored inside the task. Correctness is derived only from the task's finite slot/dependency/tone authority table. The module never infers whether real language is polite, safe, appropriate, grammatical, or socially desirable.

## Authored finite family

There are four 11-chip notices. Chips retain one authored order and have integer widths; removal only changes the active subset. Therefore each task has exactly `2^11 = 2048` subsets, below the 4096 bound. All chip bodies, labels, borders, and controls use the same material treatment. Initial order, width, color, data attributes, status, ARIA, and recipient pose contain no accepted-subset marker.

Each task authority contains:

- required slots `place`, `time`, `condition`, and `action`;
- a total `slotByChip` table assigning zero or more of those fictional slots to every chip ID;
- one `allOrNone` action dependency group, so half-deleting the authored action is classified as meaningless rather than guessed from prose;
- a requested authored tone code and the exact chip IDs accepted for that code;
- fixed outcome precedence.

The four requested tone codes are internal labels (`bright`, `calm`, `quick`, `warm`) with fictional player-facing names. They make no claims about real politeness. Each base notice has width `capacity - 3`; one neutral width-3 chip yields an exact-fit second solution. Every other optional chip is width 4 or larger, so it overflows when added to the complete base. Thus exhaustive enumeration proves exactly two valid solutions per task, at least one exact-fit solution, and a semantically complete authored one-over subset at `capacity + 1`.

## Width and subset authority

Width is the exact sum of active chip integer widths. The storefront board has exactly `capacity` units, and its fill bar, tick marks, numeric counter, and clipped one-line recipient-facing notice update from that same sum. No font measurement, viewport heuristic, locale rule, or browser text width can change correctness.

Evaluation uses only task data in this order:

1. if width exceeds capacity, `overflow`;
2. if the place or time slot has no active witness, `missing-place-time`;
3. if the audience-condition slot has no active witness, `lost-condition`;
4. if the action slot is absent or an `allOrNone` group is partially retained, `meaningless-deletion`;
5. if none of the authority's accepted tone-chip IDs is active, `authored-tone-miss`;
6. otherwise the subset is `success`.

A valid solution is therefore finite table equality plus width arithmetic, never semantic generalization. Validation independently enumerates every mask, recomputes all classifications, verifies one or two solutions (these tasks author exactly two), validates exact-fit and one-over proof masks, and ensures the all-active start is overflow. The task proof stores only counts and boundary masks; rendering never exposes them.

## Causal recipient preview

The left half is an original fictional storefront with a one-line sign rail. The right half contains one original neutral recipient made from CSS shapes, its fictional badge, and three discoverable pose components. Every toggle immediately rebuilds:

- board fill and overhang from exact width units;
- sign text from active chips in authored order;
- place/time lamps from the corresponding slot witnesses;
- audience badge response from the condition witness;
- parcel/gesture response from the complete action group;
- expression/accent from the exact authored tone-chip table.

The preview never says “correct” before submit. Missing table slots produce a puzzled pose, a partial action produces a stalled pose, and a complete signal produces an approaching pose, but no color or animation identifies which removable optional chips form a solution. All changes are reversible.

## Interaction and state

All 11 chip buttons stay in one stable task-authored rack permutation that is deliberately unrelated to sentence order. The sign rail alone recomposes active chips in notice order. Active rack chips appear raised; removed chips appear recessed with `外した` text and can be restored in place. Pointer-down toggles the same state path as a zero-detail keyboard click. Arrow keys move the selected chip, Space toggles it, `R` restores all, and native Tab reaches `全部戻す` and `決定する`. Targets are at least 44 CSS px at 390–430 widths and focus is visibly at least 3 px.

A plain state is exactly `{active, selected, history}`. Active IDs are unique, authored-order members; selected is an in-range integer; history is a bounded array of prior active-ID arrays. Every toggle records one prior subset, and `ひとつ戻す` restores it. A fresh module can render a JSON-cloned task state exactly. Task data is never mutated.

Normal and reduced modes both use nonzero `context.later` preview stages. Normal uses a short lift/change/settle sequence; reduced uses shorter discrete opacity/pose stages without continuous movement. Neither mode owns a RAF. Commit locks immediately and schedules one tracked feedback stage before one finish. Abort removes QA/listeners, invalidates pending stages, clears focus/selection work, and prevents late finish.

## Outcomes

Every terminal payload retains outcome, exact width/capacity, active and removed IDs, rendered notice text, exact authority-derived preview, and a cloneable state.

- `success`: a concise table-valid subset fits; board, recipient, requested tone, and retained chip rack remain visible.
- `missing-place-time`: place and/or time witness was removed.
- `lost-condition`: the task-authored audience-condition witness was removed.
- `meaningless-deletion`: the action vanished or its finite dependency group is partial.
- `overflow`: physical width remains above capacity.
- `authored-tone-miss`: the exact requested-tone witness was removed.
- `timeout`: width, chips, recipient preview, selection, and history are retained exactly.

No result text advises real customers, evaluates courtesy, or mentions public, medical, emergency, traffic, or safety signage.

## Presentation

The portrait composition is an original lilac-and-copper night market: a rounded fictional shop canopy, enamel sign rail with integer tick marks, soft ceramic word chips, and abstract round-bodied recipients carrying impossible star/leaf badges. It uses no real storefront brand, public symbol, currency, uniform, official icon, or copied sign. All Japanese text and numbers are live UI. Status is restrained; no emoji, audio, confetti, generic quiz card, external image, network, or storage path is used.

## Required proof and browser acceptance

Focused Node evidence covers metadata; all authored tasks; 10,000 cloneable generations; hostile helpers; independent enumeration of all 8192 total subsets; exact two-solution, exact-fit, one-over, initial overflow, and no-order/style-cue proofs; each outcome; preview causality; remove/restore/undo; pointer and keyboard paths; fresh-module resume; exact 30000ms timeout retention; immediate lock/single finish; nonzero normal/reduced stages; DPR3; ownerDocument; fake and real disposal; bounded rendering; and source bans.

Browser acceptance owns Audit9332/8862 and captures all four tasks at 393×852 and 402×874 DPR3 normal/reduced for setup, one-over, editing, focus, every outcome, exact fit, and success; 390/430 boundaries; real touch and keyboard solutions; no-cue comparisons; deadline, disposal, and performance. Final evidence requires full-resolution files, no overflow/external errors, exact state retention, minimum 44px targets, and visual QC of width/recipient causality.
