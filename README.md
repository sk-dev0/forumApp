# まったり掲示板

ユーザー登録制の匿名性掲示板アプリです。スレッドにタグをつけてカテゴリ分けができ、キーワードやタグで検索しながらさまざまな話題をまったり語り合えます。
[アプリを見る](https://mattari.sk-dev0.com)

## 使用技術

- **フレームワーク:** Express.js
- **言語:** JavaScript (Node.js)
- **認証:** Passport.js (passport-local)
- **データベース:** MongoDB (Atlas)
- **ODM:** Mongoose
- **テンプレートエンジン:** EJS / ejs-mate
- **セッション:** express-session + connect-mongo
- **バリデーション:** Joi
- **スタイリング:** Bootstrap
- **セキュリティ:** Helmet / sanitize-html
- **デプロイ:** Vercel

## 主な機能

- スレッドのキーワード検索・タグ検索（ログイン不要）
- スレッドの閲覧（ログイン不要）
- スレッドの作成（ログイン必須）
- スレッドへのコメント投稿・編集・削除（ログイン必須、投稿者のみ）
- スレッドの編集（作成から5分以内、作成者のみ）
- スレッドの削除（作成者のみ、関連コメントも全削除）
- ユーザー登録・ログイン・ログアウト

## 今後の実装予定

- 画像投稿機能

## ローカルでの起動方法

### 必要な環境

- Node.js 18以上
- MongoDB（Atlas を推奨）

### セットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/sk-dev0/forumApp.git
cd forumApp
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定

`.env` ファイルを作成し、以下の変数を設定してください。
```
MONGODB_URL=
SESSION_SECRET=
```
4. 開発サーバーを起動
```bash
node app.js
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてください。
