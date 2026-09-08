"""Création de liens de facture Telegram Stars (currency XTR).

Un seul point d'entrée `create_invoice_link`, appelé depuis l'API interne
(la TMA demande une facture avant d'appeler Telegram.WebApp.openInvoice côté
client). Le prix vient toujours de Payload, jamais du front — on ne fait pas
confiance à ce que le client annonce comme prix.
"""

from telegram import Bot, LabeledPrice

import payload_client

# TODO (ouvert, §6 CONTEXTE_TMA_v2.md) : les tiers/prix eux-mêmes (seuil du pass
# lifetime, mécanique mécène) ne sont pas tranchés. Ce module se contente de lire
# le prix déjà stocké dans Payload (`priceStars` / `ticketPriceStars`), quel
# qu'il soit — il n'encode aucune règle de prix en dur.


async def create_invoice_link(bot: Bot, item_type: str, item_id: str, telegram_user_id: int) -> str:
    if item_type == "audio_unlock":
        audio = await payload_client.get_document("audio", item_id)
        title = audio["title"]
        price_stars = audio["priceStars"]
        description = "Déblocage audio"
    elif item_type == "event_ticket":
        event = await payload_client.get_document("events", item_id)
        title = event["title"]
        price_stars = event["ticketPriceStars"]
        description = "Billet événement"
    elif item_type == "product":
        product = await payload_client.get_document("products", item_id)
        title = product["title"]
        price_stars = product["priceStars"]
        description = "Commande boutique"
    else:
        raise ValueError(f"Type d'item inconnu : {item_type}")

    # Le payload de la facture (invisible pour l'acheteur) permet de retrouver
    # le contexte exact dans le handler `successful_payment`.
    invoice_payload = f"{item_type}:{item_id}:{telegram_user_id}"

    return await bot.create_invoice_link(
        title=title,
        description=description,
        payload=invoice_payload,
        currency="XTR",
        prices=[LabeledPrice(label=title, amount=price_stars)],
    )
