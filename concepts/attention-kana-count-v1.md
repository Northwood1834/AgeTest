# attention-kana-count-v1 — かなカウント・マトリクス

Status: published v1.0 port specification; concept, module, exhaustive Node tests, and frozen parity fixtures precede browser handoff.

## Published identity

- Stable ID: `attention-kana-count-v1`
- Introduced: `1.0`
- Category: `attention`
- Tier: `3`
- Flavor: `quirky`
- Step: `1`
- Family: `attention-kana-count`

The sole source authority is the current `app.js` v1.0 factory and current generic `expression` renderer, `makeChoices`, generic result, and generic timeout. The archived unpublished architecture is not a source and must never be consulted.

## Exact generation trace

For ordinary valid helpers, preserve the current factory literally:

1. `pick(['さ','き','の'])` once to obtain `target`.
2. In expression order, call `pick(['さ','き','の','ち','ら'])` exactly 18 times.
3. Count exact matches to `target`.
4. Start a numeric `Set` with `[count]`.
5. Until its size reaches four, call `pick([-3,-2,-1,1,2,3])`, calculate `Math.max(0,count + delta)`, and add the number to the Set. Duplicate and zero-clamped results remain ordinary calls; do not preselect, canonicalise, or skip them.
6. Spread the numeric Set in insertion order, then call `.map(String)` on that outer array.
7. Call `shuffle(mappedOptions)` exactly once.
8. Return exactly seven keys in this order:

```js
{
  kind: 'expression',
  prompt: `「${target}」はいくつある？`,
  help: '似た文字にご注意。',
  expression: chars.join(' '),
  options: shuffledOptions,
  answer: String(count),
  duration: 8000
}
```

There is no minimum target-count correction: zero is valid. There is no density tuning, target balancing, alternate kana, option canonicalisation, or extra stored field.

Missing, throwing, malformed, or out-of-domain helper results use deterministic in-place fallbacks. A 96-call guard protects the duplicate-prone option Set from hostile nontermination; if reached, the exact current delta domain fills the remaining Set slots in order. Ordinary traces that reach four values are unchanged and receive no extra call. A malformed shuffle falls back to the already mapped insertion order. Every returned task remains plain structured-cloneable data.

## Strict stored-task validation

Only the exact seven keys are accepted. Validation requires:

- exact `expression` kind, prompt punctuation, help, and 8000 ms duration;
- target derived only from one of the exact three prompts;
- exactly 18 kana with exactly 17 single spaces;
- every token from `['さ','き','の','ち','ら']`, in stored order;
- `answer` exactly the derived decimal target count, including `0`;
- exactly four unique decimal-string options in stored order;
- options contain the answer, and every other value is obtainable as `Math.max(0,count + delta)` from the exact published delta array.

Plain JSON stringify/parse must render and complete identically without mutating task data.

## Generic choice/results parity

- Render the exact expression and exact four stored choices.
- Correct and wrong selection commit `{answerLabel:task.answer}` with correctness from exact string equality.
- Timeout at exactly 8000 ms commits false with `{detail:'時間切れです。脳は定時退社しました。',answerLabel:task.answer}`.
- A first choice immediately locks all input; neither deadline nor later input can replace it.
- The module owns one tracked 180 ms material response before answer commit. Reduced motion keeps one nonzero tracked stage and owns zero RAF.

## Information-preserving production treatment

The generic line becomes an authored 6×3 inspection matrix while preserving all 18 values in row-major expression order:

- every kana has exactly the same class, Japanese/system font stack, size, weight, color, well material, lighting, border, spacing, and ARIA treatment;
- there is no target-only class, glyph label, color, outline, scale, position, animation, grouping, answer marker, highlight, or hidden target hint;
- the matrix container exposes the exact single-spaced expression as its accessible label, while decorative visual tokens are hidden from duplicate accessibility reading;
- dark plum instrument housing, equal porcelain/plastic wells, brass registration detail, and a restrained inspection footer establish production material hierarchy without adding a kana;
- exact stored options form a neutral 2×2 numeric panel; focus gets a gold dashed ring and only the chosen key receives post-input green/rose feedback;
- timeout desaturates the instrument without identifying target occurrences or the answer choice.

The visual 6×3 arrangement is only row-major typesetting of the exact 18-token expression. No token is moved, omitted, duplicated, highlighted, or semantically regrouped.

## Input, accessibility, and lifecycle

- Four native choice buttons are at least 64 CSS px high.
- Pointer/touch, native click, Enter, and Space share one guarded checker.
- Arrow keys move and clamp through exact 2×2 geometry; focus is visible.
- Choice ARIA contains ordinal and value only, never correctness.
- Initial and focus scenes contain no selected token, answer marker, or target clue.
- DOM is created only from `context.host.ownerDocument`.
- Deadline, feedback, input, and abort use only context-owned primitives.
- Dispose removes QA and leaves zero timers, listeners, and frames.
- No network, storage, audio, external assets, global DOM creation, or RAF.
- Layout targets 390–430 CSS px; QA DPR inspection caps at 3.

## Frozen parity plan

After explicit Flow handoff, freeze three ordinary valid traces spanning every target and representative counts/options:

1. `さ`, count 5, three immediate negative-delta options;
2. `き`, count 0, three zero-clamped duplicate calls followed by `+1,+2,+3`;
3. `の`, count 9, mixed positive/negative options.

Compare LEGACY and MODULE at 393×852 and 402×874 DPR3, normal and reduced, for initial, focus on a known wrong choice, wrong, success, and timeout: 120 frames / 60 semantic pairs. Pin exact pick argument arrays/call order, tasks, 18-token text/order/spacing, option insertion/string-map/shuffle order, generic payloads, no-cue boundary, DPR, overflow, errors, and external-origin checks.

Supplemental browser gates cover real touch and keyboard 2×2 activation/locks, 390/430, exact 8000 ms deadline, performance, reduced feedback stages, and active-feedback disposal. Browser work is forbidden until Flow is explicitly handed off.
