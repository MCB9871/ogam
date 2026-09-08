import os

from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TELEGRAM_CHANNEL_ID = os.environ["TELEGRAM_CHANNEL_ID"]

PAYLOAD_URL = os.environ.get("PAYLOAD_URL", "http://localhost:3000")
PAYLOAD_API_KEY = os.environ["PAYLOAD_API_KEY"]

INTERNAL_API_HOST = os.environ.get("INTERNAL_API_HOST", "127.0.0.1")
INTERNAL_API_PORT = int(os.environ.get("INTERNAL_API_PORT", "8001"))
BOT_INTERNAL_SECRET = os.environ["BOT_INTERNAL_SECRET"]

TMA_DEEPLINK_BASE = os.environ.get("TMA_DEEPLINK_BASE", "https://t.me/tonbot/tonapp")
