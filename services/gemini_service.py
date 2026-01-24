"""
Gemini AI サービス
画像解析機能を提供
"""
import time
import json
import re
from datetime import datetime
import google.generativeai as genai
import config

# Gemini 設定
genai.configure(api_key=config.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-pro')


def validate_and_fix_date(date_str: str) -> str:
    """日付を検証し、和暦変換ミスを修正する"""
    if not date_str:
        return date_str

    try:
        # YYYY-MM-DD形式をパース
        match = re.match(r'(\d{4})-(\d{2})-(\d{2})', date_str)
        if not match:
            return date_str

        year = int(match.group(1))
        month = match.group(2)
        day = match.group(3)

        current_year = datetime.now().year

        # 1990年代の日付は令和と平成の誤認識の可能性が高い
        # 平成N年 → 令和N年への修正（+30年）
        if 1989 <= year <= 1999:
            # 平成1-11年 → 令和1-11年の可能性
            # 平成年 + 1988 = 西暦 → 令和年 + 2018 = 西暦
            # 差分は 2018 - 1988 = 30年
            corrected_year = year + 30
            if corrected_year <= current_year + 1:  # 来年までは許容
                print(f"⚠️ 日付修正: {year}年 → {corrected_year}年（令和への変換ミスを修正）")
                return f"{corrected_year}-{month}-{day}"

        # 2000-2018年の場合も念のためチェック
        # ただし、これらは有効な日付の可能性もあるので警告のみ
        if 2000 <= year <= 2018:
            print(f"⚠️ 警告: 日付が{year}年です。古い領収書でなければ確認してください。")

        # 未来の日付（2年以上先）は警告
        if year > current_year + 1:
            print(f"⚠️ 警告: 日付が未来（{year}年）です。")

        return date_str

    except Exception as e:
        print(f"日付検証エラー: {e}")
        return date_str


def analyze_with_gemini_retry(file_path: str, max_retries: int = 3) -> dict:
    """Gemini APIを使用して画像を解析（リトライ機能付き）"""
    for attempt in range(max_retries):
        try:
            print(f"Gemini API attempt {attempt + 1}/{max_retries}...")

            # ファイルをアップロード
            genai_file = genai.upload_file(path=file_path)

            # 処理待ち
            while genai_file.state.name == "PROCESSING":
                time.sleep(1)
                genai_file = genai.get_file(genai_file.name)

            # 解析実行
            response = model.generate_content([genai_file, config.GEMINI_PROMPT])

            if not response.text:
                raise ValueError("Gemini APIからの応答が空です")

            # JSONをパース
            data_list = json.loads(response.text.strip().replace('```json', '').replace('```', ''))

            # 日付の検証と修正
            if isinstance(data_list, list):
                for item in data_list:
                    if "date" in item:
                        item["date"] = validate_and_fix_date(item["date"])
            elif isinstance(data_list, dict) and "date" in data_list:
                data_list["date"] = validate_and_fix_date(data_list["date"])

            print(f"✅ Gemini analysis successful")
            return data_list

        except Exception as e:
            print(f"❌ Gemini API error (attempt {attempt + 1}): {str(e)}")

            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 指数バックオフ: 1秒, 2秒, 4秒
                print(f"Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                raise Exception(f"Gemini API解析に失敗しました（{max_retries}回試行）: {str(e)}")
