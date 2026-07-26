# spatial-emoji-fps-v1 — published compatibility port

## Source authority and identity

This is a compatibility port of the currently published `app.js` legacy game. The current legacy generator, `renderEmojiFps`, `createStage3D`, `addEmojiEntity`, and the current `.stage3d` / `.fps-*` CSS are the only behavioral and visual parity authority. The discarded architecture experiment is not a source.

Metadata remains:

- ID: `spatial-emoji-fps-v1`
- Introduced: `1.0`
- Category: `spatial`
- Tier: `3`
- Flavor: `wild`
- Step: `1`
- Family: `spatial-emoji-fps`

## Exact stored task contract

Generation returns exactly:

```js
{
  kind: "emojiFps",
  prompt: "🤓だけを3体ロックオン",
  help: "😀・🤑・動物は押さないで。",
  targets: shuffle(["🤓", "😀", "🐶", "🤓", "🤑", "🐱", "🐼", "🤓"]),
  duration: 8000
}
```

The task stays structured-cloneable. Validation requires the exact five fields, exact Japanese copy, exactly eight target strings, and the exact multiset: three `🤓` plus one each of `😀`, `🐶`, `🤑`, `🐱`, and `🐼`. Target order remains authored task data and is never regenerated at render time.

## Fixed published spatial mapping

Target index maps to the same legacy `[x%, y%, z px, scale]` tuple:

1. `[21, 25, -30, 0.90]`
2. `[49, 22,  20, 1.05]`
3. `[76, 28, -10, 0.95]`
4. `[29, 50,  35, 1.13]`
5. `[67, 52,   5, 1.00]`
6. `[20, 69, -20, 0.88]`
7. `[49, 72,  45, 1.16]`
8. `[78, 67,  -5, 0.94]`

The port keeps all eight index identities, order, target centers, depth transforms, scales, and the legacy `3.15rem × 3.15rem` circular hit areas. The 3D corridor remains 14rem high with a 430px perspective, purple radial tunnel, ceiling/floor grids, central tunnel frame, crosshair, and lower-right `LOCK 0 / 3` counter.

## Exact rules and result compatibility

- Selecting `🤓` removes that exact indexed target and increments `LOCK` once.
- Exactly the three indexed `🤓` targets must be removed.
- The third correct lock succeeds once.
- Success quality remains `clamp(1 - elapsed / 8000, 0, 1)` from render start.
- Success detail remains `🤓を全員ロックオンしました。`
- Selecting any other target fails immediately once with exact detail `${emoji}は一般通行人でした。`
- Timeout fails once with exact detail `🤓が3D通路へ消えました。`
- A target cannot score twice, and completion, timeout, and disposal cannot double-finish.
- Plain saved task JSON resumes with the same target-to-position mapping.

## Production finish without mechanic retuning

The published corridor composition and target map remain recognizable side-by-side. The module strengthens material finish only inside those fixed bounds: layered wall ribs, lens bloom, metallic crosshair brackets, depth haze, edge lighting, target glass rings, and retained terminal color hierarchy. No external image, font, audio, network, or copied game asset is introduced.

The published normal-mode target float is retained at the same 1.2-second alternate cadence and per-index negative delays; reduced mode suppresses that decorative loop. Correct locks receive a short causal acquisition pulse before the legacy removal/counter result settles. Input is locked only during that pulse so one physical action cannot hit twice. Normal acquisition owns a context-tracked frame only while the pulse is active. Reduced motion owns no frame and exposes deterministic non-zero acquire stages at 70ms, 140ms, and 220ms. This staging does not change target identity, order, hit area, required count, failure meaning, duration, or quality formula.

## Interaction and accessibility

### Pointer / touch

Each target remains a real `button` at its exact legacy center and hit size. `pointerdown` is primary; keyboard-generated click follows the same action. The selected target's identity and index are exposed in its label.

### Keyboard

The corridor itself receives initial focus. Arrow keys choose the nearest remaining target in that spatial direction using the fixed x/y centers; this is spatial navigation rather than array-only cycling. `Enter` or `Space` selects the focused target. A visible cream/plum focus frame appears around the corridor and a second reticle appears on the spatially selected target. Target buttons also remain tabbable with their own visible focus style and `aria-label`.

## Required parity evidence

Legacy and module use one identical frozen task JSON and the same target order. At 393×852 and 402×874 CSS pixels, DPR 3, normal and reduced captures include:

1. initial;
2. keyboard/spatial focus;
3. `LOCK 1 / 3` with the exact first nerd removed;
4. `LOCK 2 / 3` with the exact second nerd removed;
5. bystander failure with the selected distractor detail;
6. success with all and only three nerds removed;
7. timeout retaining the same unresolved positions.

Full-resolution legacy and module source frames are reviewed side-by-side. Review checks the exact frozen task JSON, index-to-position tuples, target centers/hit dimensions, depth/scale, removed indices, lock count, bystander detail, success/timeout detail, mobile clipping, and production hierarchy. Reduced captures additionally prove a non-zero acquisition midpoint and no continuous frame.

## Lifecycle

All DOM is created through `context.host.ownerDocument`. All listeners use `context.listen`, delays use `context.later`, normal pulse frames use `context.frame`, and the deadline uses `context.setDeadline`. Abort removes the QA handle and cancels every owned frame, stage, listener, and pending finish. The module uses no raw timer, raw RAF, audio, network, or external asset path.
