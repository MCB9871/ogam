"""API interne, appelée uniquement par Payload (hooks) et par la TMA (Next.js),
jamais exposée publiquement (tourne sur 127.0.0.1, derrière le Cloudflare
Tunnel qui ne route que le port de Next.js — pas celui-ci).

Trois routes :
- POST /publish/text/{id}          -> post AUTO (déclenché par Texts.telegramAutoPost)
- POST /publish/channel-post/{id}  -> post MANUEL (déclenché par ChannelPosts)
- POST /create-invoice             -> crée un lien de facture Stars pour la TMA

`app.state.bot` doit être renseigné par main.py avant de démarrer le serveur.
"""

import httpx
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

import payload_client
from config import BOT_INTERNAL_SECRET, PAYLOAD_URL, TELEGRAM_CHANNEL_ID, TMA_DEEPLINK_BASE
from telegram_bot.payments import create_invoice_link

app = FastAPI()


def _check_secret(x_internal_secret: str | None) -> None:
    if x_internal_secret != BOT_INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Secret interne invalide")


async def _fetch_image_bytes(media_doc: dict | None) -> bytes | None:
    """Télécharge lui-même l'image depuis Payload (accessible en interne, même
    en dev sur localhost) plutôt que de passer une URL à Telegram — les
    serveurs Telegram ne peuvent pas atteindre un `localhost` qui n'est pas
    public. Envoyer les octets directement fonctionne quel que soit
    l'environnement (dev ou prod), sans dépendre de la joignabilité publique
    de Payload juste pour une image."""
    if not media_doc:
        return None
    url = media_doc.get("sizes", {}).get("card", {}).get("url") or media_doc.get("url")
    if not url:
        return None
    if url.startswith("/"):
        url = f"{PAYLOAD_URL}{url}"

    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.content


@app.post("/publish/text/{text_id}")
async def publish_text_auto(text_id: str, x_internal_secret: str | None = Header(default=None)):
    """Post AUTO — réutilise titre/excerpt/image d'un texte. Déclenché par le
    hook `telegramAutoPost` de la collection Texts, une seule fois par texte."""
    _check_secret(x_internal_secret)

    text = await payload_client.get_document("texts", text_id, depth=1)
    bot = app.state.bot

    message = f"*{text['title']}*"
    if text.get("excerpt"):
        message += f"\n\n{text['excerpt']}"

    button_label = text.get("telegramAutoPost", {}).get("buttonLabel") or "Lire dans l'app"
    deeplink = f"{TMA_DEEPLINK_BASE}?startapp=text_{text_id}"
    reply_markup = InlineKeyboardMarkup([[InlineKeyboardButton(button_label, url=deeplink)]])

    image_bytes = await _fetch_image_bytes(text.get("coverImage"))

    if image_bytes:
        await bot.send_photo(
            chat_id=TELEGRAM_CHANNEL_ID,
            photo=image_bytes,
            caption=message,
            parse_mode="Markdown",
            reply_markup=reply_markup,
        )
    else:
        await bot.send_message(
            chat_id=TELEGRAM_CHANNEL_ID,
            text=message,
            parse_mode="Markdown",
            reply_markup=reply_markup,
        )
    return {"ok": True}


@app.post("/publish/channel-post/{post_id}")
async def publish_channel_post_manual(post_id: str, x_internal_secret: str | None = Header(default=None)):
    """Post MANUEL — message libre composé dans ChannelPosts. Déclenché
    uniquement quand `status` passe à "sent", jamais automatiquement."""
    _check_secret(x_internal_secret)

    post = await payload_client.get_document("channel-posts", post_id, depth=1)
    bot = app.state.bot

    message = post["message"]

    reply_markup = None
    if post.get("buttonEnabled"):
        label = post.get("buttonLabel") or "Voir dans l'app"
        related_text = post.get("relatedText")
        if related_text:
            start_param = f"text_{related_text['id'] if isinstance(related_text, dict) else related_text}"
        elif post.get("startAppOverride"):
            start_param = post["startAppOverride"]
        else:
            start_param = None

        if start_param:
            deeplink = f"{TMA_DEEPLINK_BASE}?startapp={start_param}"
            reply_markup = InlineKeyboardMarkup([[InlineKeyboardButton(label, url=deeplink)]])

    await bot.send_message(
        chat_id=TELEGRAM_CHANNEL_ID,
        text=message,
        parse_mode="Markdown",
        reply_markup=reply_markup,
    )
    return {"ok": True}


class CreateInvoiceRequest(BaseModel):
    item_type: str  # "audio_unlock" | "product" | "event_ticket"
    item_id: str
    telegram_user_id: int


@app.post("/create-invoice")
async def create_invoice(body: CreateInvoiceRequest, x_internal_secret: str | None = Header(default=None)):
    _check_secret(x_internal_secret)

    bot = app.state.bot
    link = await create_invoice_link(bot, body.item_type, body.item_id, body.telegram_user_id)
    return {"invoiceLink": link}
