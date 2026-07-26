# social-care-package-v1 — 仕送り箱の余白

Status: concept, self-contained module, focused Node proof, fixture, and isolated audit-lane visual acceptance complete on canonical 393×852 / 402×874 DPR3, with 390 / 430 supplemental smoke.

## Stable identity

- ID: `social-care-package-v1`
- introducedIn: `2.0`
- category: `social`
- tier: `2`
- flavor: `quirky`
- step: `1`
- family: `social-care-package`

## Product promise

一人暮らしを始めた20歳の大学生の息子へ、親が限られた段ボール箱を詰める。目的は息子の生活や交友関係を親が完成させることではなく、本人が自分で暮らすための余白を残しながら、使い切れる生活物資を送ることである。

常にsupportiveなのは、カップ麺、乾燥パスタ、缶詰、Amazonギフトカード、新しい下着、靴下、米。どれも入れるたび実用scoreが必ず増える。常にintrusiveなのは、水着グラビア写真集と「友達の作り方」本。前者は望まれていない性的curation、後者は交友関係への一方的なcurationであり、どちらも他の支援品一つ分より大きいpenaltyを持つ。これは性表現への潔癖さや、息子に友人を作る能力がないという判断ではない。本人が頼んでいない私生活の選別を、親が荷物へ混ぜること自体を扱う。

実在メッセージサービスのロゴ、名称、固有配色は使わない。画面内の「家族メモ」は端末内の架空記録であり、network送信はしない。Amazonギフトカードは要件上の商品名として扱い、Amazonのロゴ・UI・商標意匠は描かない。

## Core loop

1. 段ボール、丸めたpacking paper、テープ、木の作業台と、九つの物資を確認する。
2. 最新の短いメモを読む。メモは「米が少ない」「レポート週で買い物時間がない」「雨で洗濯が追いつかない」のいずれかで、該当するsupportive itemに小さいtimely bonusを与える。
3. 物資をpointerで箱へdragする。箱の外へdragすれば取り出せる。Keyboardではitemへfocusし、Enter/Spaceでpack/remove、Delete/Backspaceでremoveする。
4. 箱容量8を超える操作は拒否され、品物は元の棚へ戻る。箱内の物は詰めた順にpacking paperへ沈み、材質と占有面積を保つ。
5. 何度でもremove/repackしてから、一度だけ発送票を閉じる。自動発送、放置成功、単なるgood/bad tap gridはない。

## Score and authored exhaustive proof

全taskは同じ九つのauthored item descriptorをplain dataで持つ。各itemは `id`, `name`, `kind`, `size`, `base`, material copyを持つ。

Supportive base score:

- カップ麺 `+3`, size 2
- 乾燥パスタ `+3`, size 2
- 缶詰 `+2`, size 1
- Amazonギフトカード `+4`, size 1
- 新しい下着 `+2`, size 1
- 靴下 `+2`, size 1
- 米 `+4`, size 3

Intrusive score:

- 水着グラビア写真集 `-14`, size 2
- 「友達の作り方」本 `-14`, size 2

各authored messageはsupportive IDを二つだけtimely指定し、それぞれ`+2`する。Messageは分類を変えない。写真集と友達本は、どのmessageでもintrusiveのままである。

全 `2^9 = 512` subsetを列挙し、size、base、timely、total、supportive数、intrusive数、分類を再計算する。容量8超過または空箱は`invalid` proof path。発送可能subsetは次で分類する。

1. intrusive itemが一つでもある → `intrusive`
2. intrusiveなし、supportive 4品以上かつscore 10以上 → `success`
3. intrusiveなしだが品数またはscore不足 → `mixed`

`mixed`は害のある箱ではなく、支援の種類がまだ偏っている未完成parcelである。`intrusive`とは理由もvisualも分ける。Proofは512 total、各outcome count、invalid count、最大score、最大scoreを達成するcanonical subsetを保存する。Validatorはauthored message/items、timely bonus、capacity、threshold、全countとcanonical subsetを再列挙し、偽造proofや分類変更を拒否する。

## Outcomes and message causality

- `mixed`: supportive品だけだが、4品未満またはscore 10未満。箱は発送されるが支援が一方向へ偏る。元の最新メモの下に `既読` だけが残り、返信はない。
- `intrusive`: 写真集または友達本が一つでも入る。実用品が同梱されていても大きいnegative scoreと説明を出す。元のメモは `既読`、返信なし。性的・社会的な選別を頼まれていないことを理由にする。
- `success`: intrusiveなし、4品以上、score 10以上。まず短い返信が届き、その後、同じ架空「家族メモ」内でoriginal video-call stillへ切り替わる。20歳の息子は落ち着いた部屋着で、自分の机に米や缶詰などを置き、リラックスしている。幼児化、筋肉・ゲーム・散らかった部屋などの男性stereotypeに頼らない。
- `timeout`: 箱と詰めかけの物資をそのまま保持し、未発送として終わる。

Finishは一回だけcommitする。Successは `reply → video still → finish`、bad parcelは `既読 → result → finish` の非zero tracked stagesを持つ。Reduced motionも同じ因果順で、連続RAFやteleportを使わない。

## Visual identity

背景は淡い木の梱包台。箱はkraft紙の繊維、二重の段ボール断面、折り返したflap、赤茶のテープ、くしゃくしゃの薄紙を持つ。棚のitemは平たいUI tileではなく、カップの円錐、パスタ袋の透明窓、缶の金属rim、無地のカード封筒、布の折り目、米袋の縫い目、本の背とページ厚で区別する。Drag中は紙の影が深くなり、箱へ入ると薄紙が押し下がる。

Intrusive本は警告色で悪魔化しない。一般的な書籍と同じ材質で描き、選択後の説明とmessage結果によって境界侵犯を示す。Supportive品も「正解色」に光らせず、実用scoreはpacking slipの小さな数値で伝える。

Result領域は実在chatを模倣せず、生成紙のような「家族メモ」cardにする。Badは元のメモ本文を保持して右下へ `既読`、reply欄は空。Successは短い返信の紙片と、角丸のvideo still frameを追加する。StillはCSS/Canvasのoriginal local illustrationで構成し、network・audio・runtime asset fetchを行わないためUtage assetは不要。

## Accessibility and lifetime

- Itemはbutton semanticsと`aria-pressed`で箱内状態を読む。
- 箱は`role=list`、容量・score・選択内容をlive statusで通知する。
- Touch pointer capture、drag ghost、44px以上のtarget、keyboard pack/remove、visible focusを提供する。
- Reduced motionはpack/lift/settleとterminal sequenceを非zeroの`context.later`で段階表示し、連続frameを持たない。
- DOMは`context.host.ownerDocument`のみ。deadline、later、listener、QA APIはcontext ownershipで、dispose後に返信・still・finishを残さない。
- Audio、emoji、network、実サービスUI、外部assetを使わない。

## Focused acceptance scenes

`initial`, `drag`, `packed`, `repacked`, `capacity-invalid`, `mixed`, `intrusive-photo`, `intrusive-friends`, `success-reply`, `success-video`, `timeout`。Browser captureはexplicit lane handoff後にのみ行う。
