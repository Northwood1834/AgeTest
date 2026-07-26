# inhibition-parity-v1 — Published compatibility port

## Authority

This module is a compatibility port of the **current** `app.js` v1.0 `inhibition-parity-v1` factory, generic `task.kind === "choice"` renderer, `makeChoices`, and generic timeout. No historical revision is consulted.

## Stable identity

- `id`: `inhibition-parity-v1`
- `introducedIn`: `1.0`
- `tier`: `3`
- `flavor`: `quirky`
- `step`: `1`
- `family`: `inhibition-parity`
- `category`: `inhibition`

## Exact factory

There is exactly one random call:

```js
n = randomInt(12, 39)
```

Then:

```js
answer = n % 2 === 0 ? "押す" : "押さない"
```

The exact plain task is:

```js
{
  kind: "choice",
  prompt: `${n} は偶数。正しければ？`,
  help: "文章を最後まで読んで判断。",
  options: ["押す", "押さない"],
  answer,
  duration: 5000
}
```

The options remain in fixed order and are never shuffled. The number is encoded only in the exact prompt; no renderer field is added. The plain JSON task contains everything needed for resume.

## Exact generic result meaning

- Both choices are immediately available.
- The `5000ms` deadline starts on render.
- A choice immediately finishes with `correct = (value === answer)` and exactly `{answerLabel: answer}`.
- Timeout finishes incorrect with exactly `{detail:"時間切れです。脳は定時退社しました。", answerLabel:answer}`.
- Terminal input locks and finish commits once.

No random call, range, parity derivation, prompt character, help text, option order, answer, duration, or result field is retuned.

## Production visual enhancement with no parity cue

The number may be enlarged on a neutral DPR-aware card. Every integer from 12 through 39 uses the same DOM structure, class names, card material, dimensions, position, font family, size, weight, color, opacity, border, texture, and shadow. Rendering does not branch on odd/even and exposes no parity class or data attribute.

There is no answer marker, odd/even label, color code, alternate material, icon, badge, dot grouping, alternating layout, underline, border change, size change, or other answer cue. Only the number and the exact published sentence carry task information.

## Validation, input, motion, and disposal

- Validation requires the exact six-field published shape.
- The prompt must encode one integer from 12 through 39 and the answer must match its parity.
- Real touch/click and native Enter/Space use one generic choice path.
- The first fixed choice receives focus without scrolling; focus is fully inset.
- A terminal action synchronously paints one retained feedback stage before exact immediate finish.
- Reduced motion retains that feedback and books no continuous frame.
- All DOM is created from `context.host.ownerDocument`; deadline, listeners, resize, QA state, finish, and abort are context-owned.
- Dispose cancels unanswered deadline/input and cannot finish later.

## Acceptance evidence

### Focused Node

- 10,000 exact factory comparisons with one exact `randomInt(12,39)` call;
- all 28 values, exact prompts, even/odd answers, fixed options, and plain shape;
- strict mutation rejection and fresh-module plain JSON resume;
- exact success/wrong/timeout, immediate lock, one finish;
- touch/click, native Enter/Space, focus, DPR3, reduced retained feedback/zero frame, and real disposal;
- owner-document and forbidden lifecycle/network/audio/asset scans;
- source and DOM checks proving one identical number treatment with no parity selector, class, data attribute, or render branch.

### Browser parity after explicit lane handoff

Representative boundary/parity values `12`, `13`, `38`, and `39` are frozen and shared by LEGACY/MODULE at 393×852 and 402×874, DPR3, normal and reduced, for:

`initial`, `focus`, `wrong`, `success`, `timeout`.

That is 160 source frames. Reports compare exact random-derived tasks, prompt/number, fixed options/order, answer, result payload, focus, deadline, overflow, errors, and resources. The module's neutral card is documented as a visual-only enhancement.

Real 390/430 touch and keyboard controls, focus/scroll, immediate locks, actual 5000ms deadline, reduced feedback/zero-frame behavior, performance, and disposal run only after screw-lane handoff.
