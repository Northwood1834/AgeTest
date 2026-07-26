# inhibition-rule-switch-v1 — Published compatibility port

## Authority

Compatibility port of the **current** `app.js` v1.0 `inhibition-rule-switch-v1` factory, generic `task.kind === "choice"` renderer, `makeChoices`, and generic timeout. No historical revision is consulted.

## Stable identity

- `id`: `inhibition-rule-switch-v1`
- `introducedIn`: `1.0`
- `tier`: `3`
- `flavor`: `classic`
- `step`: `1`
- `family`: `inhibition-rule-switch`
- `category`: `inhibition`

## Exact factory

Exactly one random call:

```js
n = randomInt(10, 29)
answer = n % 2 === 0 ? "押さない" : "押す"
```

Exact six-field plain task:

```js
{
  kind: "choice",
  prompt: `${n}：奇数なら押す、偶数なら押さない`,
  help: "いつもの偶数問題とルールが逆です。",
  options: ["押す", "押さない"],
  answer,
  duration: 5000
}
```

Options remain fixed and unshuffled. The number and complete rule are encoded only in the exact prompt; no renderer field is added. JSON contains everything required for resume.

## Exact generic results

- Both choices are immediately available and the `5000ms` deadline starts on render.
- Choice finishes immediately with `correct = (value === answer)` and exactly `{answerLabel: answer}`.
- Timeout finishes incorrect with exactly `{detail:"時間切れです。脳は定時退社しました。", answerLabel:answer}`.
- Terminal input locks and finish commits once.

No range, random call, odd/even rule, prompt character, help, option order, answer, duration, or result field is retuned.

## Production visual enhancement with no parity cue

The number and already-visible rule may be repeated on a neutral DPR-aware card. Every integer from 10 through 29 uses the identical DOM structure/classes, dimensions, positions, number and rule typography, colors, opacity, material, border, texture, and shadow. Rendering never branches on odd/even.

There is no parity color, icon, dot grouping, odd/even badge, answer marker, side positioning, alternating material, emphasis on one rule clause, or other answer cue. The two rule clauses receive equal type treatment. Fixed choices are equal-width neutral buttons in exact order.

## Validation, input, motion, disposal

- Strict validation requires the exact six-field published shape, an exact prompt with integer 10–29, and answer matching the published odd/even rule.
- Touch/click and native Enter/Space share one generic choice path; first choice receives fully inset focus without scrolling.
- Terminal action synchronously paints one retained feedback stage before exact immediate finish.
- Reduced motion retains feedback and books no continuous frame.
- Every node uses `context.host.ownerDocument`; deadline, listeners, resize, QA, finish, and abort are context-owned.
- Dispose cancels unanswered deadline/input and cannot finish later.

## Acceptance evidence

Focused Node compares 10,000 exact factories, covers all 20 values, strict mutations/plain resume/results/input/DPR3/reduced/disposal and source no-cue policy.

Browser parity freezes representative boundaries/parities `10`, `11`, `28`, `29` for LEGACY and MODULE at 393×852 and 402×874, DPR3, normal/reduced, and `initial`, `focus`, `wrong`, `success`, `timeout`: 160 source frames. It compares exact task/prompt/rule/fixed options/answer/results and proves odd/even computed treatment equality.

Real 390/430 touch/keyboard/focus/locks, actual 5000ms deadline, reduced feedback/zero RAF, performance, overflow/errors/external resources, and disposal complete on screw CDP9343/HTTP8863.
