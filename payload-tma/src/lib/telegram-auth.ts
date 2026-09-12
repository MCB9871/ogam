import crypto from 'crypto'

type TelegramUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

type VerifiedInitData = {
  user: TelegramUser
  authDate: number
}

// Vérifie la signature HMAC de l'initData fourni par le WebApp Telegram, selon
// l'algorithme officiel :
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// Ne fait JAMAIS confiance à un telegramId envoyé tel quel par le client — on
// ne le récupère qu'après vérification de la signature, ici.
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86400,
): VerifiedInitData | null {
  if (!botToken || !initData) return null

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  if (computedHash !== hash) return null

  const authDate = Number(params.get('auth_date') || '0')
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSeconds) return null

  const userRaw = params.get('user')
  if (!userRaw) return null

  try {
    const user = JSON.parse(userRaw) as TelegramUser
    if (!user?.id) return null
    return { user, authDate }
  } catch {
    return null
  }
}
