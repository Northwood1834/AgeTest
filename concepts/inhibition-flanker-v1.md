# inhibition-flanker-v1 — Published compatibility port

## Authority

This is a compatibility port of the **current** `app.js` v1.0 `inhibition-flanker-v1` factory, generic `task.kind === "flanker"` branch, and `makeChoices`. No historical revision is consulted. The answer pick, derived arrows, exact line, fixed options, copy, deadline, and generic result meaning are unchanged.

## Stable identity

- `id`: `inhibition-flanker-v1`
- `introducedIn`: `1.0`
- `tier`: `1`
- `flavor`: `classic`
- `step`: `1`
- `family`: `inhibition-flanker`
- `category`: `inhibition`

## Exact factory

There is exactly one random call:

```js
answer = pick(["左", "右"])
```

Then:

```js
center = answer === "左" ? "←" : "→"
outer  = answer === "左" ? "→" : "←"
line   = `${outer} ${outer} ${center} ${outer} ${outer}`
```

The exact plain task is:

```js
{
  kind: "flanker",
  prompt: "真ん中の矢印はどっち？",
  help: "外野の声は無視。",
  line,
  options: ["左", "右"],
  answer,
  duration: 5500
}
```

The option order is fixed and is never shuffled. There are exactly five arrows, one ASCII space between neighboring arrows, two identical outer arrows on either side, and no additional renderer field. JSON contains everything needed to resume.

## Current renderer and result meaning

- The exact five-arrow `line` appears immediately.
- Both fixed choices appear immediately.
- The `5500ms` deadline starts on render.
- A choice finishes immediately with `correct = (value === answer)` and exactly `{answerLabel: answer}`.
- Timeout finishes incorrect with exactly `{detail:"時間切れです。脳は定時退社しました。", answerLabel:answer}`.
- Terminal input locks and finish commits once.

There is no center highlight, size difference, color difference, spacing cue, extra arrow, extra option, shuffled option order, or duration retune.

## Production visual enhancement, unchanged information

The exact line is set on a crisp DPR-aware neutral rail. The five arrow glyphs use one font, size, weight, color, opacity, shadow, and material treatment. The rail is uniform and unsegmented; it does not call out the center. Center position alone carries the task meaning, exactly as in the current renderer.

Neutral depth, paper/metal grain, border, and shadow may be enhanced. No center mark, label, chip, icon, crosshair, brighter area, larger glyph, colored glyph, or transformed arrow is introduced.

## Input, motion, and lifetime

- Real touch/click and native Enter/Space share the generic choice path.
- ArrowLeft and ArrowRight move focus to the fixed `左` and `右` choices without choosing or changing semantics; Enter/Space confirms.
- The first choice receives focus without scrolling, and focus is fully inset.
- A terminal choice synchronously paints one retained feedback stage before the exact immediate finish.
- Reduced motion retains that nonzero feedback state and books no continuous frame.
- All DOM comes from `context.host.ownerDocument`; deadline, listeners, resize, finish, QA state, and disposal are context-owned.
- Dispose cancels the unanswered deadline/listeners and cannot finish later.

## Acceptance evidence

### Focused Node

- thousands of exact generation-by-generation comparisons with exactly one answer pick;
- both exact direction tasks, derived center/outer arrows, five-arrow line and fixed options;
- validation mutation rejection and plain JSON fresh-module resume;
- exact success/wrong and generic timeout payloads, immediate lock and one finish;
- touch/click, Enter/Space, ArrowLeft/ArrowRight focus, DPR3, reduced feedback/zero-frame state, and real disposal;
- owner-document and forbidden lifecycle/network/audio/asset scans;
- equal glyph/material treatment checks with no center-specific selector or paint.

### Browser parity after explicit handoff

Both frozen direction tasks are shared by LEGACY and MODULE at 393×852 and 402×874, DPR3, normal and reduced, for:

`initial`, `focus`, `wrong`, `success`, `timeout`.

That is 80 source frames. Reports compare exact task, line, fixed options/order, answer, selected value, payload, focus, deadline, overflow, errors, and resources and document the uniform-rail material enhancement.

Real 390/430 touch, directional keyboard focus plus Enter/Space, immediate locks, actual 5500ms deadline, reduced feedback/zero-frame behavior, performance, and disposal run only after lane handoff.
