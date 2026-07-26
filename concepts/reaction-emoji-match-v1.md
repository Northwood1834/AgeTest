# reaction-emoji-match-v1 — 顔合わせ即答

Status: published legacy-port specification; exhaustive Node and parity fixtures precede browser handoff.

## Published identity

- Stable ID: `reaction-emoji-match-v1`
- Introduced: `1.0`
- Category: `reaction`
- Tier: `1`
- Flavor: `quirky`
- Step: `1`
- Family: `reaction-emoji-match`

## Exact generated task

The current `app.js` v1.0 factory is the sole task authority. Generation preserves its pool and random-call order exactly:

1. Define `['😀','🤓','🤑','🐼','🐶','🐱']` in that order.
2. Call injected `pick` once with that complete pool to choose `answer`.
3. Filter the original pool to the five values not equal to `answer`.
4. Call injected `shuffle` once with that filtered five-value order, then take exactly its first three values.
5. Build `[answer,...threeDistractors]`.
6. Call injected `shuffle` once with those four candidates.
7. Return:

```js
{
  kind: 'choice',
  prompt: `${answer} と同じ顔をすぐ選んで`,
  help: '同じものをタップ。',
  options: shuffledCandidates,
  answer,
  duration: 4000
}
```

No replacement icon, alias, label, alternate pool, extra or missing candidate, speed tier, difficulty, renderer, feedback, or resume field is added. A malformed helper has one finite canonical fallback while still attempting `pick`, inner distractor `shuffle`, and outer candidate `shuffle` in that order. Generated data remains plain, JSON-serialisable, cloneable, and unmutated by render.

Strict validation accepts only the exact six fields, copy/kind/duration, one exact authored answer and interpolated prompt, and exactly four unique pool values containing that answer. It rejects replaced glyphs, labels, duplicates, five or three choices, mismatched prompts, alternate duration, and extras.

## Current generic-choice parity

The current generic `choice` renderer and `makeChoices(task)` define interaction parity:

- The published prompt presents the target face.
- Exactly four choices appear in `task.options` order.
- A choice completes against `task.answer` with generic payload `{answerLabel:task.answer}` for both correct and wrong selection.
- The exact 4000 ms deadline completes false with `{detail:'時間切れです。脳は定時退社しました。',answerLabel:task.answer}`.
- Choice and deadline can commit at most once.

The module may repeat the already-published prompt emoji inside one production reaction viewport and retain a short, nonzero, lifecycle-owned post-selection response before committing. It must not change any glyph, candidate, answer, order, correctness, payload, or deadline. All four choices lock during feedback. Reduced motion retains a finite visible response without animated travel or continuous animation frames.

## Information contract

- All six pool entries remain exact native Unicode text: `😀`, `🤓`, `🤑`, `🐼`, `🐶`, `🐱`.
- The target viewport, when present, contains only the same emoji already present in the exact prompt; it adds no name, icon, outline substitute, arrow, or descriptive label.
- Before selection, every option uses identical material, size, lighting, and semantic weight. The matching option is not pre-highlighted, enlarged, moved, colored, badged, or described differently.
- Options remain in task order and are never sorted by species or face type.
- Exactly four candidates remain visible; no candidate is hidden, merged, or replaced.
- No decorative emoji competes with the target or choices.

## Production-finish visual direction

Retain the current prompt-and-four-options structure while presenting it as an original quick-match reaction console:

- a compact midnight-blue signal receiver with warm ivory trim,
- one framed target viewport repeating the exact prompt emoji at large native-glyph size,
- subtle nonfigurative registration bars and glass reflections,
- four equal neutral 2×2 response pads showing only the exact native emoji glyphs,
- tactile depression plus a short green or rose internal response only after selection,
- timeout desaturates the console without highlighting the match.

No external image, custom icon redraw, image asset, canvas glyph, generic quiz-card stack, or additional face is used.

## Interaction and accessibility

- All four options are native buttons with at least 56 CSS px in both axes.
- Pointer/touch and native Enter/Space activation share one checker.
- Arrow keys navigate the 2×2 grid spatially; focus uses a dashed gold ring distinct from selected feedback.
- Target ARIA contains only the exact emoji. Choice ARIA contains only position and its own visible emoji, never correctness.
- Input locks after one choice and after timeout.
- Correct, wrong, timeout, pressed, disabled, and focus states are explicit without relying only on color.
- All nodes come from `context.host.ownerDocument`; scheduling, deadline, and listeners are context-owned; abort removes QA and leaves no timer, frame, or listener alive.
- No network, audio, storage, raw browser lifetime primitive, or continuous RAF.

## Parity gate

After explicit isolated Flow-lane handoff, freeze one representative four-option task for each of all six answers and compare current LEGACY with MODULE at 393×852 and 402×874 DPR3, normal and reduced, for:

1. initial target/options,
2. keyboard focus,
3. wrong selection and generic payload,
4. success and generic payload,
5. exact timeout and payload.

That is 120 semantic pairs and 240 canonical source frames. Every pair must preserve exact prompt target, native glyphs, option order, answer, result, and hidden-information boundary. Also verify real touch, native keyboard 2×2 activation/focus, feedback locks, 390/430 boundaries, overflow/errors/external requests, performance, exact deadline race, and disposal. Browser work remains forbidden until Flow is explicitly handed off.
