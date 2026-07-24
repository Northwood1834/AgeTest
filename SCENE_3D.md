# 共通3D問題基盤

## 目的

問題追加が継続するため、各ゲームが個別にカメラ・座標・終了処理を持つ構成にはしない。外部3Dライブラリや大容量素材を追加せず、CSS 3DとDOMで軽量な共通ステージを使う。

## 現在のAPI

```js
const scene = createStage3D("scene-name", "アクセシブルな説明");
scene.root   // viewport / camera / clipping / perspective
scene.world  // transform-style: preserve-3d のワールド
```

絵文字ターゲットには次を使う。

```js
addEmojiEntity(scene.world, {
  emoji: "🤓",
  label: "眼鏡の顔をロックオン",
  x: 50,        // viewport内の割合
  y: 40,
  z: 20,        // CSS pxの奥行き
  scale: 1,
  onSelect
});
```

共通CSS:

- `.stage3d`: perspective、viewport、clip、scene token
- `.stage3d-world`: 3Dワールド
- `.stage3d-entity`: x/y/z/scaleをCSS変数で受ける操作対象
- 各問題クラス: 世界観、地形、固有アニメーションだけを追加

## ライフサイクル

1. 問題descriptorは乱数結果を保存し、再読込時も同じコースを再現する。
2. `renderTask()`がsceneを生成する。
3. タイマー、timeout、追加requestAnimationFrameは共通の終了処理へ登録する。
4. `finishTask()`または画面離脱時に全タイマーとanimation frameを停止する。
5. 正誤・qualityだけを共通スコアへ返し、scene自身はXPや保存形式を変更しない。

## 採用済みscene

- 回転立方体
- 絵文字FPS風ロックオン
- 3Dレーン選択
- 起伏が毎回変わるパターゴルフ
- 作者アイコン中ボス（同じviewport/lifecycleを使用）

横スクロールアクションは2D物理だが、同じ問題ライフサイクルと終了処理を使う。

## 新しい3D問題の追加条件

- stable `templateId`、Tier、カテゴリを定義する
- コース・地形・正解に必要な乱数はdescriptorへ格納する
- 初見で操作がわかる一文と、キーボードまたは代替入力を用意する
- 速い点滅を使わない
- `prefers-reduced-motion`でも正誤判定に必要な状態が消えない
- 端末性能に依存するフレーム数を得点へ直接使わない
- 外部モデル・テクスチャ・音源は、軽量DOM/CSSで目的を満たせない場合だけ検討する

## 非目標

現時点ではThree.js等の描画エンジン、汎用ECS、物理エンジン、sceneファイルローダーは導入しない。現在の3D問題数では共通viewport・entity・lifecycleで十分であり、依存と配布容量を増やす段階ではない。
