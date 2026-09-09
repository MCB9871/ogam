import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { getFeatured } from '@/lib/featured'
import { FeaturedBlock } from './components/FeaturedBlock'
import { HeadphonesIcon } from './components/HeadphonesIcon'

type TextDoc = {
  id: string
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
  // `audioVersion` est une vraie relation vers `audio` (Texts.ts), pas un
  // simple booléen — corrigé ici pour refléter la collection réelle.
  audioVersion?: { slug: string } | string | null
}

function formatStamp(dateString?: string): string {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(dateString))
    .toUpperCase()
}

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [{ docs: texts }, featured] = await Promise.all([
    payload.find({
      collection: 'texts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 1, // pour peupler audioVersion (relation)
      limit: 30,
    }),
    getFeatured(),
  ])

  const allTexts = texts as unknown as TextDoc[]
  const restTexts =
    featured.kind === 'text' ? allTexts.filter((t) => t.id !== featured.id) : allTexts

  return (
    <main className="page-shell">
      <FeaturedBlock data={featured} />

      {restTexts.length > 0 ? (
        <ol className="timeline" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {restTexts.map((text) => (
            <li
              key={text.id}
              className={text.audioVersion ? 'timeline-entry has-audio' : 'timeline-entry'}
            >
              <span className="timeline-stamp">{formatStamp(text.publishedAt)}</span>
              <h2 className="timeline-title">
                <Link href={`/textes/${text.slug}`}>{text.title}</Link>
              </h2>
              {text.excerpt ? <p className="timeline-excerpt">{text.excerpt}</p> : null}
              {text.audioVersion && typeof text.audioVersion === 'object' ? (
                <Link
                  href={`/audio/${text.audioVersion.slug}`}
                  className="audio-button"
                  aria-label="Écouter la version audio de ce texte"
                >
                  <HeadphonesIcon />
                </Link>
              ) : null}
            </li>
          ))}
        </ol>
      ) : featured.kind === 'none' ? (
        <p className="timeline-empty">Aucun texte publié pour l'instant.</p>
      ) : null}
    </main>
  )
}
