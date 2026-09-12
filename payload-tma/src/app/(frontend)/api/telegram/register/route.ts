import { NextResponse } from 'next/server'

import { verifyTelegramInitData } from '@/lib/telegram-auth'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  if (!body?.initData || !body?.email) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  if (!body.rgpdAccepted) {
    return NextResponse.json({ error: 'Consentement RGPD requis' }, { status: 400 })
  }

  const verified = verifyTelegramInitData(body.initData, process.env.TELEGRAM_BOT_TOKEN || '')
  if (!verified) {
    return NextResponse.json({ error: 'initData invalide' }, { status: 401 })
  }

  const payload = await getPayloadClient()
  const telegramId = verified.user.id

  try {
    const { docs } = await payload.find({
      collection: 'readers',
      where: { telegramId: { equals: telegramId } },
      limit: 1,
    })

    const data = {
      email: body.email,
      telegramId,
      rgpdAccepted: true,
      rgpdAcceptedAt: new Date().toISOString(),
      optedInNewsletter: Boolean(body.optedInNewsletter),
    }

    if (docs[0]) {
      await payload.update({ collection: 'readers', id: docs[0].id, data })
    } else {
      await payload.create({ collection: 'readers', data })
    }

    return NextResponse.json({ ok: true })
  } catch {
    // Cas le plus probable : `email` déjà pris par un autre compte (contrainte unique).
    return NextResponse.json(
      { error: 'Cet email est peut-être déjà associé à un autre compte.' },
      { status: 409 },
    )
  }
}
