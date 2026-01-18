"""ログイン処理のテストスクリプト"""
from google.cloud import firestore
from database import pwd_context
import config

db = firestore.Client()

# テスト: メールアドレスでユーザーを検索
email = "admin@smartbuilder.ai"
password = "password"

print("=== Login Test ===")
print(f"Email: {email}")
print(f"Password: {password}")
print()

# Step 1: ユーザー検索
print("Step 1: Searching for user...")
users = db.collection(config.COL_USERS).where("email", "==", email).limit(1).stream()
user_list = list(users)

if not user_list:
    print("[ERROR] User not found!")
else:
    print(f"[OK] User found: {len(user_list)} result(s)")

    user_doc = user_list[0]
    user_id = user_doc.id
    user_data = user_doc.to_dict()

    print(f"User ID: {user_id}")
    print(f"User email: {user_data.get('email')}")
    print(f"User role: {user_data.get('role')}")
    print(f"Password hash (first 50): {user_data.get('password', '')[:50]}...")
    print()

    # Step 2: パスワード検証
    print("Step 2: Verifying password...")
    try:
        stored_hash = user_data["password"]
        is_valid = pwd_context.verify(password, stored_hash)

        if is_valid:
            print("[OK] Password is correct!")
        else:
            print("[ERROR] Password is incorrect!")
    except Exception as e:
        print(f"[ERROR] Password verification failed: {str(e)}")
