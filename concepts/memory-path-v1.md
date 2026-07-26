# memory-path-v1 — 光の順路

Status: legacy-port specification; Node and parity fixtures precede isolated browser handoff.

## Published identity

- Stable ID: `memory-path-v1`
- Introduced: `1.0`
- Category: `memory`
- Tier: `1`
- Flavor: `classic`
- Step: `1`
- Family: `memory-path`

## Published task contract

The generated task remains exactly the current published legacy shape:

```js
{
  kind: "memoryPath",
  prompt: "光る順番を覚えて",
  help: "あとで同じ順番にタップ。",
  path: shuffle([0,1,2,3,4,5,6,7,8]).slice(0,3),
  duration: 7200
}
```

No path-length, difficulty, visual-theme, proof, resume-state, or other generated field is added. The task remains plain JSON-compatible data. Generation calls the injected shuffle over all nine cell IDs and takes the first three; a hostile or malformed helper falls back once to `[0,1,2]` without looping.

The renderer also preserves the existing optional legacy timing hook: if an otherwise exact frozen task has a positive integer `recallAfterMs`, recall begins then; otherwise recall begins at exactly 5000 ms. The generated task never adds this optional field.

Validation is strict: exact copy, kind, duration, three distinct safe integer cells from 0 through 8, only the five generated keys (plus the named optional legacy recall hook when supplied), and no extras.

## Exact timing and outcome parity

All scheduling is lifecycle-owned by `context`.

- First flash turns on at 600 ms.
- Later flashes turn on every 1300 ms: 600, 1900, and 3200 ms.
- Every flash remains on for exactly 750 ms and turns off at 1350, 2650, and 3950 ms.
- Recall starts at `task.recallAfterMs || 5000`.
- At recall, all nine cells become available and visible help changes exactly to `同じ順番でタップしてください。`.
- The 7200 ms deadline starts only when recall starts.
- Each correct tap adds the published `chosen` pulse for exactly 180 ms and advances the cursor by one.
- A wrong tap ends immediately with `{detail:"順番が迷子になりました。"}`.
- The third correct tap ends immediately with `{quality:clamp(1-elapsed/9000,0,1), detail:"順番どおりです。"}`, where elapsed is measured from render/question start just as in the current implementation.
- Deadline ends immediately with `{detail:"記憶が時間切れになりました。"}`.
- Every path commits at most once.

Neither reduced motion nor production styling changes flash order, exposure, intervals, recall time, pulse time, deadline, quality formula, or information availability.

## Information contract

The game is one 3×3 field of visually identical memory tiles.

- During observation, exactly one authored path cell glows at a time according to the schedule.
- After each 750 ms exposure, that cell returns to the same unmarked appearance as all other cells.
- Recall contains no numeral, line, badge, retained glow, class, tint, trail, or label that discloses the hidden path order.
- Correctly chosen cells may pulse only after the player supplies that choice; the pulse never marks a future answer.
- DOM accessibility names describe row and column, never sequence position.
- QA timing records may expose event cells for parity automation, but no player-visible or accessible recall UI exposes them.

## Production-finish visual direction

The published 3×3 interaction remains dominant and immediately recognisable. It is refined as an original tabletop memory instrument rather than replaced:

- a deep plum lacquer tray with a subtle 3×3 brass lattice,
- nine identical ivory-violet glass tiles with bevelled rims and soft material shadows,
- a flash formed from a radial violet lamp, white inner bloom, and geometric four-point lens flare,
- a short depressed `chosen` state matching the legacy pulse,
- a rose glass fracture/impact state on the wrong cell,
- a compact observation/recall status plaque beneath the grid,
- restrained corner screws and no decorative object that can be mistaken for sequence information.

There are no generic answer cards, numbered sequence chips, retained route lines, external assets, audio, or copied game art.

## Interaction and accessibility

- Pointer/touch uses the tile itself, with at least 56 CSS px per target.
- Before recall, all tiles are disabled and input attempts are inert.
- During recall, native button activation and touch share the exact same sequential checker.
- Arrow keys move focus spatially across the 3×3 graph with row/column boundaries; native Enter/Space activates the focused tile.
- A strong dashed focus ring is visually separate from flash, chosen, and wrong treatments.
- The grid and every tile have semantic labels; live status announces the exact observation help, exact recall help, accepted progress, and terminal detail without disclosing future cells.
- Color is not the only cue: flash rises and shows a geometric flare, chosen depresses, wrong fractures, and focus uses a dashed rim.
- Normal and reduced motion both retain the same nonzero tracked flash and chosen stages. There is no continuous animation frame loop.
- Abort/deadline/finish makes all pending work inert, removes QA exposure, and leaves no listener or timer alive.

## Parity gate

Once an isolated lane is explicitly handed off, freeze one exact task and render current legacy and module side-by-side at 393×852 and 402×874 DPR3, normal and reduced motion. Capture and compare:

1. initial identical 3×3 field,
2. flash 1 at the exact first cell,
3. flash 2 at the exact second cell,
4. flash 3 at the exact third cell,
5. recall with no order leak and exact changed help,
6. first correct chosen pulse,
7. second correct chosen pulse,
8. immediate wrong cell/detail,
9. exact three-tap success/detail/quality formula,
10. exact recall-relative timeout/detail.

Also verify real touch, native keyboard activation and graph focus, pre-recall and terminal input lock, 390/430 responsive boundaries, no overflow/errors/external requests, generation and render performance, exact deadline ownership, and disposal in normal and reduced motion. Browser work remains forbidden until that handoff.
