# prediction-shape-v1 — 交互のかたち

Status: published legacy-port specification; exhaustive Node and parity fixtures precede browser handoff.

## Published identity

- Stable ID: `prediction-shape-v1`
- Introduced: `1.15`
- Category: `prediction`
- Tier: `1`
- Flavor: `classic`
- Step: `1`
- Family: `prediction-shape`

## Exact generated task

The current `app.js` factory is the only task authority. Generation preserves its call order and seven-field result exactly:

1. Call injected `pick` once with these three pairs in this order:
   - `['○','△']`
   - `['●','□']`
   - `['☆','♡']`
2. Let the chosen pair be `[A,B]`.
3. Build `sequence:[A,B,A,B]` and `answer:A`.
4. Call injected `shuffle` once with `[A,B,'◇','▽']` in that order.
5. Return:

```js
{
  kind: 'pattern',
  prompt: '次に来るのは？',
  help: '交互にならんでいます。',
  sequence: [A,B,A,B],
  options: shuffledOptions,
  answer: A,
  duration: 6500
}
```

No path, length, difficulty, rule, family, proof, feedback, resume, theme, or renderer-only field is added to generated data. A malformed helper has one finite canonical fallback while still preserving `pick` before `shuffle`. The task remains JSON-serialisable and can be cloned into a fresh renderer without mutation.

Strict validation accepts only the exact seven fields, exact copy/kind/duration, one of the three authored A/B families, exact A/B/A/B sequence, answer A, and an exact permutation of `[A,B,'◇','▽']`. It rejects retuned symbols, longer patterns, alternate distractors, duplicate options, leaked rule annotations, and extras.

## Current generic-pattern parity

The current generic renderer is the interaction authority:

- Show all four sequence glyphs in order.
- Append one literal `?` as the fifth sequence item.
- Show exactly four symbol choices in the task’s shuffled order.
- A choice completes against `task.answer` with generic payload `{answerLabel:task.answer}` for both correct and wrong selection.
- The 6500 ms deadline completes false with `{detail:'時間切れです。脳は定時退社しました。',answerLabel:task.answer}`.
- Input and deadline can commit at most once.

The module may retain a short, nonzero, lifecycle-owned post-selection material response before committing, but must not change correctness or payload. All choices lock during that response. Reduced motion uses the same finite nonzero response without animated travel. No continuous animation frame runs.

## Information contract

- Every authored glyph remains verbatim; no font substitution turns one into another.
- The literal `?` remains visible at the end.
- No fifth sequence value, ghost answer, path line, highlighted A positions, answer-colored choice, rule diagram, frequency count, or other pre-answer cue is introduced.
- The published help remains exactly `交互にならんでいます。`; the module adds no further rule explanation.
- All four choices have the same pre-answer material, size, lighting, and semantic weight.
- Option order is task order, never sorted or rearranged by the renderer.

## Production-finish visual direction

Retain the published sequence-and-four-choices structure while making it feel like an original prediction instrument:

- a compact midnight-plum observation tray,
- five equal inset glass wells for the four symbols and `?`,
- ivory glyphs embossed into identical translucent lenses,
- restrained brass separators, corner fasteners, and a soft overhead reflection,
- four large 2×2 choice lenses using the same neutral material,
- touch depression plus a short green or rose internal lamp only after selection,
- timeout dims the same apparatus without revealing an answer.

No generic quiz-card stack, copied game styling, decorative symbol that resembles a fifth option, or external asset is used.

## Interaction and accessibility

- All choices are native buttons with at least 56 CSS px in both axes.
- Pointer/touch and native Enter/Space activation share one exact checker.
- Arrow keys navigate the 2×2 choice grid spatially; focus has a dashed gold ring distinct from selected feedback.
- Sequence ARIA text reads the four glyphs followed by `?`; each choice reads only its own glyph and position, not correctness.
- Input locks after one choice and after timeout.
- Correct, wrong, timeout, pressed, disabled, and focus states are explicit without relying on color alone.
- All nodes come from `context.host.ownerDocument`; scheduling/listeners/deadline are context-owned; abort removes QA and leaves no timer, frame, or listener alive.
- No network, audio, storage, raw browser lifetime primitive, or continuous RAF.

## Parity gate

After explicit isolated-lane handoff, freeze one task for each of the three A/B families and compare current LEGACY with MODULE at 393×852 and 402×874 DPR3 in normal and reduced motion for:

1. initial sequence/options,
2. keyboard focus,
3. wrong selection and generic payload,
4. success and generic payload,
5. exact timeout and payload.

Every plate must preserve sequence glyphs, literal `?`, option order, answer, result, and hidden-information boundary. Also verify real touch, native keyboard activation/focus, feedback input lock, 390/430 boundaries, overflow/errors/external requests, performance, exact deadline, and disposal. Browser work remains forbidden until flow is explicitly handed off.
