# attention-animal-count-v1 — アニマル・カウントマトリクス

Status: published v1.0 port specification; concept, module, exhaustive Node tests, and frozen parity fixtures precede browser handoff.

## Published identity

- Stable ID: `attention-animal-count-v1`
- Introduced: `1.0`
- Category: `attention`
- Tier: `1`
- Flavor: `quirky`
- Step: `1`
- Family: `attention-animal-count`

The sole authority is the current `app.js` v1.0 factory and its current generic `expression` renderer, `makeChoices`, generic result, and generic timeout. The unpublished archived architecture is not a source and must never be consulted.

## Exact generation trace

For every ordinary valid helper stream:

1. Call `pick(['🐶','🐱','🐼'])` once for `target`.
2. In expression order, call `pick(['🐶','🐱','🐼','🐰'])` exactly 14 times.
3. Count exact matches to `target`.
4. Start a numeric `Set` with `[count]`.
5. Until its size is four, call `pick([-2,-1,1,2,3])`, calculate `Math.max(0,count + delta)`, and add that number. Duplicate and zero-clamped draws remain real calls.
6. Spread the numeric Set in insertion order and map the outer array through `String`.
7. Call `shuffle(mappedOptions)` exactly once.
8. Return exactly seven keys, in order:

```js
{
  kind: 'expression',
  prompt: `${target} は何匹？`,
  help: 'ほかの動物に釣られないで。',
  expression: line.join(' '),
  options: shuffledOptions,
  answer: String(count),
  duration: 7000
}
```

Zero target occurrences are valid. There is no minimum-count correction, density balancing, animal substitution, option canonicalisation, retune, or extra stored field.

Missing, throwing, malformed, or out-of-domain helper results use deterministic in-place fallbacks. A 96-call guard prevents a hostile duplicate-only option stream from hanging; after the guard, the exact published delta domain fills missing Set slots in order. Ordinary streams that reach four values receive no extra calls and remain byte-for-byte equivalent to the current factory. A malformed shuffle falls back to mapped insertion order.

## Strict stored-task validation

Validation accepts only the exact seven fields and requires:

- exact kind, prompt spacing/punctuation, help, and 7000 ms duration;
- target derived from exactly one published prompt;
- exactly 14 native animal glyphs with exactly 13 literal single spaces;
- every token from `['🐶','🐱','🐼','🐰']` in stored order;
- answer exactly equal to the derived decimal target count, including `0`;
- four unique decimal-string options containing the answer;
- every distractor obtainable through `Math.max(0,count + delta)` from the exact published delta array.

Plain JSON stringify/parse renders and completes identically without mutating the task.

## Generic choice/result parity

- Render the full exact expression and the four exact stored options.
- Correct and wrong choices commit `{answerLabel:task.answer}` using exact string equality.
- At exactly 7000 ms, timeout commits false with `{detail:'時間切れです。脳は定時退社しました。',answerLabel:task.answer}`.
- First input locks every option; later touch, keyboard input, and deadline cannot replace it.
- A 180 ms context-owned material response precedes choice commit. Reduced motion retains one nonzero tracked response and owns zero RAF.

## Information-preserving production treatment

The generic expression is typeset as one row-major 7×2 inspection matrix:

- all 14 task glyphs remain native `🐶`, `🐱`, `🐼`, or `🐰`; none is replaced by artwork, a label, an alternate emoji, or a custom drawing;
- every occurrence receives exactly one shared class, native color-emoji font stack, size, material, lighting, border, spacing, opacity, and accessibility treatment;
- no target-only color, size, label, class, glow, outline, position, grouping, reorder, animation, answer marker, or hidden cue exists;
- the matrix exposes the exact single-spaced expression as one accessible image label, while visual token spans are hidden from duplicate reading;
- a dark plum instrument housing, equal porcelain/plastic wells, brass registration detail, and neutral footer add depth without adding an animal glyph;
- stored numeric options stay in exact order in a neutral 2×2 panel; focus marks only a numeric key, and green/rose feedback appears only after choice;
- timeout desaturates uniformly without identifying any target occurrence or answer key.

The 7×2 layout is row-major typesetting only. It never changes expression order, count, density, or semantics.

## Input, accessibility, and lifecycle

- Four native buttons have at least 64 CSS px height.
- Pointer/touch, native click, Enter, and Space share one guarded checker.
- Arrow keys move and clamp through exact 2×2 geometry with visible focus.
- Choice ARIA contains ordinal and value only, never correctness.
- Initial and focus scenes contain no selected token or answer clue.
- All DOM comes from `context.host.ownerDocument`.
- Feedback, deadline, listeners, and abort use only context-owned primitives.
- Dispose removes QA and leaves zero timers, listeners, and frames.
- No network, storage, audio, external assets, global DOM creation, or RAF.
- Layout targets 390–430 CSS px and QA inspection caps DPR at 3.

## Frozen parity plan

After explicit Flow handoff, freeze three exact valid traces:

1. `🐶`, count 4, immediate deltas `-2,-1,+1`;
2. `🐱`, count 0, clamped duplicate deltas `-2,-1`, then `+1,+2,+3`;
3. `🐼`, count 7, mixed deltas `+1,-2,+3`.

Compare LEGACY and MODULE at 393×852 and 402×874 DPR3, normal and reduced, for initial, focus on a known wrong choice, wrong, success, and timeout: 120 frames / 60 semantic pairs. Pin exact pick domains/call order, task JSON, 14-token order/spacing, Set insertion/string-map/shuffle order, options, result payloads, timeout, no-cue boundary, DPR, overflow, errors, and external origins.

Supplemental browser gates cover real touch, real 2×2 keyboard activation/focus/locks, 390/430, performance, exact 7000 ms deadline, reduced feedback, and active-feedback disposal. Browser work is forbidden until Flow is explicitly handed off.
