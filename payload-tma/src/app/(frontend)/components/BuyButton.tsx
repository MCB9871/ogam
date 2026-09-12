'use client'

import { useState } from 'react'

import { getInitData, getTelegramWebApp } from '@/lib/telegram-client'

type ItemType = 'audio_unlock' | 'product' | 'event_ticket'

type Props = {
  itemType: ItemType
  itemId: string
  priceStars?: number
  label?: string
}

// Bouton générique — utilisé sur Boutique, Audio et Événements. Ne gère que
// l'ouverture de la facture Stars ; la révélation du contenu après paiement
// (lecteur audio, lien billet) reste à câbler séparément (nécessite une
// vérification d'accès côté serveur, pas encore construite).
export function BuyButton({ itemType, itemId, priceStars, label }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'paid'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleClick() {
    const webApp = getTelegramWebApp()
    if (!webApp) {
      setStatus('error')
      setErrorMessage("Cette action n'est possible que depuis l'app Telegram.")
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/telegram/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: getInitData(), itemType, itemId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'invoice_failed')
      }

      const { invoiceLink } = await res.json()

      webApp.openInvoice(invoiceLink, (invoiceStatus) => {
        if (invoiceStatus === 'paid') {
          setStatus('paid')
          webApp.HapticFeedback?.notificationOccurred?.('success')
        } else {
          setStatus('idle')
        }
      })
    } catch {
      setStatus('error')
      setErrorMessage('Impossible de lancer le paiement, réessaie dans un instant.')
    }
  }

  if (status === 'paid') {
    return <span className="price-pill buy-success">Acheté ✓</span>
  }

  return (
    <div>
      <button type="button" className="buy-button" onClick={handleClick} disabled={status === 'loading'}>
        {status === 'loading'
          ? 'Ouverture du paiement…'
          : label ?? `Acheter${priceStars ? ` · ${priceStars} ★` : ''}`}
      </button>
      {status === 'error' ? <p className="buy-error">{errorMessage}</p> : null}
    </div>
  )
}
