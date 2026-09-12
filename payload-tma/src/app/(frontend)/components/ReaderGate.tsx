'use client'

import { useEffect, useState } from 'react'

import { getInitData, getTelegramWebApp } from '@/lib/telegram-client'

import { EmailRgpdModal } from './EmailRgpdModal'

// Monté une fois dans le layout. Hors de l'app Telegram (navigateur classique
// en dev), window.Telegram.WebApp n'existe pas : on ne bloque rien.
export function ReaderGate() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const webApp = getTelegramWebApp()
    if (!webApp) return

    webApp.ready()
    webApp.expand?.()

    const initData = getInitData()
    if (!initData) return

    fetch('/api/telegram/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.hasEmail) setShowModal(true)
      })
      .catch(() => {
        // Réseau indisponible ou initData invalide : on ne bloque pas la lecture.
      })
  }, [])

  if (!showModal) return null

  return (
    <EmailRgpdModal onSuccess={() => setShowModal(false)} onDismiss={() => setShowModal(false)} />
  )
}
