import { NextResponse } from 'next/server'

import { verifyTelegramInitData } from '@/lib/telegram-auth'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const initData = body?.initData

  if (!initData) {
    return NextResponse.json({ error: 'initData manquant' }, { status: 400 })
  }

  const verified = verifyTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN || '')
  if (!verified) {
    return NextResponse.json({ error: 'initData invalide' }, { status: 401 })
  }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'readers',
    where: { telegramId: { equals: verified.user.id } },
    limit: 1,
  })

  const reader = docs[0] as { email?: string } | undefined

  return NextResponse.json({
    telegramId: verified.user.id,
    hasEmail: Boolean(reader?.email),
    email: reader?.email ?? null,
  })
}
