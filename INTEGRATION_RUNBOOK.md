# Game integration runbook

Use this sequence after an owner reports completion. Acceptance remains an integration decision; command success alone is insufficient.

1. Confirm the diff is limited to one stable ID and its tests/concept. Do not accept shared-kernel, app, manifest, or unrelated semantic changes from a game lane.
2. Run the scoped Node tests and inspect generation, resume, every terminal outcome, double-finish, and disposal assertions.
3. Inspect full-resolution 393×852 and 402×874 DPR3 source frames. For a port, compare the same task against the published implementation. For an original, compare every required state against its accepted concept and the best catalogue games.
4. Verify the isolated browser run: touch, keyboard, focus, reduced motion, no overflow, no external request, no page error, and zero owned work after disposal.
5. Commit the accepted module and tests. For a port, remove only its matching legacy factory/renderer after proving no other game depends on that code.
6. Create `acceptance/<stable-id>.json` with the reviewed implementation commit and test path.
7. At the end of a wave of at most three, run `npm run build:games`, then `npm test`. The generated manifest and acceptance records must agree.
8. Recheck cold load and a 12-game session when loader, manifest, app size, or lifecycle behavior changed. Cold home must fetch no game module; a session must fetch no more than its selected modules.
9. Commit generated inventory and records, verify a clean tree, then push without force. Release or merge remains a separate acceptance decision.

If visual parity, save compatibility, deterministic proof, disposal, or performance is unresolved, withhold that game and integrate the others independently.
