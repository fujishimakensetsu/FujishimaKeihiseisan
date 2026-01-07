FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
# 以下の形式に書き換えてください（シェルを介して環境変数を確実に展開します）
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}