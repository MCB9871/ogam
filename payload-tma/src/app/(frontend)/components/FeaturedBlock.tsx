import Link from 'next/link'

import type { FeaturedData } from '@/lib/featured'
import { HeadphonesIcon } from './HeadphonesIcon'

// Rendu du bloc "à la une", partagé par les 4 onglets (§3 CONTEXTE_TMA_v2.md).
// Volontairement appelé page par page plutôt que dans layout.tsx, pour ne pas
// l'afficher aussi sur les pages détail (texte/produit/audio/événement).
export function FeaturedBlock({ data }: { data: FeaturedData }) {
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
        <Link href={`/textes/${data.slug}`}>{data.title}</Link>
      </h1>
      {data.excerpt ? <p className="hero-excerpt">{data.excerpt}</p> : null}
      {data.audioSlug ? (
        <Link
          href={`/audio/${data.audioSlug}`}
          className="audio-button"
          aria-label="Écouter la version audio de ce texte"
        >
          <HeadphonesIcon />
        </Link>
      ) : null}
    </section>
  )
}
