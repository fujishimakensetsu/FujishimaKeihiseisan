"""管理者アカウントの確認スクリプト"""
from google.cloud import firestore

db = firestore.Client()

# 管理者アカウントの存在確認
admin_doc = db.collection('users').document('admin').get()

if admin_doc.exists:
    data = admin_doc.to_dict()
    print("=== Admin Account Info ===")
    print(f"Email: {data.get('email')}")
    print(f"Role: {data.get('role')}")
    print(f"Password hash (first 50 chars): {data.get('password', '')[:50]}...")
    print(f"Line User ID: {data.get('line_user_id')}")
    print(f"Subscription plan: {data.get('subscription', {}).get('plan')}")
else:
    print("[ERROR] Admin account does not exist!")
    print("Please run: python create_admin.py")
