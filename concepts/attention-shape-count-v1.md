# attention-shape-count-v1 — 形のカウントトレイ

Status: published v1.15 port specification; concept, module, exhaustive Node tests, and frozen parity fixtures precede browser handoff.

## Published identity

- Stable ID: `attention-shape-count-v1`
- Introduced: `1.15`
- Category: `attention`
- Tier: `1`
- Flavor: `classic`
- Step: `1`
- Family: `attention-shape-count`

The sole authority is the current `app.js` v1.15 factory plus its generic `expression` renderer, `makeChoices`, and generic timeout. The unpublished archived architecture is not a source.

## Exact generation trace

Generation preserves the published helper calls, argument order, and seven-field output:

1. Call `pick(['★','●','▲'])` once. Its result is `target`.
2. Form `others` by filtering `['★','●','▲','■']` in that exact order to exclude `target`.
3. Draw exactly 12 values in row-major textual order. For each draw:
   - call injected `random` once (the modular equivalent of current `randomFloat`);
   - when the result is `< .32`, append `target` and do not call `pick`;
   - otherwise call `pick(others)` once and append its returned glyph.
4. Count target occurrences. If and only if there are fewer than two:
   - call `randomInt(0,5)` once and overwrite that exact slot with `target`;
   - then call `randomInt(6,11)` once and overwrite that exact slot with `target`.
5. Recount into `count`.
6. Form `[count,count+1,Math.max(0,count-1),count+2].map(String)` in that order.
7. Form `unique=[...new Set(options)]`; set `extra=count+3`; while fewer than four values remain, append unseen `String(extra)` and increment `extra`.
8. Call `shuffle(unique.slice(0,4))` once.
9. Return exactly:

```js
{
  kind: 'expression',
  prompt: `${target} はいくつ？`,
  help: '落ち着いて数えましょう。',
  expression: line.join(' '),
  options: shuffledOptions,
  answer: String(count),
  duration: 8000
}
```

No target, line, count, density, correction, random trace, renderer state, or difficulty field is added. Valid helpers receive no extra calls. Hostile missing, throwing, non-finite, out-of-range, or malformed helpers still terminate through deterministic in-place fallbacks and produce one valid authored task; they never retry, loop on randomness, alter the field shape, or expose fallback metadata.

## Strict stored-task contract

Validation accepts only the exact seven keys above. It derives the target from the exact prompt, tokenises `expression` on its eleven literal single spaces, and requires:

- one of the three published targets;
- exactly 12 tokens in retained order and spacing;
- every token from `['★','●','▲','■']`;
- every non-target token from the exact corresponding `others` set;
- at least two target occurrences;
- `answer` equal to the derived decimal target count;
- `options` an exact four-value permutation of the published count option construction;
- exact kind, prompt, help, and 8000 ms duration.

Plain JSON resume renders and completes from these fields alone without mutation.

## Generic expression / choice parity

Current generic behavior is binding:

- render the full `expression` unchanged;
- render exactly four choices in stored shuffled order;
- correct and wrong choice both commit `{answerLabel:task.answer}` with correctness from strict equality against `task.answer`;
- 8000 ms timeout commits false with `{detail:'時間切れです。脳は定時退社しました。',answerLabel:task.answer}`;
- one selection locks all input and deadline can never replace it.

The module keeps a short 180 ms lifecycle-owned material response before committing. Reduced motion retains the same nonzero tracked response and owns no RAF.

## Information-preserving production finish

The generic expression becomes a compact original counting instrument without changing its information:

- one horizontal 12-well observation rail, never regrouped or reordered;
- each token occupies one equal neutral ceramic/glass well;
- every glyph remains verbatim, equally sized, equally lit, and equally spaced;
- no target occurrence gets a class, color, glow, outline, scale, animation, ARIA hint, or other pre-answer emphasis;
- a restrained plum instrument frame, brass registration marks, and paper/plastic depth establish material hierarchy;
- four numeric choices remain a neutral 2×2 panel in exact task order;
- focus is a gold dashed ring; pressed selection depresses one key;
- after input only, the chosen key receives green or rose material feedback;
- timeout dims the whole instrument without revealing target locations or the answer key.

The 12-well rail is a typographic rendering of the exact single-spaced expression, not a new grouping mechanic. It uses no decorative star, circle, triangle, or square outside the authored expression that could be mistaken for another draw.

## Input, accessibility, and lifecycle

- Native buttons have at least 56 CSS px touch height.
- Touch/pointer and native keyboard activation share one checker.
- Arrow keys move focus spatially through the 2×2 choice grid and clamp at boundaries.
- Tab focus, Enter, and Space remain native and visible.
- Rail ARIA reads the exact expression; each well identifies only ordinal and glyph, never target status.
- Choice ARIA gives ordinal and value only, never answer status.
- Initial/focus scenes contain no pre-highlight or answer clue.
- All DOM comes from `context.host.ownerDocument`.
- Feedback, deadline, listeners, and abort use only context-owned primitives.
- Dispose removes QA and leaves zero timer, listener, or frame jobs.
- No network, storage, audio, external asset, global DOM creation, or continuous RAF.
- Layout works at 390–430 CSS px and DPR is capped at 3 for inspection parity.

## Frozen parity gate

After explicit flow handoff, freeze representative authored traces for each target plus both correction edges:

1. target `★`, no correction;
2. target `●`, forced correction from zero targets using exact half ranges;
3. target `▲`, one-target correction preserving that occurrence plus the two forced overwrites.

Compare current LEGACY and MODULE at 393×852 and 402×874 DPR3, normal and reduced, for initial, keyboard focus, wrong, success, and timeout. Each of 120 frames / 60 pairs must preserve exact helper trace, target, 12-token expression/order/spacing, count, shuffled options/order, answer, generic payloads, deadline, and hidden-information boundary.

Supplemental browser gates cover real touch and keyboard 2×2 movement/activation/locks, 390/430, overflow/errors/external origins, performance, exact 8000 ms deadline, reduced feedback stages, and disposal. Browser work is forbidden until the flow lane is explicitly handed off.
