"""Handlers du flux de paiement Stars, reçus via polling (getUpdates).

pre_checkout_query doit être répondu sous 10s (limite Telegram) — on répond vite,
sans appel bloquant lourd. successful_payment fait le travail de fond : créer
l'Order dans Payload, puis les actions spécifiques au type d'achat (lien
d'invitation événement à usage unique, notification, etc.).
"""

import json
import time

from telegram import Update
from telegram.ext import ContextTypes

import payload_client


async def pre_checkout_query_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.pre_checkout_query
    # Validation minimale et rapide (pas d'appel réseau lourd ici, la limite
    # Telegram est de 10 secondes). La vérification de cohérence prix/produit
    # a déjà eu lieu au moment de create_invoice_link ; on pourrait re-vérifier
    # ici si des cas d'abus apparaissent (TODO si besoin).
    await query.answer(ok=True)


async def successful_payment_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    payment = update.message.successful_payment
    item_type, item_id, telegram_user_id_str = payment.invoice_payload.split(":")
    telegram_user_id = int(telegram_user_id_str)

    order = await payload_client.create_document(
        "orders",
        {
            "type": item_type,
            "telegramUserId": telegram_user_id,
            "itemsJson": json.dumps({"itemId": item_id}),
            "totalStars": payment.total_amount,
            "telegramPaymentChargeId": payment.telegram_payment_charge_id,
            "status": "paid",
        },
    )

    if item_type == "event_ticket":
        await _handle_event_ticket(update, context, item_id, order)
    elif item_type == "audio_unlock":
        await update.message.reply_text(
            "Merci pour votre achat ! L'audio est maintenant débloqué dans l'app."
        )
    elif item_type == "product":
        # TODO : le flow boutique physique (adresse de livraison, notification
        # admin) n'est pas encore branché ici — reste à faire quand la
        # boutique sera activée (§7 CONTEXTE_TMA_v2.md, boutique masquée pour
        # l'instant).
        await update.message.reply_text("Merci pour votre commande !")


async def _handle_event_ticket(update, context, event_id: str, order: dict) -> None:
    event = await payload_client.get_document("events", event_id)
    private_channel_id = event.get("privateChannelId")

    if not private_channel_id:
        await update.message.reply_text(
            "Achat confirmé, mais aucun canal privé n'est configuré pour cet "
            "événement — contacte-nous pour recevoir ton accès."
        )
        return

    event_date = event.get("date")
    expire_timestamp = None
    if event_date:
        # `date` vient de Payload au format ISO ; on l'utilise comme expiration
        # du lien d'invitation (caduc après la date de l'événement, §5).
        expire_timestamp = int(time.mktime(time.strptime(event_date[:19], "%Y-%m-%dT%H:%M:%S")))

    invite_link = await context.bot.create_chat_invite_link(
        chat_id=private_channel_id,
        member_limit=1,  # usage unique — pas de fuite d'accès possible (§5)
        expire_date=expire_timestamp,
    )

    await payload_client.update_document(
        "orders", order["doc"]["id"], {"eventInviteLink": invite_link.invite_link}
    )

    await update.message.reply_text(
        f"Billet confirmé ! Voici ton accès (usage unique) : {invite_link.invite_link}"
    )
