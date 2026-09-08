import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'

type TextDoc = {
  id: string
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
  featured?: boolean
  // Simple booléen pour l'instant (pas encore de collection Audio dédiée —
  // voir CONTEXTE_ADDENDUM). Hypothèse provisoire : la version audio d'un
  // texte partagera le même slug (`/audio/[slug]`). À ajuster quand Audio.ts
  // existera réellement (probablement remplacé par une vraie relation).
  audioVersion?: boolean
}

function formatStamp(dateString?: string): string {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(dateString))
    .toUpperCase()
}

// Icône casque (podcast/audio) — SVG inline, pas de dépendance ajoutée.
function HeadphonesIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  )
}

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [{ docs: texts }, siteSettings] = await Promise.all([
    payload.find({
      collection: 'texts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 0,
      limit: 30,
    }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  const allTexts = texts as unknown as TextDoc[]

  // `generate:types` est cassé (bug ESM/CJS tsx + richtext-lexical, voir
  // bot-telegram/README), donc pas de payload-types.ts généré pour l'instant —
  // typage volontairement souple ici (`any`) le temps que ce soit résolu.
  const settings = siteSettings as any

  // Bloc "à la une" (§3 CONTEXTE_TMA_v2.md) : override manuel du global en
  // priorité, sinon le texte marqué `featured`, sinon le plus récent publié.
  const override = settings?.featuredOverride
  const featuredText = allTexts.find((t) => t.featured) ?? allTexts[0]
  const restTexts = featuredText ? allTexts.filter((t) => t.id !== featuredText.id) : allTexts

  return (
    <main className="page-shell">
      {override?.enabled ? (
        <section className="hero">
          <span className="hero-eyebrow">À la une</span>
          <h1 className="hero-title">{override.title}</h1>
          {override.body ? <p className="hero-excerpt">{override.body}</p> : null}
        </section>
      ) : featuredText ? (
        <section className="hero">
          <span className="hero-eyebrow">À la une</span>
          <h1 className="hero-title">
            <Link href={`/textes/${featuredText.slug}`}>{featuredText.title}</Link>
          </h1>
          {featuredText.excerpt ? <p className="hero-excerpt">{featuredText.excerpt}</p> : null}
          {featuredText.audioVersion ? (
            <Link
              href={`/audio/${featuredText.slug}`}
              className="audio-button"
              aria-label="Écouter la version audio de ce texte"
            >
              <HeadphonesIcon />
            </Link>
          ) : null}
        </section>
      ) : null}

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
              {text.audioVersion ? (
                <Link
                  href={`/audio/${text.slug}`}
                  className="audio-button"
                  aria-label="Écouter la version audio de ce texte"
                >
                  <HeadphonesIcon />
                </Link>
              ) : null}
            </li>
          ))}
        </ol>
      ) : !featuredText ? (
        <p className="timeline-empty">Aucun texte publié pour l'instant.</p>
      ) : null}
    </main>
  )
}
