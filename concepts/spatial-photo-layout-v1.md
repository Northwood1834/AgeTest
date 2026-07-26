# spatial-photo-layout-v1 — Album Frames by the Window

## Identity

- **Queue:** N12 / Q127
- **Category / tier:** spatial / tier 1
- **Audience:** mainstream women 30–40
- **Duration:** exactly 20 seconds
- **Primary action:** drag
- **Secondary action:** one large, gentle 90-degree rotate control
- **Three-second read:** six loose illustrated photo cards sit below six album frames; every frame visibly repeats one illustration watermark and shows a portrait or landscape opening.

## One-sentence play

Rotate the quarter-turned illustrated photos, then drag each one into the album frame with the same illustration and orientation.

## Correctness authority

Correctness comes only from visible task geometry:

1. each loose photo has one original object or landscape illustration;
2. each album frame has a pale line-art watermark of exactly one matching illustration;
3. each frame opening is visibly portrait or landscape;
4. a photo fits only its matching watermark while upright in the same orientation.

Color never identifies a match. Photo and frame use the same silhouette/line drawing and explicit portrait/landscape shape. The palette can be viewed in grayscale without changing any answer. There are no people, personal photographs, faces, names, brands, captions implying a real memory, or social interpretation.

## Authored finite set

There are four authored album boards. Every board contains six original fictional illustrations:

- portrait vase;
- portrait lighthouse;
- portrait window plant;
- landscape lake and hills;
- landscape pastry still life;
- landscape garden bridge.

Each board authors a loose-photo order, a frame order, and starting rotations. Every board starts with at least two photos quarter-turned by exactly 90 degrees. Other photos start upright. No random or continuous angle is used.

The proof is finite and explicit:

- six unique illustrations and six uniquely marked frames yield `6! = 720` possible complete assignments;
- exactly one assignment matches all six illustration watermarks;
- each frame has one authored orientation;
- the number and IDs of quarter-turned starts are stored;
- minimum successful actions are six placements plus one rotation for each quarter-turned start;
- every photo/frame pair and both authored rotation states are enumerated in the proof matrix.

Validation independently rebuilds that mapping, rotation matrix, unique assignment count, and minimum action count.

## Interaction

### Touch / pointer

Pressing a photo selects and picks it up. Normal motion follows the pointer through one tracked frame loop. Releasing over a frame calls the shared placement operation. A matching upright photo snaps into the frame. A wrong illustration or quarter-turned photo gently returns to its previous location and the attempted frame receives a brief warm outline. Dropping over the loose-photo tray returns a placed photo to the tray. Every correct placement can therefore be undone and rearranged.

The large rotate button acts on the selected photo. Rotation toggles only between 0 and 90 degrees. Rotating an already placed photo returns it to the tray because it no longer fits the frame; this is reversible and never terminal.

### Keyboard

Focusing a photo and pressing Space picks it up. Arrow keys move a visible destination cursor among the six album frames. Space drops through the same placement operation as pointer input. `R` calls the same rotation operation as the large visible rotate button. Escape or Delete returns a carried or selected photo to the tray. Focus follows the photo after settle.

Every photo, frame, and rotate control has a hit area at least 44×44 CSS px.

## Outcomes

- **Wrong frame:** nonterminal; photo returns gently to its prior location.
- **Wrong orientation:** nonterminal; photo returns gently and the status asks for the visible rotate control.
- **Success:** automatic only when all six photos occupy their unique matching frames upright. Input locks immediately and the completed album remains visible.
- **Timeout:** at exactly 20,000ms, photo locations, rotations, selected photo, and filled frames remain visible and are included in the result.

There is no submit button, score, move limit, hidden bonus, or irreversible wrong placement.

## Art direction

The game is an original warm album on a small window table. The album uses linen paper, stitched edges, cream frames, a wooden ledge, pressed leaves, and soft evening light. Illustrations are local SVG-like line drawings made from simple paths; they depict only objects and landscapes. No personal photos, people, face silhouettes, real locations, brand marks, external assets, emoji, audio, or network resources appear.

Portrait and landscape openings differ materially in aspect ratio. Quarter-turned cards visibly turn their paper rectangle and illustration together. The rotate control is a large text-and-arrow-free button labeled `選んだ写真を90度回す`; it does not use an icon that could resemble emoji.

## Motion and reduced motion

- **Normal:** one active pointer drag owns one tracked frame loop; placement and rotation use brief tracked settle stages.
- **Reduced:** no animation frame is requested. Pick-up, rotation, rejection, tray return, and successful snap use immediate static before/after stills scheduled through nonzero context timing.
- No flashing, bouncing, moving target, surprise layout change, or background animation exists.

## Resume and lifetime

Stable task state stores six locations (`tray` or the unique matching frame ID), six rotations (`0` or `90`), and phase `playing`. Frame occupancy must be unique. A placed photo must be in its own frame and upright. A complete valid layout is terminal and cannot be resumed as playing. Selection, drag coordinates, destination cursor, rejection cue, busy stage, frame handle, and finish lock are transient.

A JSON round-trip rendered by a fresh module continues through the same rotate/place path. All deadlines, settle stages, frame work, listeners, and abort cleanup are context-owned. Disposal removes QA exposure and leaves no timer, frame, listener, or finish path alive.

## Required QA

Focused Node QA covers metadata; 10,000 bounded cloneable generations; all authored orders and start rotations; independent 720-assignment proof and orientation matrix; every photo/frame/orientation classification; wrong-frame and wrong-orientation return; reversibility; all successful mappings; automatic success only at six; exact 20,000ms timeout retention; strict fresh-module resume; real pointer drag; arrows/Space and `R`; normal one-frame versus reduced zero-frame tracked stills; DPR3; 44px targets; disposal; and source bans.

Browser QA on Audit9332/8862 captures every variant at 393×852 and 402×874 DPR3 in normal/reduced modes for initial, selected, rotated, partial, wrong-frame, wrong-orientation, success, timeout, and focus. It adds 390×844 and 430×932 boundaries, real touch success, real keyboard rotate/drop, rejection and reversible-removal routes, exact deadline, disposal, 90-frame performance, target geometry, external/error/overflow checks, and a director contact sheet before lane release.
