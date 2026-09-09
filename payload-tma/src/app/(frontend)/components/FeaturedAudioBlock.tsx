import Link from 'next/link'

import type { FeaturedAudioData } from '@/lib/featured'

function tierLabel(tier?: string): string {
  if (tier === 'season') return 'Pack saison'
  if (tier === 'lifetime') return 'Accès à vie'
  return "À l'unité"
}

// Bloc "à la une" spécifique à l'onglet Audio : pointe vers l'épisode audio
// du texte à la une, pas vers le texte (voir lib/featured.ts, getFeaturedAudio).
export function FeaturedAudioBlock({ data }: { data: FeaturedAudioData }) {
  if (data.kind === 'none') return null

  if (data.kind === 'override') {
    return (
      <section className="hero">
        <span className="hero-eyebrow">À la une</span>
        <h1 className="hero-title">
          {data.link ? <Link href={data.link}>{data.title}</Link> : data.title}
        </h1>
        {data.body ? <p className="hero-excerpt">{data.body}</p> : null}
      </section>
    )
  }

  return (
    <section className="hero">
      <span className="hero-eyebrow">À la une</span>
      <h1 className="hero-title">
        <Link href={`/audio/${data.slug}`}>{data.title}</Link>
      </h1>
      <span className="price-pill">
        {tierLabel(data.unlockTier)}
        {data.priceStars ? ` · ${data.priceStars} ★` : ''}
      </span>
    </section>
  )
}
