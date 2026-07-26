# reaction-shape-v1 — かたち即答

Status: published legacy-port specification; exhaustive Node and parity fixtures precede browser handoff.

## Published identity

- Stable ID: `reaction-shape-v1`
- Introduced: `1.15`
- Category: `reaction`
- Tier: `1`
- Flavor: `classic`
- Step: `1`
- Family: `reaction-shape`

## Exact generated task

The current `app.js` v1.15 factory is the sole task authority. Generation preserves its random-call order and seven-field result exactly:

1. Call injected `pick` once with `['まる','さんかく','しかく']` in that order.
2. Map the chosen answer through exactly `{まる:'●',さんかく:'▲',しかく:'■'}`.
3. Call injected `shuffle` once with `['まる','さんかく','しかく']` in that order.
4. Return:

```js
{
  kind: 'rotation',
  prompt: `${mark} の名前は？`,
  help: '見たままを選んでください。',
  symbol: mark,
  options: shuffledNames,
  answer: chosenName,
  duration: 5000
}
```

No color, color name, alternate mark, extra shape, shortened option set, difficulty, speed, feedback, resume, renderer, or rule field is added. A malformed helper has one finite canonical fallback while still attempting `pick` before `shuffle`. The generated task stays JSON-serialisable, plain, and cloneable into a fresh renderer without mutation.

Strict validation accepts only the exact seven fields, exact copy/kind/duration, one exact authored answer/mark/prompt relationship, and an exact permutation of the three authored names. It rejects semantic retunes, mismatched names and marks, added shapes, reduced or duplicate options, labels, colors, and extra fields.

## Current generic-rotation parity

The current generic renderer and `makeChoices(task,{symbol:true})` define interaction parity:

- Show `task.symbol` as one large mark.
- Show exactly three choices in `task.options` order; the third occupies the full second row.
- A choice completes against `task.answer` with generic payload `{answerLabel:task.answer}` for both correct and wrong selection.
- The exact 5000 ms deadline completes false with `{detail:'時間切れです。脳は定時退社しました。',answerLabel:task.answer}`.
- Selection and deadline can commit at most once.

The module may retain a short, nonzero, lifecycle-owned post-selection material response before committing. It must not change correctness, answer, payload, option order, or deadline ownership. All choices lock during that response. Reduced motion retains the finite response with no animated travel and no continuous animation frame.

## Information contract

- `●`, `▲`, and `■` remain verbatim text marks; no CSS reconstruction or font substitution changes the authored symbol.
- Before choice, the symbol card contains the mark only. It never shows `まる`, `さんかく`, or `しかく`, a matching outline, answer badge, highlighted choice, or correctness cue.
- All three choices have identical neutral materials, dimensions within their grid role, lighting, and semantic weight before selection.
- No color coding, color legend, extra shape, decorative competing mark, shape-name caption, sorted option order, or reduced choice set is introduced.
- The published prompt and help remain exact; no additional naming clue appears.

## Production-finish visual direction

Retain the published one-symbol-and-three-name structure while presenting it as an original quick-identification instrument:

- a compact graphite-and-ivory reaction scanner,
- one large neutral frosted symbol viewport with the authored mark centered exactly,
- restrained brass registration ticks and a soft overhead reflection that do not resemble answer shapes,
- three large neutral name keys in the current two-plus-full-row layout,
- tactile depression and a short green or rose internal response only after selection,
- timeout desaturates the same apparatus without naming or highlighting the answer.

No generic quiz-card stack, color-to-shape association, external asset, canvas redraw, or decorative shape vocabulary is used.

## Interaction and accessibility

- All three choices are native buttons with at least 56 CSS px in both axes.
- Pointer/touch and native Enter/Space activation share one checker.
- Arrow keys follow the two-plus-full-row geometry; focus uses a dashed gold ring distinct from selected feedback.
- Symbol ARIA contains only the authored mark. Choice ARIA contains only position and its own visible name, never correctness.
- Input locks after one choice and after timeout.
- Correct, wrong, timeout, pressed, disabled, and focus states are explicit without relying only on color.
- All nodes come from `context.host.ownerDocument`; scheduling, deadline, and listeners are context-owned; abort removes QA and leaves no timer, frame, or listener alive.
- No network, audio, storage, raw browser lifetime primitive, or continuous RAF.

## Parity gate

After explicit isolated Flow-lane handoff, freeze one exact task for each of the three shapes and compare current LEGACY with MODULE at 393×852 and 402×874 DPR3, normal and reduced, for:

1. initial symbol and options,
2. keyboard focus,
3. wrong selection and generic payload,
4. success and generic payload,
5. exact timeout and payload.

Every plate must preserve mark, prompt, option order, answer, result, and hidden-information boundary. Also verify real touch, native keyboard activation/focus, feedback input lock, 390/430 boundaries, overflow/errors/external requests, performance, exact deadline race, and disposal. Browser work remains forbidden until Flow is explicitly handed off.
