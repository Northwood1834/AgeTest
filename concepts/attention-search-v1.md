# attention-search-v1 — published compatibility concept

## Authority and stable identity

This is a compatibility port of the current working-tree `app.js` factory and `renderOddGrid`. No unpublished or historical replacement is an implementation source.

Metadata:

- id: `attention-search-v1`
- introducedIn: `1.0`
- tier: `2`
- flavor: `satisfying`
- family / step: `attention-search` / `1`
- category: `attention`

The published factory chooses exactly one of four ordered pairs:

```js
[
  ["😀", "😃"],
  ["🐶", "🐕"],
  ["🍎", "🍅"],
  ["6", "9"]
]
```

It then chooses `oddIndex` with `randomInt(0, 24)`. The saved task remains exactly:

```js
{
  kind: "oddGrid",
  prompt: "違うものをひとつ探して",
  help: "似ているだけで、同じではありません。",
  normal,
  odd,
  oddIndex,
  duration: 6500
}
```

No clue, pair name, answer duplicate, proof, seed, visual option, or difficulty field is added.

## Exact published mechanic

The renderer creates exactly 25 equal cells in row-major 5×5 order. Cell `i` displays `odd` only when `i === oddIndex`; every other cell displays `normal`. Glyphs are never replaced, enlarged selectively, recolored selectively, pre-highlighted, grouped, reduced in count, or made less similar.

Every cell preserves the exact accessible name:

```text
${i + 1}番目 ${cellGlyph}
```

Selecting the odd cell finishes correct with exact detail:

```text
見つかってしまいました。
```

Selecting any of the other 24 cells finishes incorrect with exact detail:

```text
そっくりさんでした。
```

The 6,500 ms deadline finishes incorrect with exact detail:

```text
違うものは群衆に紛れました。
```

One selection can commit at most once. Input after contact, terminal state, deadline, or disposal is inert.

## Production visual direction

The game remains the same visual-search grid, not a hidden-object scene or a different attention mechanic. The production module frames the exact glyph matrix as a polished optical-inspection board:

- one equal 5×5 array on a softly lit violet/ivory inspection surface;
- identical ceramic/glass tile treatment for all 25 cells, with equal border, shadow, size, glyph scale, and spacing;
- a compact `VISUAL SEARCH / 25 CELLS` header, hit-free progress language, and a neutral scan-line motif outside the cells;
- no per-cell number visible in play (numbering remains in aria only), because visible numbering would add clutter not present in publication;
- local pressed/focus/check feedback only after user action;
- distinct green correct, red wrong, and plum timeout result hierarchy.

The original glyphs carry the authored identity and discriminative information. Emoji remain native glyphs because replacing them would change the four published pairs. CSS materials and typography are resolution-independent and make no asset or network request.

## Interaction and accessibility

### Touch / pointer

Each of the 25 cells remains a real button with a large square touch area. Pointer/click on a cell checks exactly that index. Pressing the grid gap/background never chooses a cell.

### Keyboard

- The stage receives initial visible focus without selecting or highlighting the odd cell.
- Tab reaches the roving cell focus at index 0.
- Arrow Left/Right move one column with row-boundary clamping.
- Arrow Up/Down move one row with boundary clamping.
- Enter or Space checks the currently focused cell.
- Focus state is a user-driven purple outline of equal design for every index and conveys no answer clue.
- Live status names the selected ordinal and terminal detail.

## Feedback and lifecycle

Selection owns a brief tracked check before terminal commit so cause and result remain visible. Normal mode uses one `context.later` settle. Reduced motion uses two nonzero static stages (`contact → checked → terminal`) through `context.later`; it owns no continuous animation frame. The semantic result and exact detail are unchanged.

The kernel owns the 6,500 ms deadline. A mode token makes stale feedback callbacks inert. Abort/disposal invalidates callbacks, removes the QA handle, and leaves zero owned timers, frames, deadlines, or listeners.

No module call uses global DOM creation, raw timer/RAF/listener, network, audio, or runtime asset APIs.

## Frozen parity matrix

Parity uses four frozen plain-data tasks, one for each pair family, with deterministic representative odd indices while preserving each exact task shape. LEGACY and MODULE are captured at 393×852 and 402×874, DPR3, normal and reduced motion for:

1. `initial` — 25 cells, exact odd at stored index, no selected clue;
2. `focus` — keyboard focus on a known normal cell, no result;
3. `wrong` — a known normal index, exact incorrect meaning/detail;
4. `success` — stored odd index, exact correct meaning/detail;
5. `timeout` — no selected answer, exact deadline meaning/detail.

This yields 4 families × 2 widths × 2 motions × 5 states × 2 variants = 160 frozen source frames and 80 LEGACY/MODULE semantic pairs.

Documented visual enhancements are the module’s equal tile material, inspection-board depth, focus/check feedback, and stronger terminal hierarchy. Pair identity, 25-cell geometry, odd index, result polarity, detail text, and timeout remain exact.

## Acceptance invariants

- all four and only the four published ordered pairs;
- exact seven-key cloneable task with `oddIndex` integer 0…24;
- exactly 25 row-major buttons and exactly one odd glyph at the stored index;
- exact aria numbering and glyph text for all 25 cells;
- no generated or rendered answer clue before user focus/input;
- plain JSON resume selects the same odd cell and commits once;
- real wrong, correct, and deadline paths retain exact details;
- touch, 5×5 arrows, Enter/Space, Tab/focus, and busy/terminal input lock;
- normal/reduced tracked feedback, reduced stages > 0, frames = 0;
- resolution-independent DPR3 browser output at 390/393/402/430 without horizontal overflow;
- no page error or external resource;
- disposal during feedback removes QA and all owned work.
