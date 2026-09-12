import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { BuyButton } from '../../components/BuyButton'

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

      <span className="price-pill">{tierLabel(episode.unlockTier)}</span>

      <div className="article-body" style={{ marginTop: '1.5rem' }}>
        <BuyButton
          itemType="audio_unlock"
          itemId={episode.id}
          priceStars={episode.priceStars}
        />
        {/* Le lecteur réel s'affichera ici une fois l'achat vérifié côté
            serveur (pas encore construit — voir CONTEXTE_ADDENDUM_2026-09-12.md §8). */}
        <p className="timeline-empty" style={{ padding: '1rem 0 0' }}>
          Le lecteur s'active automatiquement une fois l'achat confirmé.
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
