# `language-label-jar-v1` — Pantry Label Match

## Identity

- Category / tier / flavor: language / tier 2 / satisfying.
- Duration: exactly `20000ms`.
- Original warm-pantry label game for a mainstream adult audience.
- Primary action: drag one loose label onto a jar label slot. An occupied slot exchanges labels, so every edit remains reversible.

## Three-second read

Prompt: `見本のラベルを、同じ絵のびんへ`

Help: `ラベルをドラッグ。2つの絵のびんには2枚。`

A fixed three-card legend is always visible above the jars. Every legend card pairs one short fictional Roman-letter label with one CSS-illustrated ingredient. The jar contents reuse those exact illustrations. The player never needs Japanese vocabulary, pantry knowledge, brand knowledge, or cultural convention: every decision follows only the task-provided legend and pictures.

## Finite task

Each authored variant has exactly three ingredient families:

1. warm grain-like ovals;
2. a folded leaf-like shape;
3. a berry-like circle cluster.

The family shapes remain distinct without color. Palette and fictional labels change across three authored pantry variants.

There are four glass jars:

- three single-content jars, one per ingredient family, each with one large label slot;
- one visibly wider compound jar containing two side-by-side ingredient illustrations and two large label slots.

The five physical label tiles comprise two copies for each ingredient repeated in the compound jar and one copy for the remaining ingredient. The copies have distinct inventory IDs but the same displayed fictional text and ingredient binding.

## Exact mapping and proof

Jar slot requirements are explicit task data and are rendered as the visible jar pictures. Label-to-ingredient bindings are explicit task data and are rendered in the legend. No renderer-only answer exists.

Validation independently enumerates all `5! = 120` labeled full arrangements:

- exactly `4` are valid, from exchanging the two equivalent physical copies of each repeated ingredient label;
- exactly `116` are full but invalid;
- the five labels can be placed in `5! = 120` different edit orders;
- all placements preserve the exact inventory;
- an occupied-slot placement is an exchange, and every move remains reversible;
- all authored starts are empty, nonterminal jar layouts with all five labels in the tray.

Success is automatic only after a tracked snap when all five slots contain labels whose task-provided ingredient binding matches the illustrated ingredient for that slot.

## Invalid and partial arrangements

Partial arrangements never finish. A full invalid arrangement also stays playable with no move limit. Only mismatched slots receive a gentle warm outline and the note `絵を見直して、入れ替えられます`; correct positions are not exposed through hidden attributes. The player can continue in any edit order until the mapping is valid or time expires.

Picking then cancelling restores the exact prior slot and tray order. Dropping onto an occupied slot exchanges the displaced label back into the picked label's source position.

## Input and accessibility

- Touch/pointer: press a label, drag, and release over any jar slot.
- Tap alternative: tap a label, then tap a jar slot.
- Keyboard: arrow keys move focus among labels and slots. Space or Enter uses the same pick/drop functions as pointer input. Escape cancels a held label.
- Every label and jar slot is at least `44 × 44` CSS pixels from `390–430` widths.
- Focus, held, dragging, legal target, partial, compound-partial, full mismatch, success, and timeout states are visually distinct.
- Status changes are announced through one polite live region.

## Art direction

A cream plaster pantry wall, honey-oak shelves, stitched paper labels, copper clips, warm glass jars, cork lids, and late-afternoon light form an original CSS-only scene. Jars have highlights, thick rims, base shadows, and visible ingredient pieces. The compound jar is wider and physically divides its two contents and two label slots. Ingredient silhouettes use multiple CSS pieces rather than text, emoji, images, or external assets.

The fixed legend is visually separate from the draggable tray: legend cards use a pinned-paper treatment, while draggable labels use heavier raised paper tiles with a grip seam. The jars and their large outlined label slots dominate the interaction hierarchy.

Success warms all jar highlights, settles labels flush to the glass, levels the shelf glow, and adds a restrained static pantry-light finish. Timeout desaturates slightly while preserving the exact arrangement.

## Motion, timing, and lifecycle

Normal placement uses a short tracked lift/snap and cross-fade still transition through `context.later`. Reduced motion switches immediately between stills but retains a nonzero tracked settle stage. No animation-frame loop is used.

A bounded recursive `context.later` ticker displays whole seconds. `context.setDeadline(20000, ...)` owns the exact deadline. Timeout retains slots, tray order, held label, move count, and mapping analysis in the result. Success and timeout commit once. Abort clears every listener, tick, snap, finish stage, QA owner, and deadline; disposed games cannot finish.

## Plain-data resume

Generated task data contains the authored ingredient legend, jar slot pictures, five label bindings, authored tray order, exhaustive proof, duration, and state `{slots, tray, held, moves}`. Validation requires exact authored rules, an exact five-label inventory across slots/tray/held, strict held-source consistency, exact finite proof, and a nonnegative move count. JSON cloning and a fresh renderer reproduce partial, held, full-invalid, and solved layouts without DOM state or hidden answer data.
