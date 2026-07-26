# memory-missing-v1 — なかったもの

Status: published legacy-port specification; exhaustive Node and parity fixtures precede browser handoff.

## Published identity

- Stable ID: `memory-missing-v1`
- Introduced: `1.0`
- Category: `memory`
- Tier: `1`
- Flavor: `quirky`
- Step: `1`
- Family: `memory-missing`

## Exact generated task

The current `app.js` v1.0 factory is the sole task authority. Generation preserves this pool and random-call order exactly:

1. Define `['🍇','鍵','傘','月','猫','靴','山','時計','魚','本']` in that order.
2. Call injected `shuffle` with the complete ten-value pool and take its first five as `shown`.
3. Filter the original pool to the exact five values absent from `shown`.
4. Call injected `pick` with that absent-five order to choose `absent`.
5. Call injected `shuffle` with `shown` in its authored task order and take the first three as `others`.
6. Call injected `shuffle` with `[absent,...others]` in that order.
7. Return:

```js
{
  kind: 'flashChoice',
  prompt: 'なかったものを選んで',
  help: 'まず5つを覚えてください。',
  shown,
  options: shuffledOptions,
  answer: absent,
  duration: 7500
}
```

No exposure, after-help, category, icon, label, difficulty, renderer, feedback, or resume field is added. A malformed helper has one finite canonical fallback while still attempting full-pool `shuffle`, absent-set `pick`, shown-set `shuffle`, and outer `shuffle` in that order. The task remains plain, JSON-serialisable, cloneable, and unmutated by rendering.

Strict validation accepts only the exact seven fields and copy/kind/duration; five unique authored `shown` values; an authored answer absent from those five; and exactly four unique options containing that answer plus exactly three shown values. It rejects replacement icons, category groups, labels, duplicates, changed counts, non-shown distractors, answer leaks, retunes, and extras.

## Current flash-choice parity

Current `renderFlashChoice` is the interaction and timing authority:

- At render start, display all five `shown` values together and keep all choices hidden and disabled.
- Keep the observation exposure for exactly `FLASH_EXPOSURE_MS`, currently 5000 ms.
- At 5000 ms, cover all five observation values, change recall copy to the exact fallback `さっき、なかったものは？`, reveal all four choices in task order, and enable them together.
- Start the 7500 ms generic deadline only at recall onset, so timeout occurs at absolute 12500 ms from render.
- Correct and wrong choices use generic payload `{answerLabel:task.answer}`.
- Timeout uses `{detail:'時間切れです。脳は定時退社しました。',answerLabel:task.answer}`.
- Selection and deadline can commit at most once.

The module may retain a short, nonzero, lifecycle-owned post-selection material response before commit. It must not change phase timings, correctness, payload, task order, or deadline ownership. All choices lock during feedback. Reduced motion keeps the exact 5000 ms observation, 7500 ms recall deadline, and finite feedback without a continuous frame loop.

## Information contract

- Every authored value stays verbatim native text: `🍇`, `鍵`, `傘`, `月`, `猫`, `靴`, `山`, `時計`, `魚`, `本`.
- Observation presents exactly five equal-material values simultaneously, in `task.shown` order. No category grouping, size hierarchy, color association, numbering, icon substitution, or animation order is added.
- At recall onset all five fronts are concealed together before choices become available. No letter, silhouette, ghost, ARIA description, reflection, or residual glyph remains visible.
- Exactly four equal-material choices appear in task order. The absent answer is not highlighted, enlarged, moved, colored, badged, or described differently.
- No decorative object resembles a pool value and no category or language clue narrows the absent set.

## Production-finish visual direction

Retain the exact observation/conceal/recall structure while presenting it as an original lost-and-found memory tray:

- a compact deep-plum observation case with restrained ivory and brass trim,
- five equal frosted object tiles in one row, each showing only its exact native string,
- at 5000 ms all five tiles turn into identical blank backs in one atomic state change,
- four equal large 2×2 recall keys showing only the exact task option strings,
- tactile depression and a short green or rose internal response only after selection,
- timeout desaturates the closed tray without exposing or highlighting the answer.

No external image, replacement icon, canvas text, generic quiz-card stack, or decorative pool object is used.

## Interaction and accessibility

- Recall choices are native buttons with at least 56 CSS px in both axes.
- They are hidden and disabled throughout observation and become available together only at 5000 ms.
- Pointer/touch and native Enter/Space activation share one checker.
- Arrow keys navigate the 2×2 recall grid; focus uses a dashed gold ring distinct from selected feedback.
- During observation each tile exposes only its exact visible string. At recall every tile front is removed and marked hidden before options are enabled.
- Choice ARIA contains position and its own visible string, never correctness.
- Input locks after one choice and after timeout.
- All nodes come from `context.host.ownerDocument`; timing, deadline, listeners, and feedback are context-owned; abort removes QA and leaves no timer, frame, or listener alive.
- No network, audio, storage, raw browser lifetime primitive, or continuous RAF.

## Parity gate

After explicit isolated Flow-lane handoff, compare representative frozen shown sets, absent answers, and option orders in current LEGACY and MODULE at 393×852 and 402×874 DPR3, normal and reduced, for:

1. initial observation,
2. mid-exposure flash,
3. exact recall onset,
4. keyboard focus,
5. wrong selection and payload,
6. success and payload,
7. exact timeout and payload.

Every pair must preserve exact shown/options/order/answer, 5000 ms conceal/reveal boundary, 7500 ms recall deadline, result, and hidden-information boundary. Also verify real touch, native keyboard 2×2 activation/focus, input locks, 390/430 boundaries, overflow/errors/external requests, performance, last-moment deadline race, and disposal. Browser work remains forbidden until Flow is explicitly handed off.
