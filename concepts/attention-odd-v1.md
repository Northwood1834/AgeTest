# attention-odd-v1 — 文字鑑識グリッド

Status: published v1.0 port specification; pre-browser concept, module, exhaustive Node tests, and parity fixtures precede isolated flow-lane handoff.

## Published identity

- Stable ID: `attention-odd-v1`
- Introduced: `1.0`
- Category: `attention`
- Tier: `1`
- Flavor: `satisfying`
- Step: `1`
- Family: `attention-odd`

The sole authority is the current `app.js` v1.0 factory and current `renderOddGrid`. No archived architecture or historical implementation is a source.

## Exact generated task

Generation preserves the published helper calls and seven fields exactly:

1. Call injected `pick` once with these ordered pairs:
   - `['シ','ツ']`
   - `['ぬ','め']`
   - `['8','B']`
   - `['老','考']`
2. Call injected `randomInt(0,24)` once.
3. Return:

```js
{
  kind: 'oddGrid',
  prompt: 'ひとつだけ違うものをタップ',
  help: '老眼鏡の持ち込み可。',
  normal: pair[0],
  odd: pair[1],
  oddIndex,
  duration: 7000
}
```

No family, pair index, answer, grid, glyph list, clue, renderer state, difficulty, or resume field is added. `pick` always precedes `randomInt`; valid generation makes exactly those two calls. The task remains structured-cloneable and plain-JSON resumable.

Strict validation accepts only the exact seven keys, exact kind/copy/duration, one exact ordered pair, and an integer odd index from 0 through 24. It rejects reversed pairs, alternate characters, extras, index retuning, and renderer annotations.

## Exact current odd-grid behavior

- Create exactly 25 buttons in row-major order.
- Every position contains `normal` except the one stored `oddIndex`, which contains `odd`.
- Each button has exact aria text `${index + 1}番目 ${glyph}`.
- Choosing the stored odd index completes true with `{detail:'見つかってしまいました。'}`.
- Choosing any normal index completes false with `{detail:'そっくりさんでした。'}`.
- The 7000 ms deadline completes false with `{detail:'違うものは群衆に紛れました。'}`.
- One choice locks the board; no later input or deadline may replace the result.

A short lifecycle-owned material check may precede the commit, but correctness and payload never change. Normal motion uses one nonzero tracked stage. Reduced motion uses contact and checked stages through `context.later`, has nonzero stage count, and owns zero RAF.

## Information and visual contract

The four pair identities depend on their literal typeforms. The module must preserve them without interpretation:

- no rotation, skew, stroke editing, alternate character, pseudo-element, icon substitution, case conversion, or writing-mode change;
- no target-only font, size, weight, spacing, color, background, border, shadow, position, animation, or ARIA treatment;
- no pre-highlight, answer-colored cell, count marker, row/column hint, ghost path, or magnifier positioned near the answer;
- no fewer than 25 cells and no regrouping or reordering.

Production finish is an original compact glyph-inspection instrument:

- one exact 5×5 board of equal ceramic type specimens;
- a restrained ink-plum frame, neutral paper grain, registration lines, and material depth;
- one shared Japanese/system font stack and one shared font declaration for every cell;
- neutral `GLYPH INSPECTION` / `5 × 5` chrome outside the glyph field;
- a non-clue inspection footer that fills the mobile viewport purposefully;
- selected contact depresses one cell; only after input does that cell receive green or rose outcome material;
- timeout dims the whole grid uniformly and never reveals the odd position.

The visual upgrade may improve material, spacing, hierarchy, focus, and feedback only. Every glyph stays clearly distinguishable and semantically identical to the current source.

## Input, accessibility, and lifecycle

- Native buttons provide touch/pointer operation.
- The stage begins keyboard-ready without selecting or focusing a cell as an answer clue.
- Arrow keys move through exact 5×5 geometry and clamp at every edge.
- Tab/roving focus and Enter/Space activation use the same checker as touch.
- Focus uses a neutral dashed outline and is intentionally shown on a known normal glyph for parity capture.
- Every cell keeps exact ordinal/glyph aria; no aria label mentions normal, odd, target, answer, or correctness.
- All nodes come from `context.host.ownerDocument`.
- Deadline, feedback, listeners, and abort use context-owned primitives only.
- Dispose aborts active feedback, removes QA, and leaves zero timers, listeners, or frames.
- DPR inspection caps at 3; layouts remain usable from 390 through 430 CSS px.
- No network, storage, audio, external asset, global DOM creation, raw lifetime primitive, or RAF.

## Frozen parity gate

After explicit flow handoff, freeze one representative task for every pair and deterministic odd index. Compare LEGACY and MODULE at 393×852 and 402×874 DPR3, normal and reduced, for initial, focus, wrong, success, and timeout:

- **160 frozen frames / 80 semantic pairs**;
- exact task JSON and generation trace (`pick` then `randomInt(0,24)`);
- exact 25 glyphs and odd location;
- exact aria numbering;
- focus on a known normal cell with no pre-highlight;
- exact correct, wrong, and timeout details;
- no font/rotation/identity or density retune.

Supplemental browser gates cover real touch, 5×5 keyboard navigation/focus/input lock, 390/430, normal/reduced, DPR3, overflow/errors/external origins, performance, actual 7000 ms deadline, and disposal. Browser work remains forbidden until the flow lane is explicitly handed off.
