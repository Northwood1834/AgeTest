# spatial-flip-v1 — Published compatibility port

## Authority

This is a compatibility port of the **current** `app.js` `spatial-flip-v1` factory and current `kind === "rotation"` renderer branch. No historical revision is consulted. Factory randomness, arrow identity, options, answer, copy, duration, choice result, and deadline meaning remain unchanged.

## Stable identity

- `id`: `spatial-flip-v1`
- `introducedIn`: `1.15`
- `tier`: `1`
- `flavor`: `classic`
- `step`: `1`
- `family`: `spatial-flip`
- `category`: `spatial`

## Published factory

### Exact authored rows

```js
[
  ["→", "←"],
  ["←", "→"],
  ["↗", "↖"],
  ["↘", "↙"],
  ["↖", "↗"],
  ["↙", "↘"]
]
```

The first value is the visible source arrow. The second is its horizontal mirror and the answer. None is substituted with a simpler or pre-highlighted arrow.

### Exact random-call order

1. `r = pick(rows)`
2. `pool = ["→","←","↗","↖","↘","↙"].filter(value => value !== r[0] && value !== r[1])`
3. `shuffle(pool)`
4. take the first three shuffled pool arrows
5. `shuffle([r[1], ...three distractors])`

The source and answer arrows are both excluded from the distractor pool. The nested shuffle and outer option shuffle are distinct calls in this order.

### Exact plain task

```js
{
  kind: "rotation",
  prompt: "左右をひっくり返すと？",
  help: "鏡に映した形です。",
  symbol: r[0],
  options,
  answer: r[1],
  duration: 6500
}
```

A JSON round trip contains everything needed to resume.

## Current renderer and result semantics

- The source arrow is visible immediately.
- All four options are visible and enabled immediately.
- The `6500ms` deadline starts when rendering starts.
- Choosing an option finishes immediately with `correct = (value === answer)` and exactly `{answerLabel: answer}`.
- Timeout finishes incorrect with exactly `{detail:"時間切れです。脳は定時退社しました。", answerLabel:answer}`.
- A terminal result locks every further input and can commit only once.
- No pair is removed, no arrow is pre-highlighted, and the duration is not retuned.

## Production visual enhancement, unchanged information

The current big-symbol choice exercise becomes a crisp DPR-aware mirror workshop:

- the exact source arrow is printed on a raised material tile;
- a polished mirror edge and a frosted `?` panel communicate horizontal reflection without drawing the answer;
- the mirror answer is never previewed or encoded through highlights;
- the same four authored arrow options remain the only choices;
- focus, wrong, success, and timeout retain distinct high-contrast feedback.

The enhancement changes depth, lighting, material, and hierarchy only. It does not introduce a transformed arrow, explanatory direction cue, alternate rule, asset, audio, or network request.

## Input, motion, and lifetime

- Buttons support real touch/click and Enter/Space.
- The first option receives focus without scrolling and has a visible focus ring.
- Choosing paints a retained terminal feedback stage synchronously before the exact immediate finish; this preserves current result timing.
- Reduced motion retains that nonzero feedback state and books no continuous frame. The renderer uses no untracked frame or timer.
- Every element comes from `context.host.ownerDocument`.
- Deadline, listeners, finish, QA state, and disposal are context-owned.
- Dispose during an unanswered task cancels the deadline and listeners and cannot finish later.

## Acceptance evidence

### Focused Node

- exact generation-by-generation random-call parity across all six rows;
- exact pool exclusion and nested/outer shuffle order;
- validation mutation rejection and plain JSON fresh-module resume;
- exact source symbol, options, answer, immediate success/wrong payload, deadline payload, input lock, and one finish;
- touch/click, Enter/Space, focus, DPR3, feedback state, reduced zero-frame behavior, and real disposal;
- `ownerDocument` plus forbidden lifecycle/network/audio/asset scans;
- all five parity scenes for every authored row at 393 and 402.

### Browser parity after explicit handoff

For each of the six authored pairs, one frozen task is shared by LEGACY and MODULE at 393×852 and 402×874, DPR3, normal and reduced, in:

`initial`, `focus`, `wrong`, `success`, `timeout`.

That is 240 source frames. Reports compare exact task JSON, source/answer pair, pool exclusion, option order, selected value, result payload, deadline, overflow, errors, and resources. The canvas/material enhancement is explicitly visual-only.

Real 390/430 touch, keyboard, focus, wrong/success lock, actual 6500ms deadline, reduced feedback/zero-frame behavior, performance, and disposal run only after lane handoff.
