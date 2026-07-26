# memory-reverse-v1 — Compatibility Port Concept

Status: compatibility port implemented; exact v1.0 factory and `renderFlashChoice` semantics, corrected no-cue observation, same-task browser parity, and lifecycle review passed.

## Identity

- Stable ID: `memory-reverse-v1`
- Introduced: `1.0`
- Category: `memory`
- Family / step: `memory-reverse` / `1`
- Tier / flavor: `2` / `classic`

## Immutable generation

Generation performs exactly two shuffle calls, in this order:

1. `shuffle([1,2,3,4,5,6,7,8,9])`, then `.slice(0,4).map(String)` to create `shown`.
2. Build the four exact arrow-joined candidates and outer-shuffle them:
   - answer: reverse `[3,2,1,0]`
   - forward: `[0,1,2,3]`
   - shift: `[2,3,0,1]`
   - swap: `[3,1,2,0]`

The generated task has exactly:

```js
{
  kind: "flashChoice",
  prompt: "数字を逆から思い出して",
  help: "4つの順番を覚えてください。",
  afterHelp: "逆の順番はどれ？",
  shown,
  options,
  answer,
  duration: 8500
}
```

No digit may repeat, disappear, be added, or be replaced. The answer and all distractor transforms, arrow separators, option order from the second shuffle, and random-call order are immutable.

## Immutable render behavior

- Render immediately shows the four `shown` digits in exact source order.
- All four answer options are created disabled and hidden during observation.
- At exactly the current `FLASH_EXPOSURE_MS` default of `5000 ms`, the strip becomes covered, help changes exactly to `逆の順番はどれ？`, choices become visible/enabled, and the first deadline begins.
- Observation/cover stages remain exactly 5000 ms in normal and reduced-motion modes. There is no RAF.
- The recall deadline is exactly task `duration: 8500 ms`, beginning only when recall begins (therefore expiry is 13500 ms after initial render if uninterrupted).
- Choosing any option finishes immediately and once with exact `{answerLabel: task.answer}` and correctness `value === task.answer`.
- Timeout finishes incorrect and once with exact `{detail:"時間切れです。脳は定時退社しました。", answerLabel:task.answer}`.
- Choice focus, pointer/touch click, and native keyboard activation share the same path. Choice input is locked after finish.

## Visual compatibility and accessibility

- A production memory strip preserves the exact left-to-right digit order during observation.
- The strip must visibly cover every digit before choices appear; no answer, reverse cue, transform label, or success state leaks early.
- Recall keeps four choices in exact generated order with readable arrow separators.
- Observation and recall status are polite live regions. Buttons have native semantics and a high-contrast `:focus-visible` ring.
- The layout must fit 390–430 CSS px without horizontal overflow at DPR 3.
- Reduced motion preserves all semantics and timing while removing decorative transitions.

## Lifecycle

- Use `context.host.ownerDocument.createElement`, `context.later`, `context.listen`, and `context.setDeadline` only.
- No raw timers/listeners/RAF, network, audio, storage, emoji, or external assets.
- Disposal invalidates observation work, deadline, input, QA, and finish.
- Plain JSON tasks resume by replaying the exact observation/recall sequence; no hidden mutable state is persisted.

## Evidence gate

Focused tests pin exact helper inputs/call order and representative deterministic output, all eight task fields, transforms/options, strict validation, 5000 ms observation in normal/reduced motion, covered-before-enabled ordering, exact wrong/success/timeout results, 8500 ms recall deadline, input lock, focus/keyboard/pointer behavior, plain JSON resume, disposal, and forbidden paths.

After explicit screw handoff, same-task parity uses representative frozen digits/options in LEGACY/MODULE at 393×852 and 402×874 DPR 3, normal/reduced, across initial, flash, recall, focus, wrong, success, and timeout, plus real touch/keyboard/focus, 390/430 layout, errors/external/overflow, performance, deadline, and disposal.
