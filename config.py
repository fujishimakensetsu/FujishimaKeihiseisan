"""
設定ファイル
環境変数や定数を一元管理
"""
import os
from dotenv import load_dotenv

load_dotenv()

# === 環境変数 ===
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-123")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
LINE_CHANNEL_ACCESS_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
LINE_CHANNEL_SECRET = os.getenv("LINE_CHANNEL_SECRET")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")

# === JWT設定 ===
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24時間

# === Cloud Storage設定 ===
BUCKET_NAME = "fujishima-receipt-storage"

# === Firestore コレクション名 ===
COL_USERS = "users"
COL_LINE_TOKENS = "line_tokens"

# === ディレクトリ設定 ===
UPLOAD_DIR = "uploads"
FONT_DIR = "fonts"

# === Gemini AI プロンプト ===
GEMINI_PROMPT = """領収書を解析し、以下のJSON形式で返してください:
[ { "date": "YYYY-MM-DD", "vendor_name": "店舗名", "total_amount": 数値, "is_ic_transport": true/false, "is_parking": true/false } ]

【重要：is_ic_transportフラグ（厳密な判定）】
以下の条件を「すべて」満たす場合のみ true にしてください:
- 書類のタイトルや見出しに「ICカード交通費」または「IC交通費」という文言が明示的に記載されている
- この文言は書類の上部やタイトル部分に表示されている必要があります

以下の場合は false にしてください:
- 単なる交通系ICカード（Suica、PASMO、ICOCA等）の利用履歴や明細
- 「ICカード利用明細」「IC利用履歴」などの表記のみの場合
- 駅の券売機やチャージ機で発行された履歴印字
- 通常の領収書やレシート
- 交通費の領収書であっても「ICカード交通費」の文言がない場合

※「ICカード交通費」専用のフォーマット（会社や経費精算システムで出力されるPDF等）のみがtrueの対象です

【重要：is_parkingフラグ（駐車場代の判定）】
以下のいずれかの条件を満たす場合は true:
- 「発券機」「入庫時刻」「入庫時間」「出庫時刻」「出庫時間」「駐車料金」「駐車時間」「駐車時刻」の表記がある
- 「駐車場」「パーキング」「コインパーキング」「parking」「P代」の表記がある
- 駐車場の領収書・精算書と判断できる場合

【重要：駐輪場は駐車場に含めない】
- 「駐輪場」「駐輪」「自転車」「サイクル」の表記がある場合は、is_parking を false にしてください
- 駐輪場の料金は駐車場代とは別扱いになります

【重要：日付の変換ルール】
1. 和暦が記載されている場合は必ず西暦に変換してください
2. 令和（R, R.）の変換: 令和1年=2019年、令和7年=2025年、令和8年=2026年
   - 計算式: 西暦 = 令和年 + 2018
3. 平成（H, H.）の変換: 平成31年=2019年（平成は2019年4月30日で終了）
   - 計算式: 西暦 = 平成年 + 1988
4. 年が2桁のみの場合（25, 26等）は2025年、2026年と解釈
5. 「R7」「令7」「令和7」はすべて令和7年=2025年
6. 現在は令和時代（2019年5月1日〜）です。「7年」と書かれていれば令和7年=2025年

【注意】
- 領収書の日付が1990年代になることは通常ありません
- 日付が2020年より前になった場合は、和暦の変換ミスの可能性があります"""

# === サブスクプラン定義 ===
PLANS = {
    "free": {
        "name": "無料プラン",
        "limit": 10,
        "price": 0,
        "currency": "jpy",
        "stripe_price_id": None,
        "features": [
            "月10件まで",
            "基本的な解析機能",
            "CSV/Excelエクスポート"
        ]
    },
    "premium": {
        "name": "プレミアムプラン",
        "limit": 100,
        "price": 980,
        "currency": "jpy",
        "stripe_price_id": None,
        "features": [
            "月100件まで",
            "高精度AI解析",
            "PDF対応",
            "LINE連携",
            "優先サポート"
        ]
    },
    "enterprise": {
        "name": "エンタープライズプラン",
        "limit": 1000,
        "price": 4980,
        "currency": "jpy",
        "stripe_price_id": None,
        "features": [
            "月1000件まで",
            "全機能利用可能",
            "API連携",
            "専任サポート",
            "カスタマイズ対応"
        ]
    },
    "unlimited": {
        "name": "無制限プラン（管理者用）",
        "limit": 99999,
        "price": 0,
        "currency": "jpy",
        "stripe_price_id": None,
        "features": ["全機能無制限"]
    }
}

# === Stripe設定 ===
STRIPE_ENABLED = False

# === CORS設定 ===
ALLOWED_ORIGINS = [
    "https://fujishima-keihiseisan-4ihgmtlxmq-an.a.run.app",  # 本番URL
    "http://localhost:8000",  # ローカル開発用
    "http://127.0.0.1:8000",  # ローカル開発用
]
