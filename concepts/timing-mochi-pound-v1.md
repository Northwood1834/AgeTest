# timing-mochi-pound-v1 — 返して、ついて。

## Identity

- `id`: `timing-mochi-pound-v1`
- `introducedIn`: `2.0`
- `tier`: `3`
- `flavor`: `wild`
- `step`: `1`
- `family`: `timing-mochi-pound`
- `category`: `timing`

This is an original silent timing game. It is not a real-world instruction, demonstration, or metronome. A fictional partner performs twelve autonomous mallet strikes. The player holds to insert a clearly illustrated helper hand only while the mallet is fully raised, turns the mochi through retained safe dwell, and releases to withdraw before the visible descending stage.

No mallet ever contacts a hand. If the hand remains when descent begins, the partner stops high and the game ends as a harmless **safety stop**.

## Plain task and finite clock

The authored plain JSON task stores:

- exact integer `quantumMs = 50`;
- exact accelerating `periodTicks = [40,38,36,34,32,30,29,28,27,26,25,24]`;
- twelve integer safe windows with `safeStartTick = 4` and `safeEndTick = periodTicks[i] - 7`, end-exclusive;
- visible stage bounds: two landed ticks at each cycle edge and five descending ticks before the final landed pair;
- `strikeCount = 12`, success turn range `66..78`, tear threshold `84`, three consecutive empty strikes, and `duration = 19500`;
- a complete authored winning proof.

The stage at each cycle tick is deterministic:

1. `landed`: ticks `0..1`;
2. `up`: ticks `2..safeEnd-1` (the hand is accepted only from tick `4`);
3. `descending`: ticks `safeEnd..period-3`, five nonzero ticks / 250ms;
4. `landed`: final two ticks.

Normal mode advances this same integer clock from one tracked frame. Reduced mode advances it with tracked 50ms stages and no RAF. Neither mode changes periods, safe boundaries, strike times, result thresholds, or the visible up/descending/landed pre-cue.

## Authored safe proof

The task’s `proof` is a plain object with `safeSequence`, `boundaries`, `success`, `failures`, `finishPolicy`, and `resumePolicy`. For every strike `i = 0..11`, `safeSequence` contains:

```js
{ strikeIndex:i, holdFromTick:6, releaseAtTick:12, dwellTicks:6,
  safeEndTick:periodTicks[i]-7, marginTicks:periodTicks[i]-19 }
```

It holds on phase ticks `6..11` and releases exactly before tick `12`. Total turn dwell is `72`, inside `66..78`. The final safe window ends at tick `17`, so the final release margin is exactly `17 - 12 = 5` ticks, exceeding the required three-tick margin.

The same proof machine-enumerates every terminal failure: held at the descending boundary for `safety-stop`; five dwell ticks per strike / total 60 for `under`; seven per strike / total 84 for final `over` plus tick 85 for immediate tear; strikes 0–2 empty for `stick`; and a deadline at global tick 100 for `timeout`, with every retained payload field named. It fixes `finishPolicy` to `single-commit` and `resumePolicy` to `plain-json`.

Boundary meaning is exact:

- tick `3`: one tick before acceptance; hold input does not insert the hand or add dwell;
- tick `4`: first accepted safe tick;
- tick `safeEnd - 1`: last safe dwell tick; releasing before advancing this boundary is safe and fully withdraws;
- remaining held through that last safe tick triggers safety-stop exactly as the clock enters `safeEnd` / descending, before the descending pose is painted and before any strike;
- all periods and proof checks are finite integer loops.

## Causal state

The runtime stores integer state only. Every accepted safe dwell tick:

- increments `turnTicks` and `turnSinceStrike`;
- adds two smoothness points;
- stretches shape by one point.

Every actual strike:

- increments retained strike count;
- visibly compresses/rounds shape;
- if turning occurred, adds `4 + min(turnSinceStrike,8)` smoothness and folds shape by two;
- if no turning occurred, adds one smoothness point, contracts shape by one, and increments consecutive empty strikes.

Thus neither hand dwell nor strikes are fake animation. The same integers directly drive mochi geometry, grain, gloss, fold ridges, stretch, and terminal payload.

## Outcomes

- **success / glossy**: all twelve strikes, turn dwell `66..78`, no prior failure; retained mochi moves to a finished tray.
- **safety-stop**: hand remains into descending; partner freezes safely above the bowl. No contact, injury, gore, alarm, or blame.
- **under-turn / grain**: twelve strikes with fewer than 66 safe dwell ticks; retained mochi remains coarse.
- **over-stretch / tear**: turn dwell exceeds 84 at any point, or exceeds 78 by final classification; retained stretched shape visibly separates without injury.
- **stick**: three consecutive empty strikes; mallet sticks harmlessly in unturned dough.
- **timeout**: retains exact strike count, turn dwell, smoothness, shape, empty strikes, and material.

Every terminal commits once and locks input. Plain JSON resume reproduces all bounds and the proof.

## Visual and interaction contract

The board is original DPR3 Canvas art: stone mortar, wooden mallet, partner sleeve/hand, player helper hand pose, folded mochi, flour/grain, smooth/glossy materials, stretch and tear geometry, finished lacquer tray, workbench depth, and retained shadows. It uses no emoji, stock assets, branding, cultural costume caricature, blood, injury, dangerous contact, or real procedural instruction.

Documented visual-only enhancements are DPR3 canvas depth/shadows, the warm paper-and-workbench fixture material, and the inset keyboard focus treatment. They do not alter a period, safe window, hand presence, stage, strike count, turn count, smoothness, shape, material classification, terminal result, or copy. Every gameplay fact is sourced from the same retained integer state.

The hand is absent when released and appears only while safe hold is active. The mallet has unmistakable raised, descending, and landed poses. Visual status announces safe window, withdraw pre-cue, strike count, retained texture, and harmless terminal state without audio dependency. The concise always-visible label `架空の安全連動ゲーム` identifies the choreography as fictional and safety-interlocked; it adds neither a real-world tutorial nor an alarm.

Pointer hold/release uses real pointerdown/up/cancel. Keyboard hold/release uses Space or Enter keydown/keyup. Focus is inset and visible. The board is not a generic timing button. Layout is usable at 390–430 CSS px and DPR3.

## Acceptance gate

- Focused proof enumerates all twelve safe intervals, exact before/after boundaries, final five-tick margin, every failure, one finish, plain resume, reduced equivalence, disposal, and bounded generation/validation.
- Full-resolution 393/402 DPR3 normal/reduced source frames cover `initial`, `safe-hold`, `withdraw`, `strike`, `under`, `over`, `safety-stop`, `stick`, `success`, and `timeout`. For each named scene, normal/reduced and 393/402 frames must have an identical causal tuple: global/cycle/phase ticks, visible stage, hold/hand state, strikes, turn dwell, smoothness, shape, empty count, done/result/material, and status copy. Only canvas backing dimensions and the reduced-motion mode flag may differ.
- Browser evidence covers real pointer and keyboard holds/releases, safe/late boundaries, 390/430 focus/overflow, actual autonomous timing, performance, and disposal.
