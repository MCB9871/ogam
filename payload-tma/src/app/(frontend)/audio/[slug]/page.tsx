import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'

type Props = {
  params: Promise<{ slug: string }>
}

function tierLabel(tier: string): string {
  if (tier === 'season') return 'Pack saison'
  if (tier === 'lifetime') return 'Accès à vie'
  return "À l'unité"
}

export default async function AudioEpisodePage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'audio',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 1, // pour peupler relatedText
    limit: 1,
  })

  const episode = docs[0] as any
  if (!episode) notFound()

  return (
    <main className="page-shell">
      <p className="article-meta">
        {episode.seasonNumber ? `Saison ${episode.seasonNumber} · ` : ''}
        {episode.episodeNumber ? `Épisode ${episode.episodeNumber}` : ''}
      </p>
      <h1 className="article-title">{episode.title}</h1>

      <span className="price-pill">
        {tierLabel(episode.unlockTier)}
        {episode.priceStars ? ` · ${episode.priceStars} ★` : ''}
      </span>

      <div className="article-body" style={{ marginTop: '1.5rem' }}>
        {/* Lecture réelle en attente du paiement Stars côté front (voir
            CONTEXTE_ADDENDUM_2026-08-31.md, point 2) — ne pas exposer le
            fichier audio ici tant qu'il n'y a pas de vérification d'achat. */}
        <p className="timeline-empty" style={{ padding: 0 }}>
          Déblocage via paiement Telegram Stars — bientôt disponible.
        </p>
      </div>

      {episode.relatedText ? (
        <div className="cross-sell">
          Ce contenu accompagne un texte de l'archive.{' '}
          <Link href={`/textes/${episode.relatedText.slug}`}>Le lire →</Link>
        </div>
      ) : null}

      <div>
        <Link href="/audio" className="back-link">
          ← Retour à l'audio
        </Link>
      </div>
    </main>
  )
}
