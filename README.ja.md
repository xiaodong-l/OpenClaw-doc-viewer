# OpenClaw Doc Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4+-green.svg)](https://vuejs.org)
[![Release](https://img.shields.io/badge/release-v1.3.1-blue.svg)](https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases)
[![Enterprise](https://img.shields.io/badge/enterprise-v2.0.0-orange.svg)](https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases)

[English](README.md) | [简体中文](README.zh-CN.md) | **日本語**

OpenClaw 生成された Markdown ドキュメントのために設計された、モダンで機能豊富なドキュメントビューアー。ディレクトリツリーナビゲーション、美しい Markdown レンダリング、全文検索をサポート。

---

## 🌍 多言語サポート

このプロジェクトは多言語国际化（i18n）をサポートしています：

| 言語 | 状態 | ファイル |
|------|------|----------|
| 🇺🇸 English | ✅ 完成 | README.md |
| 🇨🇳 简体中文 | ✅ 完成 | README.zh-CN.md |
| 🇯🇵 日本語 | 🔄 進行中 | README.ja.md |
| 🇪🇸 Español | ⏳ 計画中 | README.es.md |
| 🇫🇷 Français | ⏳ 計画中 | README.fr.md |
| 🇩🇪 Deutsch | ⏳ 計画中 | README.de.md |

**翻訳に貢献したいですか？** [貢献ガイド](CONTRIBUTING.md) をご覧ください！

---

## 📦 最新リリース

### v1.3.1 - 現在の安定版 (コミュニティ版)

**リリース日:** 2026-03-13

**主な機能:**
- 🔗 **公開共有ページ** - ログイン不要でリンクを介してドキュメントを共有
- 📦 **批量コレクション管理** - 複数のコレクションを一度に削除または移動
- 💬 **ドキュメントコメント** - 返信、いいね、編集、削除機能付きの完全なコメントシステム
- 🐛 **バグ修正** - 検索インデックス、sharp モジュールの互換性、ヘルスエンドポイントの修正

### v2.0.0 - エンタープライズ版 (商用)

**リリース日:** 2026-03-15

**エンタープライズ機能:**
- 🏢 **LDAP/AD 統合** - エンタープライズディレクトリサービスの同期
- 🔐 **SSO と MFA** - SAML 2.0 / OIDC / OAuth2 + TOTP 二要素認証
- 📝 **バージョン管理** - ドキュメントの履歴、ロールバック、変更比較
- 📋 **監査ログ** - 完全な操作追跡と GDPR 準拠
- 🌍 **i18n サポート** - 中国語/英語バイリンガルインターフェース
- ⚡ **Redis キャッシュ** - パフォーマンス向上のためのセッションとデータキャッシュ
- 📧 **メール通知** - コメントと共有通知

---

## 🚀 クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/xiaodong-l/OpenClaw-doc-viewer.git
cd doc-viewer

# バックエンドのインストール
cd workspace/backend && npm install && npm run dev

# フロントエンドのインストール (新しいターミナル)
cd workspace/frontend && npm install && npm run dev
```

http://localhost:5173 にアクセス

**デフォルト管理者アカウント:** `admin` / `admin123`

---

## 📖 ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| [インストールガイド](docs/INSTALL.md) | ステップバイステップのインストール |
| [デプロイガイド](docs/DEPLOYMENT.md) | 本番環境デプロイ |
| [クイックスタート](docs/QUICKSTART.md) | 5 分で始める |
| [API リファレンス](docs/API.md) | API エンドポイントドキュメント |
| [設定ガイド](docs/CONFIGURATION.md) | 設定オプション |
| [アーキテクチャ](docs/ARCHITECTURE.md) | システムアーキテクチャ |

---

## 🤝 貢献

貢献を歓迎します！詳細は [貢献ガイド](CONTRIBUTING.md) をご覧ください。

### 翻訳の貢献

新しい言語の翻訳を追加したい場合：

1. `README.xx.md` ファイルを作成（xx は言語コード）
2. 既存の README.md をベースに翻訳
3. 言語テーブルに追加
4. PR を作成

---

## 📄 ライセンス

このプロジェクト（コミュニティ版）は [MIT ライセンス](LICENSE) の下でライセンスされています。

---

*OpenClaw Doc Viewer - ドキュメント閲覧をシンプルに、美しく*
