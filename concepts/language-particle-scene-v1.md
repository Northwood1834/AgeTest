# language-particle-scene-v1 — ことばで場面を組み立てる

Status: N08 original module specification (Q21).

## Identity

- ID: `language-particle-scene-v1`
- category: `language`
- tier: `3`
- flavor: `satisfying`
- step: `1`
- family: `language-particle-scene`
- task kind: `particleScene`
- duration: `30000` ms
- move limit: `6`

This is a scene-construction game, not a grammar quiz. The player moves the visible words and small connecting-character tiles, then watches the illustrated subject, carried item, destination, and travel direction rebuild. Player-facing copy never names grammatical categories, asks for outside language knowledge, or grades etiquette. There is no four-choice fallback, correctness color, option answer marker, or hidden target sentence.

## Authored finite set

Every task contains exactly four phrase blocks: three drawable nouns and the action `はこぶ`. The always-visible target is an illustration only. The accepted arrangement is the exact block order shown below with connecting tiles `が / を / へ`.

| puzzleId | target blocks | authored start blocks | authored start connectors | shortest solution |
|---|---|---|---|---:|
| `cat-apple-basket` | `ねこ / りんご / かご / はこぶ` | `りんご / ねこ / かご / はこぶ` | `は / を / から` | 3 moves |
| `dog-book-bench` | `いぬ / ほん / ベンチ / はこぶ` | `ほん / いぬ / はこぶ / ベンチ` | `が / と / から` | 4 moves |
| `bird-ball-box` | `ことり / ボール / はこ / はこぶ` | `はこ / ボール / ことり / はこぶ` | `は / と / から` | 5 moves |
| `rabbit-carrot-garden` | `うさぎ / にんじん / はたけ / はこぶ` | `はこぶ / はたけ / にんじん / うさぎ` | `は / と / から` | 6 moves |

A block move removes one block and inserts it at one of four positions. A connector move replaces one of three occupied connector positions; the displaced tile returns to the tray. The finite connector inventory is exactly `が / を / へ / は / と / から`. The three accepted tiles are never placed as an ordered answer set: injected shuffle controls the six-tile inventory order, initial occupied positions vary, all tiles share one material/color treatment, and the target illustration contains no sentence or connector legend. `は / と / から` are always non-target tiles.

Generation calls injected `pick` once on the four authored puzzle rows, then injected `shuffle` once on the six connector strings. Invalid helper output falls back finitely to row one and authored inventory order. The generated task is plain structured-cloneable data and has exactly:

```text
kind, prompt, help, puzzleId, blocks, target,
particleOrder, moveLimit, state, duration
```

`prompt` is `ことばを動かして、見本の場面を作って`; `help` is `6回まで。動かすたびに、下の場面が変わります。`.

## Total word-to-scene mapping

The four current positions always map deterministically to left figure, carried figure, destination figure, and action position. The first two connector positions deterministically change figure pose. In the first position, `が` is the moving pose, `を` the lifted/carried pose, `と` alongside, `から` source/faded, `へ` ahead, and `は` waiting/faded. In the second position, `を` is carried, `が` moving, `と` alongside, `から` source/faded, `へ` ahead, and `は` waiting/faded. Motion streaks and a carry bracket make those changes discoverable by target comparison without outside terminology. The third connector determines direction:

- `へ` draws travel toward the destination;
- `から` draws travel away from it;
- every other finite tile draws an unresolved dashed path.

Every drawable ID has an original CSS-composited animal/prop form and UI-rendered Japanese label. Any drawable block can occupy any of the first three positions, so role reversal and wrong destination remain valid, visible scene states rather than parser errors. If a block or connector is currently held, or the action block is not in the fourth position, mapping returns an explicit incomplete preview while retaining every still-placed figure. Thus all permutations, all connector assignments, and held/null states have one total deterministic preview—there is no exception or implicit language rule.

The exact target requires all four target block IDs in order and exactly `が / を / へ`. No dummy can produce target equality.

## State, moves, and resume

`task.state` always contains exact current `blockOrder`, `particleSlots`, `particleTray`, `held`, `moves`, and bounded `history`. The renderer clones it and never mutates the task. Picking removes one item from its source immediately and rebuilds an incomplete preview. Placing completes one move, records a bounded content snapshot, and rebuilds again. Undo is an accessible explicit action; it restores the latest content snapshot but consumes one move, so it cannot bypass the six-move bound. Escape cancels a held item without a move.

The inventory validator proves that the four block IDs and six connector strings occur exactly once across placed/tray/held state, that move/history bounds are finite, and that every history entry is plain valid content. A QA snapshot can be put back into the same task shape and rendered by a fresh module to prove mid-edit and post-edit plain-data resume.

## Outcomes

Exact scene equality after a placement succeeds automatically. `できた` also submits the retained current state. Distinct terminal classifications and exact details are:

- success: `見本どおりの場面ができました。`
- role reversal: `だれが何を動かすかが、見本と逆です。`
- wrong destination or direction: `行き先や向きが、見本と違います。`
- incomplete submit: `ことばが途中のままです。`
- six-move exhaustion: `見本と違う場面のまま、6回を使い切りました。`
- timeout: `時間切れです。ことばと場面はそのまま残ります。`

Every payload retains `outcome`, `sentence`, exact deterministic `preview`, and a cloneable state snapshot. Timeout commits at exactly 30000 ms. Result ownership is single-shot: a completed move owns its classified terminal result and cannot be overwritten by timeout or repeat input.

## Presentation and interaction

Two always-visible scene cards compare `見本` and `いまの場面`. Original neutral CSS animal/prop composites use no external image, copied textbook layout, emoji, real brand, or text baked into art. The sentence builder alternates four equal phrase drop targets with three equal connector drop targets, followed by a neutral connector tray. Target and current labels are UI text.

Touch drag is pointer-down pick plus pointer-up place on a finite drop target. The same controls are native buttons: keyboard users Tab to a block/tile, Enter or Space to pick, Tab to a target, and Enter or Space to place. Escape cancels a held item, and an explicit `ひとつ戻す` button supports undo. Focus is at least 3 px visible; touch targets remain at least 44 CSS px at 390–430 widths. No initial order, color, class, data attribute, status text, or ARIA label marks target tiles.

Normal mode uses a short context-owned two-stage preview cross-fade after each edit. Reduced mode applies the same exact preview immediately, disables movement animation, owns no RAF, and still provides finite selected/placed acknowledgement. All listeners, deadline, preview stages, terminal feedback, QA, and held state are lifetime-bound and disposal-safe.

## Required proof

Focused tests exhaust all 24 block permutations, all 120 connector-slot permutations drawn without replacement, every held/incomplete form, and the exact total preview mapper. BFS over finite insert/replace moves proves shortest authored solutions `3,4,5,6`, all dummies non-target, role reversal, destination/direction miss, incomplete, exhaustion, timeout retention, strict single finish, no mutation, and fresh-render resume. Source tests enforce ownerDocument-only DOM, context-owned scheduling/listening, no raw timers/RAF/listeners, no network/audio/emoji, and no answer cue.

Browser acceptance, after the audit lane is handed over, captures 393×852 and 402×874 DPR3 normal/reduced for initial, target comparison, first edit, role reversal, destination miss, focus, move exhausted, incomplete, success, and timeout, plus 390/430 responsive proof. It exercises real touch causality, keyboard pick/place/undo, reduced swaps, deadline, disposal, bounded performance, exact payload/state retention, and full-resolution typography/art review.
