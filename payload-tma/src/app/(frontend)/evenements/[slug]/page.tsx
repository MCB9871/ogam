import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'

type Props = {
  params: Promise<{ slug: string }>
}

function formatEventDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 1,
    limit: 1,
  })

  const event = docs[0] as any
  if (!event) notFound()

  return (
    <main className="page-shell">
      <p className="article-meta">
        {event.type === 'en_ligne' ? 'Conférence en ligne' : 'Événement physique'}
      </p>
      <h1 className="article-title">{event.title}</h1>

      {event.coverImage?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="article-cover" src={event.coverImage.url} alt="" />
      ) : null}

      <div className="article-body">
        <p>
          <strong>{formatEventDate(event.date)}</strong>
        </p>
        {event.location ? <p>{event.location}</p> : null}
        {event.description ? <p>{event.description}</p> : null}
      </div>

      {event.ticketPriceStars ? (
        <span className="price-pill">{event.ticketPriceStars} ★</span>
      ) : null}

      {/* Billetterie complète (lien d'invitation à usage unique) pas encore
          branchée côté front — voir CONTEXTE_TMA_v2.md §10.5 */}

      <div>
        <Link href="/evenements" className="back-link">
          ← Retour aux événements
        </Link>
      </div>
    </main>
  )
}
