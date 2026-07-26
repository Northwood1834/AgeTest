# attention-laundry-rescue-v1 — 洗濯物だけ救出

## Product promise

うっかり者の架空の夫が、夕方の洗面室に散らかった**衣類だけ**を見分け、深い縦型洗濯機へ一つずつ運ぶ20–50秒の注意ゲーム。妻、犬、携帯電話、洗剤などを無差別にタップするゲームではない。布の輪郭・縫い目・素材、部分遮蔽、手が塞がる状態、洗濯槽の奥行き、床が片付く変化を読む。

- Stable ID: `attention-laundry-rescue-v1`
- Metadata: introducedIn `2.0`, category `attention`, tier `2`, flavor `wild`, step `1`, family `attention-laundry-rescue`
- Duration: 40 seconds
- No audio, emoji, network, external assets, or runtime fetch
- Wife/dog are fictional cartoon characters. Wrong grabs are slapstick surprise only; both are visibly dry, intact, and unharmed.

## Core interaction

A high-resolution illustrated laundry-room floor contains five garments plus four distractors.

- Laundry: shirt, trousers, striped sock, looped towel, knitted cardigan.
- Character distractors: wife and dog, each partly occluded by fabric/furniture but with an exposed, readable face/hand/ear region.
- Ordinary distractors: mobile phone and detergent bottle.
- The top-loading washer has a large elliptical rim, visible inner drum, deep gradient, rear controls, open lid, and an explicit drop mouth.

Pointer/touch:

1. Press an object to grab it. A drawn hand/cuff closes around the held item and HUD changes to `手: 使用中`.
2. Drag a garment to the washer mouth. The item remains attached to the hand and casts a moving floor shadow.
3. Release inside the dark drum to load it. The garment crosses the rim, descends in two readable stages, and disappears into a visible colored laundry pile.
4. Release elsewhere to return it to its authored floor position with a recoverable invalid-drop cue.

Grabbing wife or dog immediately causes one terminal failure. Grabbing phone/detergent causes a separate wrong-nonlaundry failure. Input locks at the first terminal condition; finish commits once.

Keyboard/accessibility:

- Left/Right cycles every remaining object with a visible authored focus contour and spoken label.
- Enter/Space on a garment performs the same staged transfer to the washer.
- Enter/Space on wife, dog, phone, or detergent invokes the same failure as pointer grab.
- Three large controls (`前の品`, `選んだ品を運ぶ`, `次の品`) provide an additional touch/keyboard path.

## Terminal outcomes

- **Success:** all five garments are visibly layered inside the drum, the floor is materially clear, washer depth remains readable, and a warm folded-towel/soap-bubble treatment celebrates quietly.
- **Wife grabbed:** retained terminal tableau shows the open washer with a completely unharmed cartoon wife standing up from the drum, hands on rim, dry hair intact, angry brows, and a comic laundry tag caught on her shoulder. No injury or implied washing.
- **Dog grabbed:** retained tableau shows the unharmed dog standing in the open drum, front paws on rim, dry fur and annoyed ears. No injury.
- **Wrong nonlaundry:** phone/detergent is caught safely across the rim with a clear `衣類ではありません` terminal banner.
- **Timeout:** real remaining garments stay on the floor; evening light cools and a retained timeout badge reports the count.
- **Invalid drop:** nonterminal garment return with local dotted return path; visually weaker than terminal outcomes.

## Finite authored layouts and proof

Task data is structured-cloneable plain data:

- finite room/washer geometry;
- nine authored object records (`id`, semantic `role`, `shape`, `material`, geometry, rotation, palette, z-order);
- authored partial-occlusion pairs;
- exact five-ID laundry solution;
- duration and bounded proof metadata.

Generation selects one of two horizontally mirrored authored compositions using injected `randomInt`. Proof is finite rather than search-by-guessing:

- exactly five unique laundry IDs;
- wife, dog, phone, and detergent are never in the solution;
- each garment owns a minimum exposed hit area and a collision-free drag route to the washer mouth;
- the washer mouth and every start box remain in bounds;
- at least three authored partial occlusions are retained without fully hiding any interactive object;
- replaying the five solution IDs loads all laundry and no distractor.

Validation reconstructs the authored layout, checks semantic roles/material/shape/geometry/z-order/occlusions, verifies the exact solution and proof counts, and rejects mutated answer semantics. A JSON round-trip must resume and finish correctly.

## Motion and lifecycle

Normal motion uses one kernel-owned frame loop. Loading a garment has three causal phases: hand carries above floor, fabric crosses the elliptical rim, fabric scales/fades into the dark drum. The floor shadow and previous footprint remain until settlement.

Reduced motion owns no continuous frame. Loading uses two tracked `context.later` stages (`槽の縁` then `投入済み`) with a visible stage badge and disabled controls. Abort invalidates both stages and removes QA.

All listeners, deadlines, later jobs, and frames are owned by context. `finish` is called once. No raw timers, RAF, listeners, network, or audio.

## Visual direction

Commercially finished hand-authored Canvas diorama:

- warm/cool checker floor tiles with grout depth, lint, low evening window light, and furniture shadows;
- garment-specific silhouettes, seams, hems, ribbing, towel loops, shirt buttons, trouser pockets, sock cuff/heel—not generic colored rectangles;
- wife/dog painted as friendly multi-shape cartoons with readable exposed regions and retained terminal poses;
- deep washer body with enamel speculars, control labels, hinge, rim thickness, perforated drum wall, inner darkness, and accumulating laundry color;
- held garment lifts off floor and follows a drawn hand; partial occlusion changes as items are removed;
- dedicated light HUD for loaded count and hand occupancy; no HUD overlap with the washer mouth;
- local invalid cue, strong but nonviolent terminal banners, and quiet material-based success.

No Utage Sol illustration is required: wife and dog are original resolution-independent vector characters drawn in-module, so no external asset brief or fetch path is introduced.

## Required evidence

Full-resolution DPR3 source frames at 393×852 and 402×874:

1. initial
2. active garment drag / occupied hand
3. meaningful progress / clearer floor
4. invalid outside drop
5. wife terminal
6. dog terminal
7. wrong nonlaundry terminal
8. success
9. timeout
10. reduced tracked loading stage

Also verify real touch drag, keyboard alternative and focus, 390/430 overflow, plain resume, all distinct terminal outcomes, deadline, in-flight normal/reduced disposal, no errors/external resources, and 60fps-equivalent performance.
