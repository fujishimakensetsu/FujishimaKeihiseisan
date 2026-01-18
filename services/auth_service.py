"""
認証サービス
JWT生成・検証、パスワード処理
"""
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, Request
from database import pwd_context
import config

def create_access_token(data: dict) -> str:
    """JWTトークンを生成"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワードを検証（bcryptの72バイト制限に対応）"""
    # bcryptは72バイトまでしか処理できないため、パスワードを切り詰める
    truncated_password = plain_password[:72] if len(plain_password.encode('utf-8')) > 72 else plain_password
    try:
        return pwd_context.verify(truncated_password, hashed_password)
    except ValueError as e:
        # bcryptのエラーが発生した場合はFalseを返す
        print(f"[WARNING] Password verification error: {str(e)}")
        return False

def hash_password(password: str) -> str:
    """パスワードをハッシュ化（bcryptの72バイト制限に対応）"""
    # bcryptは72バイトまでしか処理できないため、パスワードを切り詰める
    truncated_password = password[:72] if len(password.encode('utf-8')) > 72 else password
    return pwd_context.hash(truncated_password)

async def get_current_user(request: Request) -> str:
    """現在のユーザーIDをトークンから取得"""
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        payload = jwt.decode(token.split(" ")[1], config.SECRET_KEY, algorithms=[config.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user_optional(request: Request):
    """オプショナルな認証（トークンがない場合はNoneを返す）"""
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        return None
    try:
        payload = jwt.decode(token.split(" ")[1], config.SECRET_KEY, algorithms=[config.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
