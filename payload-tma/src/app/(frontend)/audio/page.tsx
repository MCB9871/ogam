import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { getFeaturedAudio } from '@/lib/featured'
import { FeaturedAudioBlock } from '../components/FeaturedAudioBlock'
import { HeadphonesIcon } from '../components/HeadphonesIcon'

type AudioDoc = {
  id: string
  title: string
  slug: string
  seasonNumber?: number
  episodeNumber?: number
  unlockTier: 'unit' | 'season' | 'lifetime'
  priceStars?: number
}

function tierLabel(tier: string): string {
  if (tier === 'season') return 'Pack saison'
  if (tier === 'lifetime') return 'Accès à vie'
  return "À l'unité"
}

export default async function AudioPage() {
  const payload = await getPayloadClient()

  const [{ docs: episodes }, featured] = await Promise.all([
    payload.find({
      collection: 'audio',
      where: { status: { equals: 'published' } },
      sort: '-createdAt',
      depth: 0,
      limit: 50,
    }),
    getFeaturedAudio(),
  ])

  const allEpisodes = episodes as unknown as AudioDoc[]

  return (
    <main className="page-shell">
      <FeaturedAudioBlock data={featured} />

      {allEpisodes.length > 0 ? (
        <ol className="timeline" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {allEpisodes.map((episode) => (
            <li key={episode.id} className="timeline-entry has-audio">
              <span className="timeline-stamp">
                {episode.seasonNumber ? `S${episode.seasonNumber}` : ''}
                {episode.episodeNumber ? ` E${episode.episodeNumber}` : ''}
              </span>
              <h2 className="timeline-title">
                <Link href={`/audio/${episode.slug}`}>{episode.title}</Link>
              </h2>
              <span className="price-pill">
                {tierLabel(episode.unlockTier)}
                {episode.priceStars ? ` · ${episode.priceStars} ★` : ''}
              </span>
              <Link
                href={`/audio/${episode.slug}`}
                className="audio-button"
                aria-label="Écouter cet épisode"
              >
                <HeadphonesIcon />
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="timeline-empty">Aucun épisode publié pour l'instant.</p>
      )}
    </main>
  )
}
