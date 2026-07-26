# spatial-rotation-v1 — Published compatibility port

Status: current-source parity port and isolated audit-lane browser/visual acceptance complete on all three degree tasks across legacy/module 393×852 and 402×874 DPR3 normal/reduced, with 390/430 supplemental smoke.

## Authority

This is a compatibility port of the **current** `app.js` v1.0 `spatial-rotation-v1` factory, generic `rotation` renderer, `makeChoices`, and generic timeout/result meaning. The banned historical implementation is not consulted. Published task data, random-call order, answer derivation, duration, and result payloads remain exact.

## Stable identity

- `id`: `spatial-rotation-v1`
- `introducedIn`: `1.0`
- `tier`: `1`
- `flavor`: `satisfying`
- `step`: `1`
- `family`: `spatial-rotation`
- `category`: `spatial`

## Exact generation

Generation performs exactly:

1. `degrees = pick([90,180,270])`
2. `arrows = ["↑","→","↓","←"]`
3. `answer = arrows[(degrees/90)%4]`
4. `options = shuffle(arrows)`

It returns exactly:

```js
{
  kind: "rotation",
  prompt: `この矢印を右に${degrees}度回すと？`,
  help: "首は回さなくて大丈夫です。",
  symbol: "↑",
  options,
  answer,
  duration: 6500
}
```

The arrow array order encodes a clockwise/right rotation. Therefore 90→`→`, 180→`↓`, 270→`←`. No degree normalization, changed direction, extra distractor, omitted shuffle, or helper-call reorder is allowed. Tasks remain plain JSON and resume without hidden state.

## Exact result meaning

The published generic choice result remains `{answerLabel:task.answer}` with correctness `selected === answer`. Timeout remains incorrect with:

```js
{
  detail: "時間切れです。脳は定時退社しました。",
  answerLabel: task.answer
}
```

The 6500ms deadline starts when choices are rendered. Input locks after the first choice or timeout, and finish commits once.

## Production visual enhancement without answer leak

The initial card retains the exact `↑` and exact degree text. A neutral circular compass-like plate, stationary start arrow, and non-directional `START` marker establish the rotation object. It never rotates, draws an endpoint, names a resulting direction, highlights a candidate, or animates toward the answer before choice. The four exact arrow options remain the only possible final orientations.

The option area is a 2×2 grid with clear focus. A short tracked 130ms normal / 90ms reduced terminal feedback stage marks the selected option before committing the unchanged result payload. There is no RAF or continuous animation.

## Input, accessibility, and lifetime

- Choice buttons support touch/click and native Enter/Space activation.
- Arrow keys move focus geometrically through the 2×2 grid; the first choice receives initial focus.
- Canvas backing is clamped to DPR3 and contains no final-orientation preview.
- DOM nodes come only from `context.host.ownerDocument`.
- Deadline, feedback stage, resize listener, QA API, and abort cleanup are context-owned.
- Dispose prevents pending feedback or timeout from finishing.
- No audio, network, runtime asset, emoji, direction labels, or external UI is used.

## Parity scenes

`initial`, `focus`, `wrong`, `success`, `timeout` across all three degree tasks, legacy/module modes, 393×852 and 402×874 DPR3, normal/reduced. Supplemental 390/430, actual touch/keyboard, deadline, dispose, and performance are reserved for explicit browser handoff.
