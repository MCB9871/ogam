import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'

type EventDoc = {
  id: string
  title: string
  slug: string
  type: 'physique' | 'en_ligne'
  date: string
  location?: string
  ticketPriceStars?: number
}

function formatEventDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default async function EvenementsPage() {
  const payload = await getPayloadClient()

  const { docs: events } = await payload.find({
    collection: 'events',
    where: { status: { equals: 'published' } },
    sort: 'date',
    depth: 0,
    limit: 50,
  })

  const allEvents = events as unknown as EventDoc[]

  return (
    <main className="page-shell">
      {allEvents.length > 0 ? (
        <ol className="events-carousel" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {allEvents.map((event) => (
            <li key={event.id} className="timeline-entry">
              <span className="timeline-stamp">
                {event.type === 'en_ligne' ? 'En ligne' : 'Physique'}
              </span>
              <h2 className="timeline-title">
                <Link href={`/evenements/${event.slug}`}>{event.title}</Link>
              </h2>
              <p className="timeline-excerpt">{formatEventDate(event.date)}</p>
              {event.location ? <p className="timeline-excerpt">{event.location}</p> : null}
              {event.ticketPriceStars ? (
                <span className="price-pill">{event.ticketPriceStars} ★</span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="timeline-empty">
          Pas de date à venir pour l'instant : contactez-nous si vous souhaitez organiser un
          événement à nos côtés.
        </p>
      )}
    </main>
  )
}
