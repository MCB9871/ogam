"""Point d'entrée unique : lance en parallèle
1) le polling Telegram (pre_checkout_query, successful_payment)
2) l'API interne FastAPI (publication canal, création de facture Stars)

Aucune UX conversationnelle — ce bot ne répond à aucun message texte, il gère
uniquement les callbacks systèmes (paiement) et sert d'exécutant pour Payload.
"""

import asyncio

import uvicorn
from telegram.ext import Application, MessageHandler, PreCheckoutQueryHandler, filters

import internal_api.app as internal_api_module
from config import INTERNAL_API_HOST, INTERNAL_API_PORT, TELEGRAM_BOT_TOKEN
from telegram_bot.handlers import pre_checkout_query_handler, successful_payment_handler


async def main() -> None:
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(PreCheckoutQueryHandler(pre_checkout_query_handler))
    application.add_handler(
        MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment_handler)
    )

    # Partage l'instance du bot avec l'API interne (routes /publish, /create-invoice)
    internal_api_module.app.state.bot = application.bot

    server_config = uvicorn.Config(
        internal_api_module.app,
        host=INTERNAL_API_HOST,
        port=INTERNAL_API_PORT,
        log_level="info",
    )
    server = uvicorn.Server(server_config)

    await application.initialize()
    await application.start()
    await application.updater.start_polling()

    try:
        await server.serve()
    finally:
        await application.updater.stop()
        await application.stop()
        await application.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
