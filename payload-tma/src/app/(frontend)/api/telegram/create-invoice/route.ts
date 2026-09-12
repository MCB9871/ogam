import { NextResponse } from 'next/server'

import { verifyTelegramInitData } from '@/lib/telegram-auth'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  if (!body?.initData || !body?.itemType || !body?.itemId) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const verified = verifyTelegramInitData(body.initData, process.env.TELEGRAM_BOT_TOKEN || '')
  if (!verified) {
    return NextResponse.json({ error: 'initData invalide' }, { status: 401 })
  }

  const botUrl = process.env.BOT_INTERNAL_URL
  const botSecret = process.env.BOT_INTERNAL_SECRET
  if (!botUrl || !botSecret) {
    return NextResponse.json({ error: 'Bot interne non configuré' }, { status: 500 })
  }

  try {
    const res = await fetch(`${botUrl}/create-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': botSecret },
      body: JSON.stringify({
        item_type: body.itemType,
        item_id: body.itemId,
        telegram_user_id: verified.user.id,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Échec de création de la facture' }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Bot interne injoignable' }, { status: 502 })
  }
}
