# calculation-balance-scale-v1 — exhaustive physical-weighing contract

## Identity

- Stable ID: `calculation-balance-scale-v1`
- Category / tier / flavor: `calculation` / `2` / `satisfying`
- Introduced in: `2.0`
- Duration: `45000ms`
- Prompt: `三回以内の天秤で、違う重さのトークンを特定する`
- Help: `左右へ自由に載せて計量します。候補ログから番号と「重い／軽い」を選び、排出してください。`

## Product promise

The player receives one of six finite workshop cases containing 8, 9, or 12 visually identical numbered fictional alloy tokens. Exactly one token differs in weight, and it may be either heavier or lighter. The only source of evidence is a physical two-pan balance. The player freely composes up to three equal-count weighings, commits each one, watches a deterministic left-down, balanced, or right-down pose, and uses the persistent log plus explicit heavy/light hypothesis set to eject exactly one numbered token with one tendency.

This is not a multiple-choice riddle and does not pre-render a prescribed sequence. Every token can move among the pool, left pan, and right pan before each commit. The renderer never changes the counterfeit token’s material, rim, shadow, size, animation, label, hit target, or z-order. No precommit tilt, candidate highlight, hidden weight meter, sound, haptic cue, or outcome preview leaks the answer.

## Finite task family

Token counts are exactly `{8,9,12}`. Each numbered token has the same original non-currency design and differs only by live UI number. A hypothesis is plain data `{token, tendency}`, where tendency is `heavy` or `light`; therefore the initial exact candidate set contains 16, 18, or 24 hypotheses.

Six authored hidden cases are used, two per count, and every selected hidden case follows a nontrivial three-weighing branch in the approved strategy tree:

- 8 tokens: `1 light`, `8 heavy`;
- 9 tokens: `7 light`, `9 heavy`;
- 12 tokens: `3 heavy`, `12 light`.

The secret exists in task data only so deterministic simulation and resume are possible. It is never reflected in any visible token property.

## Physical weighing causality

A token belongs to exactly one zone: pool, left pan, or right pan. Dragging or keyboard assignment changes only that zone. Before commit the beam remains neutral and the result label is blank, regardless of the secret.

A valid weighing has one or more tokens on each pan, equal counts, no duplicate token, and in-range IDs. With one counterfeit:

- a heavy token on the left or light token on the right makes the left pan descend;
- a heavy token on the right or light token on the left makes the right pan descend;
- a counterfeit outside both pans balances;
- all ordinary tokens contribute equal baseline mass and cancel because pan counts match.

Commit locks composition immediately and enters `LIFT → COMPARE → SETTLE`. The final pose persists until another valid commit. The log stores exact left/right lists, observed result, candidate count before, candidate count after, and the surviving hypotheses. Filtering retains precisely those hypotheses whose deterministic result equals the observation.

After use `u`, only `3-u` weighings remain. If an observed branch has more than `3^(3-u)` candidates, that composition cannot guarantee identification and finishes as an information-poor weighing while retaining its physical pose and candidate set. Empty or unequal pans finish as a distinct poor/empty commit and retain the attempted composition. After the third valid weighing, two or more survivors finish as ambiguity. One survivor does not auto-answer: the player must still select its token number and heavy/light tendency, then activate the physical eject action.

## State transitions and controls

1. `SETUP` — neutral scale, all tokens in the pool, full candidate set, empty three-row log.
2. `COMPOSE` — pointer drag or direct token controls freely move tokens among pool/left/right; no outcome preview exists.
3. `COMMITTED` — composition locks immediately.
4. `LIFT` — both pans lift from rest through a nonzero tracked stage.
5. `COMPARE` — the beam moves toward the deterministic pose; reduced motion uses the same finite pose stages and no continuous frame.
6. `SETTLE` — result label, persistent log, remaining uses, and exact candidate set update together.
7. `IDENTIFY` — select one numbered token and explicit `重い` or `軽い`, then press `排出する`.
8. `TERMINAL` — controls lock immediately and exactly one finish payload retains pans, log, candidates, uses, pose, selection, and full plain snapshot.

Touch users drag tokens between visible zones and use minimum-44px native buttons. Keyboard focus begins on the token bank: arrow keys move among token buttons, `L` assigns left, `R` assigns right, `P` returns to pool, and native Tab reaches commit, heavy/light, and eject controls. Every action uses the same state transition functions.

## Outcomes

- **Exact identification / success:** selected token and tendency both match the hidden case. The correct token enters an original brass inspection drawer while the final three-row evidence log remains visible.
- **Wrong genuine token:** a different numbered token is ejected; the drawer retains that token and the candidate set proves why it was unsupported.
- **Wrong tendency:** the correct token is selected with heavy/light reversed; token and tendency selection remain visible.
- **Ambiguous after three:** at least two hypotheses remain after the third valid weighing. Final pan pose, all three logs, and exact survivors remain visible.
- **Information-poor:** an observed branch exceeds the information capacity of remaining uses. The committed pose and updated oversized set remain visible.
- **Empty/unequal weighing:** committed empty or unequal pans retain their attempted contents and consume the committed use before terminal feedback.
- **Timeout:** current pans, settled pose, log, candidate set, uses, selection, and remaining uses are unchanged and returned.

## Exhaustive adaptive proof

Each token count has one finite approved decision tree. At every internal node the stored equal-count left/right composition partitions the current hypothesis set by the exact balance equation. Validator recursively verifies:

- all token IDs are in range and each pan is nonempty, equal-size, and disjoint;
- each stored branch equals an independent filter of its parent hypotheses;
- every nonempty leaf contains exactly one distinct heavy/light hypothesis;
- all `2N` hypotheses appear exactly once across nonempty leaves;
- no branch exceeds `3^remaining`;
- tree depth is at most three;
- the selected authored hidden case follows exactly three nonempty, nontrivial commits;
- replaying its stored path ends at the exact singleton secret.

The approved trees cover all 16, 18, and 24 hypotheses, not only the six generated secrets. They include known-genuine reference tokens where previous observations make that legal, so balance is genuinely adaptive rather than three unrelated partitions.

## Strict resume

A snapshot is JSON-cloneable plain data with version; token zones; complete log entries; complete candidate array; uses; pose; selected token and tendency; and terminal outcome/done fields. Transient drag, animation, and busy state are never serialized. `task.resume` is either null or exactly that shape. Validation replays every log from the full `2N` set, recomputes each secret result and each candidate filter, checks counts and use order, then verifies the resumed candidates, pose, terminal consistency, identification geometry, and canonical zone partition. Rendering a validated snapshot through a fresh module restores the same evidence and can finish only once.

## Motion, ownership, and disposal

Both normal and reduced modes use tracked `context.later` pose stages; no continuous frame is required. Reduced motion preserves a visible nonzero lift, compare, and settle sequence with shorter travel and no bounce. The mathematical outcome, log, and candidate geometry are identical. Abort invalidates stages, removes QA/listeners/deadline, clears drag, and prevents any late commit or finish. No raw timer, event, animation-frame, global document, audio, network, storage, image request, or external font API is allowed.

## Commercial visual direction

The portrait board is an original midnight-violet calculation atelier: warm wooden bench, ivory enamel balance column, brushed brass beam and pans, three persistent ledger slots, and a graphite candidate drawer. Tokens are thick teal ceramic-alloy calibration pucks with identical chamfered octagonal edges, inset grooves, tiny registration dots, and live ivory number overlays; they are not coins, currency, medals, or casino chips. The three scale poses visibly preserve pan load and beam angle. Candidate chips use number plus `H/L` text and shape redundancy, never color alone.

The pool, both pans, log, candidate set, use count, selection, and action controls remain simultaneously visible. Success slides the selected token into a brass inspection drawer while keeping the evidence ledger. Failures use retained physical arrangements and restrained coordinate arrows, not generic red cards, confetti, emoji, or screen shake.

If static assets are commissioned, the brief is one original DPR3-safe wooden atelier backing, separated neutral/left/right balance parts, one identical token body without number, three ledger-material states, inspection drawer open/closed, and terminal light overlays. All numbers, candidates, log content, and status text remain live UI.

## Pre-browser evidence plan

Node evidence must cover metadata; all six authored cases and all `{8,9,12}` counts; 10,000 finite cloneable generations; exhaustive independent verification of every strategy node and all `2N` leaves; three-step secret paths; exact left/right/balanced equations; arbitrary free pan composition; no precommit cue; candidate/log persistence; singleton success; wrong token; wrong tendency; third-use ambiguity; information-poor and empty/unequal commits; timeout retention; strict fresh-module resume; pointer drag; keyboard assignment/focus; immediate lock and one finish; reduced nonzero stages; DPR3; ownerDocument; fake and real disposal; bounded painting; and source bans.

Browser work must wait for explicit audit handoff after Particle. Required later captures should include all three counts and both secret tendencies across initial, composed, left/right/balanced logs, singleton, wrong-token, ambiguity, information-poor, success, and timeout states at canonical DPR3 normal/reduced viewports, plus real touch/keyboard strategy paths, deadline/dispose/performance, and 390/430 boundaries.
