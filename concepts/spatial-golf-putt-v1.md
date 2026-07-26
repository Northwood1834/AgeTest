# spatial-golf-putt-v1 — Published compatibility port

## Authority and intent

This module ports the **current** `app.js` `spatial-golf-putt-v1` factory and `renderGolfPutt` behavior. It is a compatibility port, not a redesign or physics retune. The prohibited historical revision is not consulted.

## Stable identity

- `id`: `spatial-golf-putt-v1`
- `introducedIn`: `1.0`
- `tier`: `2`
- `flavor`: `wild`
- `step`: `1`
- `family`: `spatial-golf-putt`
- `category`: `spatial`

## Exact published task shape

Generation consumes injected `randomInt` calls in the current factory order and returns exactly:

```js
{
  kind: "golfPutt",
  prompt: "グリーンを読んでホールイン",
  help: "白いボールを押さえ、打ちたい方向と反対へ引いて離す。",
  ball: { x: integer 22..38, y: integer 66..80 },
  hole: { x: integer 58..78, y: integer 22..39 },
  slope: { x: integer -3..3, y: integer -2..2 },
  mounds: three { x: integer 15..85, y: integer 16..84, size: integer 28..52 },
  duration: 14000
}
```

When both generated slope components are zero, `slope.x` is forced to `2`, exactly as in the current factory. No other normalization or hidden field is added. Published JSON survives a round-trip and resumes directly.

## Exact shot semantics

Let the playable green's CSS dimensions be `width` and `height`.

- A shot vector is `{x, y, length = hypot(x, y)}` in green CSS pixels.
- `powerScale` remains exactly `2`.
- `putt(dx, dy)` is inert after the first accepted shot or when shot length is below `18` pixels.
- Pointer input starts only within `48` CSS pixels of the rendered ball center.
- During a drag, `pull = pointer - start`; the visible aim and putter use `shot = -pull * 2`.
- Releasing a pull shorter than `18` CSS pixels resets the aim and does not consume the shot.
- Releasing a valid pull calls `putt(-pull.x * 2, -pull.y * 2)`.
- Keyboard `Enter` and `Space` use the exact current ideal shot:
  - `shot.x = (hole.x - ball.x - slope.x) * width / 100`
  - `shot.y = (hole.y - ball.y - slope.y) * height / 100`
- Accepted-shot final coordinates remain:
  - `finalX = clamp(ball.x + shot.x / width * 100 + slope.x, 3, 97)`
  - `finalY = clamp(ball.y + shot.y / height * 100 + slope.y, 3, 97)`
- Result settles after exactly `950ms`.
- `distance = hypot(finalX - hole.x, finalY - hole.y)` in percentage-coordinate space.
- The cup radius remains `7.5`.
- `distance <= 7.5` is correct with:
  - `quality = clamp(1 - distance / 8, 0, 1)`
  - `detail = "ナイスイン！引きと傾斜を読み切りました。"`
- Otherwise the result is incorrect with:
  - `detail = "カップまで、あと${max(1, round(distance))}歩でした。"`
- Deadline remains `14000ms` with detail `芝を読んでいる間に日が暮れました。`.
- Pointer cancel resets an unplayed drag. Input is locked after an accepted shot. Finish commits at most once.

## Production visual enhancement without rule changes

The same authored information becomes a crisp DPR3 canvas presentation:

- a high-resolution irregular putting green with visible mowing grain;
- all three task mounds drawn at their exact percentage centers and authored pixel sizes;
- a readable cup, flag, ball, putter, and slope arrow;
- pointer pull, opposite-shot aim, and power shown directly on the same coordinate surface;
- normal-motion ball travel interpolated only for presentation while retaining exact final coordinates and 950ms settlement;
- reduced motion represented by deterministic nonzero tracked stages with no continuous frame;
- retained in-green `in-hole`, miss, and timeout terminals.

The enhancement does not add friction, mound collision, random deflection, alternate scoring, assets, audio, or network access. Mounds and slope remain visible information; only the published vector equation determines the final position.

## Input and accessibility

- The playable green is focusable with a visible focus ring.
- Real pointer drag uses the current 48px ball-start gate, opposite release, minimum pull, and power scale.
- `Enter` and `Space` use one shared ideal-shot path and prevent scrolling.
- Live status text announces aim, short pull, putt, in-hole, miss, and timeout.
- The canvas has a Japanese equivalent description, and its interaction area exceeds 48 CSS pixels at canonical/mobile widths.

## Lifecycle and motion

- Every node comes from `context.host.ownerDocument`.
- All listeners, settlement stages, deadline, optional normal visual frame, QA state, and disposal use tracked context APIs.
- Normal motion has at most one tracked frame loop for visual interpolation and preserves the exact 950ms result time.
- Reduced motion books deterministic nonzero tracked positions and no continuous frame.
- Abort/dispose removes listeners, frames, timers, and QA exposure; no finish survives disposal.
- No raw timer/frame/listener primitive, network primitive, audio API, or external asset is used.

## Acceptance evidence

### Focused Node

- exact metadata and thousands of generation-by-generation comparisons against the current `app.js` factory;
- all ranges, random call order, zero-slope correction, plain cloneability, and strict mutation rejection;
- saved plain JSON resume;
- exact ideal vector, pointer opposite-release vector, power `2`, minimum pull `18`, final clamp `3..97`, slope addition, cup `7.5`, settle `950ms`, quality/details/timeout;
- short pull, off-ball start, pointer cancel, input lock, keyboard/focus, deadline/disposal/single finish;
- deterministic reduced stages with no frame and normal presentation cadence;
- 393/402 DPR3 backing and all seven parity scenes;
- owner-document and forbidden-primitive scans.

### Legacy/module parity after explicit lane handoff

One frozen task JSON and one measured green geometry are held identical across:

- legacy and module;
- 393×852 and 402×874 at DPR3;
- normal and reduced motion;
- `initial`, `aim`, `short-pull`, `mid-putt`, `in-hole`, `miss`, `timeout`.

The 56-frame report records the unchanged task, shot vector, final coordinates, distance, cup verdict, quality/result copy, geometry, overflow/errors/resources, and the intentional visual-only enhancement. Browser interaction/performance/disposal runs only after the screw lane is explicitly handed over.
