# prediction-lane3d-v1 — 安全なレーンを未来予知

Status: compatibility port implemented; semantic, same-task browser parity, lifecycle, and independent full-resolution review passed.

## Published contract

Source of truth is the current legacy factory and `renderLane3D` in `app.js`. The unpublished architecture experiment is not consulted.

The generated task shape and rules remain exactly:

```js
{
  kind: "lane3d",
  prompt: "安全なレーンを未来予知",
  help: "障害物がない道を選んで。",
  lanes: [/* exactly three emoji strings */],
  options: ["左", "中央", "右"],
  answer: /* option at the safe index */,
  duration: 7000
}
```

Generation chooses one safe integer index from 0 through 2. That lane uses one current safe marker from `✨`, `🍀`, `⭐`; each other lane independently uses one current hazard marker from `🚗`, `🚌`, `🦖`. Hazard duplicates remain allowed exactly as in the legacy picker. No `safe` field, layout seed, phase, or answer hint is added to stored task data. A published plain JSON task therefore resumes unchanged.

Validation derives the safe index from the one safe marker, requires two current hazard markers, exact ordered options, exact prompt/help/kind/duration, and requires the answer to be the option at that safe index. It does not retune probability or content.

## Interaction parity

The player makes exactly one lane choice. Pointer activation and keyboard arrows plus Enter call the same choice function. Input locks on the first choice. Correct choice finishes true once; either wrong lane finishes false once and retains the published correct answer label. The 7000ms deadline finishes false once without a choice. Dispose cancels every pending stage and cannot commit.

## Visual port

The legacy baseline is the current three-strip perspective road: pale sky and green horizon, a dark foreshortened road, dashed lane separators, and one future marker centered in each lane. The module keeps that exact information hierarchy and all three markers visible simultaneously.

The production port may improve finish without changing information:

- deeper sky gradient, distant geometric skyline, grass shoulders, guard studs, and road aggregate;
- three clearly bounded perspective lanes with readable far-future emoji markers;
- focus/selected lane rim tied only to the option currently focused or chosen, never to safety before the choice;
- a nonzero deterministic lock-on stage and approach stage after the single choice;
- compact terminal panel that preserves all three lanes, chosen lane, correct answer, and timeout state.

Normal and reduced motion both use tracked nonzero stages. Reduced motion never starts a continuous RAF. No audio, network, external asset, storage, raw timer, raw listener, or global document construction is introduced.

## Required parity evidence

The parity fixture holds one exact JSON task constant for both implementations:

```json
{"kind":"lane3d","prompt":"安全なレーンを未来予知","help":"障害物がない道を選んで。","lanes":["🚗","🍀","🦖"],"options":["左","中央","右"],"answer":"中央","duration":7000}
```

At 393×852 and 402×874 CSS pixels, DPR3, capture legacy and module full-resolution source frames for initial, focus, wrong, success, and timeout in normal and reduced modes. Every pair records byte-identical task JSON and the same focused/chosen option. Side-by-side review must show semantic parity while explicitly disclosing the visual depth, focus, causal stage, and terminal-panel enhancements.

Supplemental acceptance covers 390×844 and 430×932, pointer choice, ArrowLeft/ArrowRight/Enter, visible focus, minimum targets, no horizontal overflow, errors or external requests, tracked reduced stages, deadline, dispose, and generation/render performance.
