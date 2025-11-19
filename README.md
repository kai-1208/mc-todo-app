# MC Todo App

## ページの公開URL

https://kai-1208.github.io/mc-todo-app/

## アプリの概要

React、TypeScript、Tailwind CSS を使用し、ローカルストレージでデータを永続化したマインクラフト風Todoアプリです。

### コンセプト

> 「タスクをゲームのように扱うことで、毎日の作業を少しだけでも楽しくする」

通常のTodo管理は味気なく、継続しづらい場面があります。そこで、タスクを「ブロック」として扱い、**掘って破壊したり、チェストに収納するように整理する**という遊び感覚を取り入れ、モチベーションを維持しやすい仕組みにしました。

UIはMinecraft風ですが、**素材・画像・テクスチャはすべて自作または著作権フリー**で構成し、オリジナルデザインとして成立させています。

### 主な機能

#### ■ 基本機能
- タスクの追加・編集・削除  
- ブロックとしてタスクを可視化  
- 優先度に応じてブロックの種類・色が変化
- ローカルストレージでデータを保存

#### ■ オリジナル機能
#### 1. ブロック破壊エフェクト（ひび割れアニメーション）
- ブロック破壊時にひび割れが段階的に進行するアニメーション
- crack_1.png～crack_5.pngを使用した5段階の視覚効果
- 破壊時間はブロックの種類（優先度）に応じて変化

#### 2. パーティクルエフェクト
- ブロック破壊時に破片が飛び散るアニメーション
- ブロックテクスチャを基にした色の破片の生成と消失

#### 3. 完了チェスト機能
- 達成したタスクは「チェスト」に自動収納
- チェスト容量制限（27個）と満杯時の警告機能

### スクリーンショット

- メイン画面
![メイン画面](./screenshots/screenshot1.png)

- タスク追加時のメニュー表示
![タスク追加](./screenshots/screenshot2.png)

- タスク編集時のメニュー表示
![タスク編集](./screenshots/screenshot3.png)

- ブロック破壊エフェクト（ブロック破壊アニメーション）
![破壊エフェクト](./screenshots/screenshot4.gif)

- レスポンシブデザイン
![レスポンシブデザイン](./screenshots/screenshot5.png)

## 工夫した点・挑戦した点

### ■ UIの完全オリジナル化
Minecraft風の雰囲気を保ちつつ、ブロックテクスチャやインフォメーションボタン、ブロック破壊時のひび割れテクスチャはすべて自作、ページの背景はImageFXを使用して作成し、著作権侵害にならないよう配慮した。

### ■ 破壊エフェクトの表現
- ひび割れアニメーションの段階的進行
- requestAnimationFrameを使用したスムーズなエフェクト
- ブロックの硬度に応じた破壊時間の調整

### ■ レスポンシブ対応の実装
画面サイズに応じてブロックサイズとグリッド間隔を調整し、モバイルからデスクトップまで快適に使用できるよう設計しました。

## 技術スタック
| 分類 | 使用技術 |
|------|-----------|
| フレームワーク | React (Vite) |
| 言語 | TypeScript |
| 状態管理 | useState / useEffect |
| スタイリング | Tailwind CSS |
| データ永続化 | LocalStorage |
| デプロイ | GitHub Pages |

## セットアップ方法

```bash
npm install
npm run dev
```

## ライセンス

MIT License

Copyright (c) 2025 otetehandcreampan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 開発期間

開発期間: 2025.10.23 ~ 2025.11.19 (約25時間)