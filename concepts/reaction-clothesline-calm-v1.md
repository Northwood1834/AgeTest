# reaction-clothesline-calm-v1 — concept

## Audience lock

- Mainstream women in their 30s–40s; reaction tier 1; warm, quirky, and readable within three seconds.
- One primary gesture: tap the one whole cloth item that visibly tilts and flutters. Touch/click and Arrow keys + Space share the same activation path.
- Original courtyard art only: painted wall, greenery, wooden pegs, five shape-distinct garments, and a soft woven basket. No brands, emoji, audio, network, flashing, or injury/loss framing.

## Exact play

Five whole items remain visible on one clothesline: a sleeved shirt, flared dress, striped towel, pleated skirt, and paired socks. A task-stored permutation cues them one at a time. The current item is identified redundantly by its silhouette moving through short left/right tilt stills, lifted peg ribbons, a broad light halo, and the copy `ゆれている布をタップ`—never by color alone.

Each cue has a generous deterministic 2.6-second window. A correct tap settles and secures that item on the line, then the authored sequence continues. There is no acceleration or random timing.

On the first missed cue, the whole item moves through two tracked downward stills into the large soft basket. It remains large and visible. The next and only instruction is `かごの布を1回タップして戻す`; one tap rehanges it and the same sequence resumes. A later missed cue, or missing the recovery cue, ends gently with the retained courtyard and `今日はここまで`. The exact 20-second game deadline likewise retains every line/basket state. No item is damaged or described as lost.

## Timing and motion

- Exact kernel-owned deadline: 20,000 ms.
- Initial calm still: 650 ms.
- Per-cue task-stored window: 2,600 ms.
- Normal flutter: two tracked 140 ms tilt stages; drift: two tracked 150 ms stills.
- Reduced motion: two tracked 240 ms tilt stills; drift: two tracked 240 ms stills. No RAF.
- Recovery window: 3,200 ms. Between cues: 330 ms.

## Finite task and proof

Each plain task stores one of three exact five-item sequences, every cue window, normal/reduced stage durations, recovery window, deadline, item geometry, and strict versioned resume. Proof data contains:

1. complete route: tap each sequence item once inside its stored window;
2. recovery route: miss the first cue, tap that same basket item once to rehang it, then tap the four remaining cues in order;
3. failure route: miss the first cue, then miss its basket recovery window;
4. exact boundaries for cue and recovery windows.

The validator reconstructs these routes and rejects changed timing, order, geometry, proof, or inconsistent resume.

## Outcome hierarchy

- **Complete:** all five items remain secured on the line; sky brightens and small authored cloth-ribbon shapes settle around the line.
- **Recovery:** basket item stays large; one tap visibly returns it to its peg before the sequence resumes.
- **Second miss:** current retained line/basket arrangement remains visible with gentle neutral copy.
- **Timeout:** exact retained state remains visible; no forced cleanup or surprise ending.

## QA states

Opening, left tilt, right tilt, active cue, first drift, basket recovery, recovered line, progress, second miss, success, and timeout at 393×852 and 402×874 DPR3 in normal/reduced modes; real 390/430 touch, keyboard/focus, exact cue/deadline, recovery, disposal, resume, and performance checks.
