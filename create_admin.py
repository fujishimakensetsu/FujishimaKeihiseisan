import os
from google.cloud import firestore
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# 認証情報を設定
credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if credentials_path and not os.path.isabs(credentials_path):
    credentials_path = os.path.join(os.getcwd(), credentials_path)
if credentials_path:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path

db = firestore.Client()
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# adminユーザーを作成
admin_ref = db.collection("users").document("admin")

# 既存のadminを削除して再作成
try:
    admin_ref.delete()
    print("既存のadminユーザーを削除しました")
except:
    pass

# 新しいadminを作成
hashed_password = pwd_context.hash("password")
print(f"パスワードハッシュ: {hashed_password[:50]}...")

admin_ref.set({
    "email": "admin@smartbuilder.ai",
    "password": hashed_password,
    "role": "admin",
    "created_at": firestore.SERVER_TIMESTAMP,
    "line_user_id": None,
    "subscription": {
        "plan": "unlimited",
        "status": "active",
        "limit": 99999,
        "used": 0,
        "stripe_customer_id": None,
        "stripe_subscription_id": None,
        "current_period_start": None,
        "current_period_end": None,
        "cancel_at_period_end": False
    }
})

print("[OK] adminユーザーを作成しました")
print("メールアドレス: admin@smartbuilder.ai")
print("パスワード: password")

# 確認
doc = admin_ref.get()
if doc.exists:
    data = doc.to_dict()
    print(f"\n確認:")
    print(f"  - Email: {data.get('email')}")
    print(f"  - Role: {data.get('role')}")
    print(f"  - Password (ハッシュ): {data.get('password')[:50]}...")
else:
    print("[ERROR] エラー: ユーザーが作成されませんでした")