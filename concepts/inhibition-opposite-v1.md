# inhibition-opposite-v1 — Published compatibility port

## Authority

This is a compatibility port of the **current** `app.js` v1.0 `inhibition-opposite-v1` factory, generic `task.kind === "choice"` renderer, `makeChoices`, and generic timeout. No historical revision is consulted.

## Stable identity

- `id`: `inhibition-opposite-v1`
- `introducedIn`: `1.0`
- `tier`: `2`
- `flavor`: `classic`
- `step`: `1`
- `family`: `inhibition-opposite`
- `category`: `inhibition`

## Exact factory

There is exactly one random call:

```js
shown = pick(["左", "右"])
```

Then:

```js
answer = shown === "左" ? "右" : "左"
```

The exact six-field plain task is:

```js
{
  kind: "choice",
  prompt: `「${shown}」と反対を選んで`,
  help: "読んだとおりには押さない。",
  options: ["左", "右"],
  answer,
  duration: 4500
}
```

The options remain in fixed order and are never shuffled. The shown word is encoded only in the exact prompt; no renderer field is added. Plain JSON contains everything required for resume.

## Exact generic result meaning

- Both choices are immediately available.
- The `4500ms` deadline starts on render.
- A choice immediately finishes with `correct = (value === answer)` and exactly `{answerLabel: answer}`.
- Timeout finishes incorrect with exactly `{detail:"時間切れです。脳は定時退社しました。", answerLabel:answer}`.
- Terminal input locks and finish commits once.

No random call, shown/answer derivation, prompt character, help text, option order, answer, duration, or result field is retuned.

## Production visual enhancement with no directional cue

The already-visible shown word may be repeated at a larger size on a neutral DPR-aware card. `左` and `右` use the identical DOM structure, class names, dimensions, position, font family, size, weight, color, opacity, card material, border, texture, and shadow. Rendering never branches on the shown direction.

There are no arrows, chevrons, hands, directional icons, left/right labels, answer markers, badges, asymmetric positions, alternate colors/materials, side-weighted shadows, transforms, or other direction/answer cues. The fixed choices use equal-width neutral buttons in their exact published order.

## Validation, input, motion, and disposal

- Validation requires the exact six-field published shape.
- The prompt must encode exactly `左` or `右`; answer must be its opposite.
- Real touch/click and native Enter/Space use one generic choice path.
- The first fixed choice receives focus without scrolling; focus is fully inset.
- A terminal action synchronously paints one retained feedback stage before exact immediate finish.
- Reduced motion retains feedback and books no continuous frame.
- Every node comes from `context.host.ownerDocument`; deadline, listeners, resize, QA state, finish, and abort are context-owned.
- Dispose cancels unanswered deadline/input and cannot finish later.

## Acceptance evidence

### Focused Node

- 10,000 exact factory comparisons with one exact `pick([左,右])` call;
- both shown values, exact prompts, opposite answers, fixed options, and plain shape;
- strict mutation rejection and fresh-module plain resume;
- exact success/wrong/timeout, immediate lock, one finish;
- touch/click, native Enter/Space, focus, DPR3, reduced retained feedback/zero frame, and real disposal;
- owner-document and forbidden lifecycle/network/audio/asset scans;
- source and DOM checks proving one identical word treatment with no direction selector, class, data attribute, icon, asymmetric layout, or render branch.

### Browser parity

Both frozen shown values are shared by LEGACY and MODULE at 393×852 and 402×874, DPR3, normal and reduced, for:

`initial`, `focus`, `wrong`, `success`, `timeout`.

That is 80 source frames. Reports compare exact task/prompt/shown word, fixed options/order, opposite answer, result payload, focus, deadline, overflow, errors, and resources. The neutral word card is documented as visual-only enhancement.

Real 390/430 touch and keyboard controls, focus/scroll, immediate locks, actual 4500ms deadline, reduced feedback/zero-frame behavior, performance, and disposal complete on screw CDP9343/HTTP8863.
