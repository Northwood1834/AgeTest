# social-greeting-v1 — 場面に合う一言

Status: published v1.15 compatibility-port specification.

## Stable identity

- ID: `social-greeting-v1`
- introducedIn: `1.15`
- category: `social`
- tier: `1`
- flavor: `classic`
- step: `1`
- family: `social-greeting`

The current `app.js` v1.15 factory plus its generic `choice` renderer are the sole authority. This port preserves a three-row reading task; it does not modernize wording, reinterpret etiquette, rank people, or claim one answer is universal outside the exact authored scene.

## Exact authored rows

1. Scenario: `朝、近所の人に会いました。`
   - answer: `おはようございます`
   - distractors: `おやすみなさい` / `いただきます` / `ごちそうさま`
2. Scenario: `お店で先に会計を譲ってもらいました。`
   - answer: `ありがとうございます`
   - distractors: `いってきます` / `おかえりなさい` / `はじめまして`
3. Scenario: `久しぶりに友人に会いました。`
   - answer: `お久しぶりです`
   - distractors: `いってらっしゃい` / `おつかれさま、また明日` / `ただいま`

No row, answer, distractor, punctuation, or spacing is changed.

## Exact generation and task shape

Generation invokes injected `pick` on the three authored rows first. It then invokes injected `shuffle` once on `[answer, ...three distractors]`. The selected row is not edited. Invalid helper output falls back finitely to the first authored row or authored answer-first option order without creating new text.

The plain task has exactly:

```text
kind: "choice"
prompt: `${scenario} なんと言う？`
help: "いちばん自然なあいさつを。"
options: one exact permutation of that row's answer plus three distractors
answer: exact authored answer
duration: 7000
```

Validation accepts all 24 option permutations for each row and rejects extras, unknown rows, changed interpolation spacing, wording changes, cross-row options, changed answer, duration changes, or any additive cue field.

## Exact generic-choice semantics

All four answers are initially visually and semantically equal. There is no pre-choice answer class, `data-answer`, correctness marker, etiquette category, rank, explanatory label, or hidden result copy.

Selecting an option immediately locks all four options and records whether `value === task.answer`, exactly like the generic choice renderer. The port shows a finite 180 ms selected-feedback frame before committing the same payload:

- success: `context.finish(true, {answerLabel: task.answer})`;
- wrong: `context.finish(false, {answerLabel: task.answer})`.

No custom success or failure detail is added. The host's generic feedback remains responsible for displaying the result and, for wrong answers, the current answer label.

At exactly 7000 ms, if no choice was made, timeout commits once with:

```text
correct: false
detail: "時間切れです。脳は定時退社しました。"
answerLabel: task.answer
```

A choice accepted at 6999 ms owns the result; the deadline cannot overwrite it. The task is never mutated and a plain JSON task resumes with the same option order.

## Production presentation

The challenge is a neutral local social-moment card: layered paper, a quiet threshold-like frame, a speech-panel surface, and four equal response cards in a true 2×2 grid. Material treatment does not add a location label, social rule, emotion meter, or clue. The exact prompt remains the only scenario description.

Every response has equal dimensions, typography, border, and initial color. At least 44 CSS pixels of hit height remains at 390–430 CSS-pixel widths. The exact prompt tail `なんと言う？` is one nonbreaking typographic unit at 390, 393, 402, and 430 CSS pixels; this changes no task or visible characters. The exact long option `おつかれさま、また明日` may remain on one line or balance only as `おつかれさま、` / `また明日`, never with a single-character `日` orphan. Its two no-wrap phrase spans concatenate to the exact original button `textContent` and accessible label. Selected feedback colors only the chosen response after the action. No image, emoji, audio, network request, external font, or new asset is used.

## Input, motion, and lifetime

- Touch/pointer and native zero-detail keyboard click share one checker.
- Native Tab and visible focus remain available.
- Left/Right moves within a row; Up/Down moves within a column of the 2×2 grid. Enter/Space and number keys 1–4 activate the focused/indexed option.
- Correct and wrong feedback are context-owned, non-zero 180 ms stages. Reduced mode retains the readable selected frame, owns no RAF, and disables decorative transition motion.
- Deadline, feedback, listeners, and QA are context-owned. Disposal during feedback cancels both feedback commit and deadline and removes QA synchronously.
- DOM is created only through `context.host.ownerDocument`; DPR inspection caps at 3.

## Required proof and parity

Focused Node proof covers exact current source rows/factory/generic renderer, pick-before-shuffle call order, all 72 row-permutation tasks, strict validation, no answer leak, all twelve answer selections, generic payloads, 180 ms feedback, exact 7000 ms deadline and 6999 ms race, 2×2 keyboard/touch/focus, plain resume, reduced no-RAF behavior, disposal, DPR, bounded cold render, and source policy.

For each of the three rows, one frozen option order is shared byte-for-byte by legacy and module fixtures. At 393×852 and 402×874 DPR3, normal and reduced, capture side-by-side source frames for `initial`, `focus`, `wrong`, `success`, and `timeout`: 120 canonical images. Hard review checks exact task JSON, prompt/help/options order/answer/payload, equal pre-choice cards, absence of answer leakage, and generic deadline behavior. Supplemental real-browser checks cover every option, touch, 2×2 keys, visible focus, 390/430 overflow, performance, deadline race, reduced feedback, and disposal.
