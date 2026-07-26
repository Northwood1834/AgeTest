# spatial-cube-v1 — Published compatibility port

## Authority

This is a compatibility port of the **current** `app.js` definitions `CUBE_COLORS`, `CUBE_TURN_SEQUENCES`, `cubeFaceAfterTurns`, the `spatial-cube-v1` factory, and `renderCube`. No historical implementation is consulted. Rules, timing, answer derivation, and result meaning are unchanged.

## Stable identity

- `id`: `spatial-cube-v1`
- `introducedIn`: `1.0`
- `tier`: `2`
- `flavor`: `satisfying`
- `step`: `1`
- `family`: `spatial-cube`
- `category`: `spatial`

## Published data

### Color objects

Exactly six objects are shuffled, without changing their names or hex values:

1. `{name:"むらさき", hex:"#A66DC2"}`
2. `{name:"みどり", hex:"#6BAE8E"}`
3. `{name:"きいろ", hex:"#D5A93F"}`
4. `{name:"あお", hex:"#5A88BE"}`
5. `{name:"ピンク", hex:"#D983A0"}`
6. `{name:"しろ", hex:"#D8D4DC"}`

### Turn sequences

One current authored sequence is picked exactly:

```js
[
  ["right","up"], ["up","right"], ["right","left"], ["up","down"],
  ["right","up","left"], ["up","right","down"],
  ["right","left","up"], ["up","down","right"],
  ["right","left","right"], ["up","down","up"]
]
```

Labels remain:

- `right`: `右面→正面`
- `left`: `左面→正面`
- `up`: `上面→正面`
- `down`: `下面→正面`

### Face permutation

The face order is `[front,right,back,left,top,bottom]`, initially `[0,1,2,3,4,5]`. Each turn preserves the current permutation:

- right: `[right,back,left,front,top,bottom]`
- left: `[left,front,right,back,top,bottom]`
- up: `[top,right,bottom,left,back,front]`
- down: `[bottom,right,top,left,front,back]`

The answer is `colors[finalFrontIndex].name`.

### Exact task shape and random-call order

Generation performs:

1. `colors = shuffle(CUBE_COLORS)`
2. `turns = pick(CUBE_TURN_SEQUENCES)`
3. `answer = colors[cubeFaceAfterTurns(turns)].name`
4. `shuffle(non-answer colors)`, take three names
5. `shuffle([answer, ...three distractors])`

It returns exactly:

```js
{
  kind: "cube",
  prompt: "色の位置を覚えて、最後の正面は？",
  help: "見えている3面を覚えてください。回転すると色が隠れます。",
  colors, turns, answer, options,
  duration: 8500
}
```

Plain JSON resumes without hidden state.

## Current timing and result meaning

- Initial visible three-face encoding lasts exactly `2400ms`.
- At `2400ms`, every face is masked before any rotation, the authored turn list appears, and the help text announces the complete sequence. This prevents an answer leak.
- First hidden turn begins after an additional:
  - normal: `260ms`
  - reduced: `120ms`
- Each hidden turn then advances every:
  - normal: `700ms`
  - reduced: `320ms`
- The completion callback after the final turn marks every badge done, enables choices, changes help to `最後に正面へ来た色を、記憶で選んで。`, and only then starts the `8500ms` deadline.
- Choosing any option immediately finishes with `correct = (value === answer)` and payload `{answerLabel: answer}`.
- Timeout is incorrect with `{detail:"時間切れです。脳は定時退社しました。", answerLabel:answer}`.
- Input before choices is inert; input after a terminal result is locked; finish commits once.

## Production visual enhancement, same information

The same memory task is rendered as a crisp DPR3 authored cube scene:

- three visible faces are projected with depth, edge lighting, exact task colors, and exact color-name labels during the initial encoding;
- once hidden, all faces become neutral `?` faces before the first turn;
- authored numbered turn badges remain visible with active/done states;
- hidden turn stages update the exact face permutation without exposing a color or answer;
- choices appear only at the current completion time;
- wrong, success, and timeout remain distinct retained terminals.

No extra face, turn, hint, answer preview, color key, alternate scoring rule, asset, audio, or network request is introduced.

## Input, motion, and lifetime

- Choice buttons support touch/click and native Enter/Space.
- The first enabled choice receives focus; focus-visible styling is explicit.
- Normal mode uses tracked timers and visual CSS transitions only.
- Reduced mode uses the current shorter tracked delays, produces nonzero deterministic hidden-turn stages, and books no continuous frame.
- Every DOM node comes from `context.host.ownerDocument`; all timers/listeners/deadline/QA cleanup are context-owned.
- Dispose cancels the 2400ms encoding, turn stages, deadline, listeners, and any pending finish.
- No raw lifecycle primitive, network, audio, or external asset is used.

## Acceptance evidence

### Focused Node

- exact current constants and thousands of generation-by-generation random-call parity checks;
- all ten turn sequences and exact final-front answers;
- strict task validation and mutation rejection;
- plain JSON fresh-module resume;
- visible initial three faces, mask-before-turn, normal/reduced exact stage timings, choices only after completion;
- touch/keyboard/focus, correct/wrong payload parity, timeout, input locks, single finish, disposal;
- DPR3 393/402 layouts and all eight parity scenes;
- owner-document and forbidden-primitive scans.

### Browser parity after explicit handoff

One frozen task JSON is captured LEGACY and MODULE side-by-side at 393×852 and 402×874 DPR3, normal and reduced, for:

`initial`, `turn1`, `turn2`, `final-hidden`, `choices`, `wrong`, `success`, `timeout`.

That is 64 source frames. The report compares exact colors, turns, options, answer, face permutation, stage timing/result payloads, overflow/errors/resources, and documents the intentional visual-only enhancement. Real 390/430 interaction, performance, deadline, and disposal follow only after screw handoff.
