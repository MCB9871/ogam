import { getPayloadClient } from '@/lib/payload'

// Bloc "à la une" (§3 CONTEXTE_TMA_v2.md) : override manuel du global en
// priorité, sinon le texte marqué `featured`, sinon le plus récent publié.
// Utilisé par l'onglet Lecture.
export type FeaturedData =
  | { kind: 'override'; title: string; body?: string; link?: string }
  | { kind: 'text'; id: string; title: string; slug: string; excerpt?: string; audioSlug?: string }
  | { kind: 'none' }

export async function getFeatured(): Promise<FeaturedData> {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })

  // `generate:types` est cassé (voir README bot-telegram) — typage souple ici
  // comme partout ailleurs dans le front en attendant que ce soit résolu.
  const settings = siteSettings as any
  const override = settings?.featuredOverride

  if (override?.enabled) {
    return { kind: 'override', title: override.title, body: override.body, link: override.link }
  }

  const { docs } = await payload.find({
    collection: 'texts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    depth: 1, // pour peupler audioVersion (relation) et avoir son slug
    limit: 30,
  })

  const texts = docs as any[]
  const featuredText = texts.find((t) => t.featured) ?? texts[0]

  if (!featuredText) return { kind: 'none' }

  return {
    kind: 'text',
    id: featuredText.id,
    title: featuredText.title,
    slug: featuredText.slug,
    excerpt: featuredText.excerpt,
    audioSlug: featuredText.audioVersion?.slug,
  }
}

// Variante pour l'onglet Audio : le bloc "à la une" doit pointer vers
// l'ÉPISODE AUDIO du texte à la une (pas vers le texte lui-même), pour rester
// cohérent avec le contenu de cet onglet. Si le texte à la une n'a pas de
// version audio, rien n'est affiché plutôt que de pointer à côté du sujet.
export type FeaturedAudioData =
  | { kind: 'override'; title: string; body?: string; link?: string }
  | { kind: 'audio'; slug: string; title: string; priceStars?: number; unlockTier?: string }
  | { kind: 'none' }

export async function getFeaturedAudio(): Promise<FeaturedAudioData> {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })

  const settings = siteSettings as any
  const override = settings?.featuredOverride

  if (override?.enabled) {
    return { kind: 'override', title: override.title, body: override.body, link: override.link }
  }

  const { docs } = await payload.find({
    collection: 'texts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    depth: 1, // pour peupler audioVersion avec ses champs (title, slug, priceStars...)
    limit: 30,
  })

  const texts = docs as any[]
  const featuredText = texts.find((t) => t.featured) ?? texts[0]
  const audio = featuredText?.audioVersion

  if (!audio || typeof audio !== 'object') return { kind: 'none' }

  return {
    kind: 'audio',
    slug: audio.slug,
    title: audio.title,
    priceStars: audio.priceStars,
    unlockTier: audio.unlockTier,
  }
}
