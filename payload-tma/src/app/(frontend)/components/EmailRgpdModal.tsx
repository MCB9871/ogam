'use client'

import { useState, type FormEvent } from 'react'

import { getInitData } from '@/lib/telegram-client'

type Props = {
  onSuccess: () => void
  onDismiss: () => void
}

export function EmailRgpdModal({ onSuccess, onDismiss }: Props) {
  const [email, setEmail] = useState('')
  const [rgpdAccepted, setRgpdAccepted] = useState(false)
  const [optedInNewsletter, setOptedInNewsletter] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!rgpdAccepted) {
      setStatus('error')
      setErrorMessage('Merci de valider le consentement RGPD pour continuer.')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/telegram/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: getInitData(), email, rgpdAccepted, optedInNewsletter }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setStatus('error')
        setErrorMessage(data?.error ?? 'Une erreur est survenue.')
        return
      }

      onSuccess()
    } catch {
      setStatus('error')
      setErrorMessage('Impossible de valider pour le moment, réessaie plus tard.')
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2 className="modal-title">Reste informé·e</h2>
        <p className="modal-body">
          Laisse ton email pour recevoir les nouveautés, indépendamment de Telegram. Il ne sera
          jamais partagé.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="ton@email.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="modal-input"
          />
          <label className="modal-checkbox">
            <input
              type="checkbox"
              checked={rgpdAccepted}
              onChange={(e) => setRgpdAccepted(e.target.checked)}
            />
            J'accepte que mon email soit utilisé pour être recontacté·e (RGPD).
          </label>
          <label className="modal-checkbox">
            <input
              type="checkbox"
              checked={optedInNewsletter}
              onChange={(e) => setOptedInNewsletter(e.target.checked)}
            />
            Je veux aussi recevoir les annonces occasionnelles par email.
          </label>
          {status === 'error' ? <p className="buy-error">{errorMessage}</p> : null}
          <div className="modal-actions">
            <button type="button" className="modal-dismiss" onClick={onDismiss}>
              Plus tard
            </button>
            <button type="submit" className="buy-button" disabled={status === 'loading'}>
              {status === 'loading' ? 'Enregistrement…' : 'Valider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
