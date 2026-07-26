# Game module contract

Status: rebuild contract for the approximately 300-game catalogue.

The rebuild base is the published catalogue at `a8761a1` (v1.16.0). Its published individual games and stable IDs are retained. The unpublished Claude architecture experiment at `b932e89` is not a source or implementation base. Existing resumable plain-data tasks remain compatible. A game is moved only after its browser behavior is verified; the current public branch is not modified during the rebuild.

## Ownership unit

One authored game lives in one file under `src/games/<stable-id>.js`. Its owner is responsible for its rules, generated task data, renderer, input, animation, validation, accessibility, tests, and documentation. Shared storage, selection, scoring, feedback, timing primitives, and lifecycle enforcement belong to the kernel and must not be copied into game files.

Each module exports one object:

```js
export default {
  metadata: {
    id: "category-name-v1",
    introducedIn: "1.7",
    tier: 1,
    flavor: "classic",
    step: 1,
    family: "category-name",
    category: "memory"
  },

  generate({ random, randomInt, pick, shuffle }) {
    return { /* structured-cloneable task data */ };
  },

  validate(task) {
    return []; // strings describing invariant violations
  },

  render(task, context) {
    // Build the game inside context.host.
    // Return nothing; all lifetime-bound work uses context primitives.
  }
};
```

`generate` must terminate, must not touch the DOM, and must return structured-cloneable data. Its answer or success condition must be derivable from that data after reload. `validate` checks game-specific solvability and answer invariants rather than only shape/type presence.

## Render context

The kernel passes a fresh context for one question:

```text
host                    game-owned DOM root
signal                  AbortSignal for the question lifetime
finish(correct, result) commit exactly one answer
setDeadline(ms, fn)     deadline cancelled on dispose
later(fn, ms)           question-owned timeout
frame(fn)               tracked requestAnimationFrame loop
listen(target, type, fn, options)
reducedMotion           current preference
viewport                current CSS size and DPR
qa                      localhost-only game QA hook
```

`listen`, `later`, `frame`, and `setDeadline` are automatically disposed when the question ends, the player returns home, the profile changes, or another task renders. A module must not call raw `setTimeout`, `setInterval`, `requestAnimationFrame`, or long-lived `addEventListener` for lifetime-bound work. `finish` becomes inert after the first answer or disposal.

Canvas backing dimensions use CSS dimensions multiplied by DPR. Pointer input is the primary path; keyboard operation and visible focus are required wherever the mechanic permits them. Games must remain usable from 390 to 430 CSS pixels wide and respect safe-area insets and reduced motion.

## Manifest and loading

Metadata has one authored source: the game module. `tools/build-game-manifest.mjs` imports game modules in Node, validates metadata, computes a content hash, and writes the committed lightweight `src/game-manifest.js`. Runtime selection reads only that manifest. It dynamically imports the selected twelve modules, plus any modules named by a resumed active session.

The generated manifest records:

```text
id, introducedIn, tier, flavor, step, family, category, module URL, content hash
```

The build check fails for duplicate IDs, missing fields, tier outside 1–5, family/step mismatch, or a stale generated manifest. A missing module or metadata mismatch is an explicit compatibility error; it never silently falls back to Tier 1 or reuses another game.

Relative module URLs must work below the GitHub Pages project path. Content hashes provide per-game cache invalidation without invalidating every game when one changes. No external origin, API, package CDN, or server runtime is allowed.

## Stored task compatibility

An active session continues to store plain generated task data with its stable `templateId`, `introducedIn`, tier, flavor, step, family, and category. Rendering a resumed task resolves `templateId` through the manifest and loads that exact game module. Existing IDs are never removed or reinterpreted; a semantic replacement receives a new ID.

The kernel owns answer commit, XP, history, cooldown, profile switching, and generic feedback. A disposed game cannot commit an answer. This is a release-blocking invariant.

## Acceptance for one game

A game is accepted only when its branch supplies evidence for:

1. metadata and generated-manifest validation;
2. repeated generation with no hang and game-specific invariants intact;
3. correct, incorrect, timeout, dispose, reload/resume, and double-finish behavior;
4. no surviving listener, timeout, interval, or animation frame after disposal;
5. 390×844, 393×852, 402×874, and 430×932 CSS viewports at DPR 2 or 3;
6. pointer/touch operation, keyboard path where applicable, focus, reduced motion, and no horizontal overflow;
7. no console/page error and no external network request; and
8. one stable-ID-scoped Git branch whose diff does not alter another game's semantics.

The author supplies the evidence. Integration acceptance remains with the director.

## Migration order

1. Implement the kernel, manifest builder, lifecycle tests, and one small representative game without changing stored state semantics.
2. Keep a legacy adapter so unported published games from `a8761a1` remain playable during migration.
3. Move games one owner and one branch at a time. Rich Canvas games must pass dispose instrumentation before acceptance.
4. Remove the legacy adapter only after every retained stable ID has a module and saved-session replay has been verified.
