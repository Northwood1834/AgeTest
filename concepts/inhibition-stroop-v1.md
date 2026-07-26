# inhibition-stroop-v1 — Published compatibility port

## Authority

This is a compatibility port of the **current** `app.js` `COLOR_NAMES`, `COLOR_CLASSES`, `inhibition-stroop-v1` factory, `task.kind === "stroop"` renderer branch, and `makeChoices`. No historical revision is consulted. Randomness, text, ink mapping, options, answer, deadline, and result meaning remain unchanged.

## Stable identity

- `id`: `inhibition-stroop-v1`
- `introducedIn`: `1.0`
- `tier`: `1`
- `flavor`: `classic`
- `step`: `1`
- `family`: `inhibition-stroop`
- `category`: `inhibition`

## Published colors

The exact ordered color-name array is:

```js
["むらさき", "みどり", "オレンジ", "あお"]
```

The exact classes and current visible CSS colors are:

| Name | Class | CSS color |
|---|---|---|
| むらさき | `ink-purple` | `#8B52B0` |
| みどり | `ink-green` | `#408B68` |
| オレンジ | `ink-orange` | `#D77A32` |
| あお | `ink-blue` | `#3E79B7` |

## Exact factory and call order

1. `word = pick(COLOR_NAMES)`
2. build `COLOR_NAMES.filter(x => x !== word)` in published order
3. `ink = pick(filteredColors)`
4. `options = shuffle(COLOR_NAMES)`
5. `answer = ink`

The word and ink are never equal. No option is removed; every task has all four names exactly once.

The exact plain task is:

```js
{
  kind: "stroop",
  prompt: "文字ではなく、インクの色は？",
  help: "読んだら負け。見てください。",
  word,
  ink,
  options,
  answer: ink,
  duration: 6500
}
```

A JSON round trip contains all state needed to resume.

## Current renderer and result semantics

- The exact `word` text is shown immediately in the exact mapped `ink` color.
- The same four text-only color-name options are visible and enabled immediately in a 2×2 choice grid.
- The `6500ms` deadline starts on render.
- Choosing an option finishes immediately with `correct = (value === ink)` and exactly `{answerLabel: ink}`.
- Timeout finishes incorrect with exactly `{detail:"時間切れです。脳は定時退社しました。", answerLabel:ink}`.
- Terminal input is locked and finish can commit only once.

There is no same word/ink pair, pre-highlight, color label, chip, icon, sample patch, option tint, reduced option count, or duration retune.

## Production visual enhancement, unchanged information

The word is printed on a crisp DPR-aware neutral paper card with restrained neutral depth and paper grain. Only the word glyph carries the ink color. The background, border, shadows, and all options remain neutral, so no area, contrast treatment, badge, icon, or decoration reveals the answer beyond the ink of the original word itself. The glyph uses the exact current color mapping and current subtle dark edge treatment.

Wrong, success, and timeout may reveal the answer only after the terminal choice, matching generic feedback semantics. The enhancement changes material and hierarchy only; it introduces no clue, asset, audio, or network request.

## Input, motion, and lifetime

- Real touch/click and Enter/Space share the same choice path.
- The 2×2 grid focuses its first option without scrolling and uses a fully inset visible focus treatment.
- A terminal choice synchronously paints one retained feedback stage before the exact immediate finish.
- Reduced motion retains that nonzero feedback state and books no continuous frame.
- Every node is created from `context.host.ownerDocument`.
- Deadline, listeners, finish, QA state, resize, and disposal are context-owned.
- Dispose cancels the unanswered deadline and listeners and cannot finish later.

## Acceptance evidence

### Focused Node

- thousands of exact generation-by-generation random-call comparisons;
- all 12 ordered unequal word/ink combinations;
- exact option completeness, class/color mapping, task copy, answer, and duration;
- validation mutation rejection and plain JSON fresh-module resume;
- exact immediate success/wrong and timeout payloads, one finish and lock;
- touch/click, Enter/Space, 2×2 focus, DPR3, normal/reduced feedback state, zero frames, and real disposal;
- owner-document and forbidden lifecycle/network/audio/asset scans.

### Browser parity after explicit handoff

Each of all 12 ordered unequal word/ink combinations has one frozen task shared by LEGACY and MODULE at 393×852 and 402×874, DPR3, normal and reduced, for:

`initial`, `focus`, `wrong`, `success`, `timeout`.

That is 480 source frames. The report checks exact task JSON, word/ink pair, CSS class/color mapping, all four options/order, selected value, payload, deadline, focus, overflow, errors, and resources, and documents the neutral-material visual enhancement.

Real 390/430 touch, Enter/Space, focus, immediate locks, actual 6500ms deadline, reduced feedback/zero-frame behavior, performance, and disposal run only after lane handoff.
