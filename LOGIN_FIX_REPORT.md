# ログイン承認問題 - 修正レポート

**修正日**: 2026-01-18
**修正者**: Claude Code
**ブランチ**: main

---

## 問題の概要

ログイン承認がうまくいかないという問題に対して、以下の改善と修正を実施しました。

---

## 実施した修正

### 1. バックエンドの改善

#### **services/auth_service.py**
- **問題**: bcryptに関する古いコメントが残っていた
- **修正内容**:
  - `verify_password()`: 不要な72バイト制限処理を削除、エラーハンドリングを強化
  - `hash_password()`: 不要な72バイト制限処理を削除
  - より詳細なエラーログを追加

**修正前**:
```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワードを検証（bcryptの72バイト制限に対応）"""
    # bcryptは72バイトまでしか処理できないため、パスワードを切り詰める
    truncated_password = plain_password[:72] if len(plain_password.encode('utf-8')) > 72 else plain_password
    try:
        return pwd_context.verify(truncated_password, hashed_password)
    except ValueError as e:
        print(f"[WARNING] Password verification error: {str(e)}")
        return False
```

**修正後**:
```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワードを検証"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError as e:
        print(f"[WARNING] Password verification error: {str(e)}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error during password verification: {str(e)}")
        return False
```

#### **routers/auth.py**
- **問題**: ログ出力が不十分で、問題の診断が困難
- **修正内容**:
  - より詳細なログ出力を追加
  - 各ステップでの状態を明確に表示
  - エラー発生時のトレースバックを追加

**主な改善点**:
```python
print("=" * 60)
print("[LOGIN] Login attempt started")
print(f"[LOGIN] Email: {email}")
print(f"[LOGIN] Password length: {len(password)}")
print(f"[LOGIN] Users found: {len(user_list)}")
print(f"[LOGIN] User ID: {user_id}")
print(f"[LOGIN] User role: {user_data.get('role')}")
print(f"[LOGIN] Password validation result: {password_valid}")
print("[OK] Login successful - generating token")
print(f"[OK] Token generated (first 20 chars): {token[:20]}...")
print("=" * 60)
```

---

### 2. フロントエンドの改善

#### **index.html - login()関数**
- **問題**: エラーハンドリングが不十分で、ユーザーに具体的なエラーメッセージが表示されない
- **修正内容**:
  1. メールアドレスの`trim()`処理を追加（前後の空白を削除）
  2. 詳細なコンソールログを追加
  3. サーバーからのエラーメッセージを表示するように改善
  4. エラー時の具体的なメッセージを表示

**主な改善点**:
```javascript
// メールアドレスのtrim処理
const email = document.getElementById('loginEmail').value.trim();

// 詳細なログ出力
console.log('Attempting login...', { email });
console.log('Login response status:', res.status);
console.log('Login successful', { role: data.role, user_id: data.user_id });

// エラーメッセージの改善
if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: '不明なエラー' }));
    console.error('Login failed:', errorData);
    alert(`ログインに失敗しました: ${errorData.detail || 'メールアドレスとパスワードを確認してください。'}`);
}
```

#### **index.html - 初期化処理**
- **問題**: ページロード時にトークンの有効性を検証していなかった
- **修正内容**:
  1. トークンが存在する場合、サーバーに検証リクエストを送信
  2. トークンが無効な場合は自動的にクリアしてログイン画面を表示
  3. 最新のユーザー情報（ロール等）をサーバーから取得

**修正前**:
```javascript
window.addEventListener('DOMContentLoaded', () => {
    if (TOKEN) {
        document.getElementById('authOverlay').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');

        if (USER_ROLE === 'admin') {
            document.getElementById('adminTabs').classList.remove('hidden');
        }

        loadStatus();
    }
});
```

**修正後**:
```javascript
window.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, checking authentication...');

    if (TOKEN) {
        try {
            // トークンの有効性を確認
            const res = await authFetch('/api/status');

            if (res.ok) {
                const data = await res.json();
                console.log('Token is valid, user authenticated:', data.email);

                // ロールを更新
                USER_ROLE = data.role || 'user';
                localStorage.setItem('role', USER_ROLE);

                // 画面を表示
                document.getElementById('authOverlay').classList.add('hidden');
                document.getElementById('mainContent').classList.remove('hidden');

                if (USER_ROLE === 'admin') {
                    document.getElementById('adminTabs').classList.remove('hidden');
                }

                await loadStatus();
            } else {
                console.warn('Token validation failed, clearing stored credentials');
                // トークンが無効な場合はクリア
                TOKEN = '';
                USER_ROLE = 'user';
                localStorage.removeItem('token');
                localStorage.removeItem('role');
            }
        } catch (e) {
            console.error('Error validating token:', e);
            // エラーが発生した場合もクリア
            TOKEN = '';
            localStorage.removeItem('token');
            localStorage.removeItem('role');
        }
    }
});
```

---

## テストと検証

### 1. パスワードハッシュのテスト
```bash
python -c "from database import pwd_context; ..."
```
**結果**: ✅ 正常に動作

### 2. 管理者アカウントの確認
```bash
python check_admin.py
```
**結果**: ✅ 管理者アカウントが正常に存在

### 3. ログイン処理のテスト
```bash
python test_login.py
```
**結果**: ✅ ログイン処理が正常に動作

### 4. サーバー起動テスト
```bash
uvicorn main:app --reload
```
**結果**: ✅ サーバーが正常に起動

---

## 修正後の動作

### ログイン時
1. ユーザーがメールアドレスとパスワードを入力
2. フロントエンドが`/login`エンドポイントにPOSTリクエスト
3. バックエンドが詳細なログを出力しながら認証処理
4. 成功時: トークンを生成し、フロントエンドに返却
5. フロントエンドがトークンをlocalStorageに保存
6. メイン画面を表示

### ページリロード時
1. localStorageからトークンを読み込み
2. `/api/status`エンドポイントでトークンを検証
3. 有効な場合: 最新のユーザー情報を取得して画面を表示
4. 無効な場合: トークンをクリアしてログイン画面を表示

---

## デバッグ方法

### バックエンドログの確認
サーバーコンソールで以下のようなログが表示されます：

```
============================================================
[LOGIN] Login attempt started
[LOGIN] Email: admin@smartbuilder.ai
[LOGIN] Password length: 8
[LOGIN] Users found: 1
[LOGIN] User ID: admin
[LOGIN] User role: admin
[LOGIN] Password validation result: True
[OK] Login successful - generating token
[OK] Token generated (first 20 chars): eyJhbGciOiJIUzI1NiIsIn...
============================================================
```

### フロントエンドログの確認
ブラウザのコンソール（F12）で以下のようなログが表示されます：

```
Attempting login... {email: "admin@smartbuilder.ai"}
Login response status: 200
Login successful {role: "admin", user_id: "admin"}
```

---

## トラブルシューティング

### ログインに失敗する場合

1. **ブラウザコンソールを確認**
   - F12を押してコンソールタブを開く
   - エラーメッセージを確認

2. **サーバーログを確認**
   - ターミナルでサーバーのログを確認
   - `[ERROR]`で始まる行を探す

3. **管理者アカウントの確認**
   ```bash
   python check_admin.py
   ```

4. **パスワードハッシュのテスト**
   ```bash
   python test_login.py
   ```

### トークンが無効になる場合

- トークンの有効期限: 60分（`config.py`の`ACCESS_TOKEN_EXPIRE_MINUTES`で設定）
- トークンが期限切れの場合は再ログインが必要

---

## 次のステップ

### 推奨される追加改善

1. **リフレッシュトークンの実装**
   - アクセストークンが期限切れになる前に自動更新

2. **レート制限の実装**
   - ログイン試行回数を制限してブルートフォース攻撃を防ぐ

3. **監査ログの実装**
   - ログイン成功/失敗のログをFirestoreに保存

4. **2要素認証（2FA）の実装**
   - セキュリティ強化のため

---

## 管理者アカウント情報

```
メールアドレス: admin@smartbuilder.ai
パスワード: password
ロール: admin
プラン: unlimited (99999件/月)
```

---

## 関連ファイル

- `routers/auth.py` - 認証エンドポイント
- `services/auth_service.py` - 認証サービス
- `database.py` - データベース設定
- `index.html` - フロントエンド
- `check_admin.py` - 管理者アカウント確認スクリプト
- `test_login.py` - ログインテストスクリプト

---

**このレポートを参照することで、ログイン関連の問題を迅速に診断・修正できます。**
