import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { getPayloadClient } from '@/lib/payload'
import { estimateReadingTime } from '@/lib/reading-time'

type Props = {
  params: Promise<{ slug: string }>
}

function formatStamp(dateString?: string): string {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(dateString))
    .toUpperCase()
}

export default async function TextPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'texts',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 2, // pour peupler coverImage et audioVersion
    limit: 1,
  })

  const text = docs[0] as any
  if (!text) notFound()

  const readingMinutes = estimateReadingTime(text.content)

  return (
    <main className="page-shell">
      <p className="article-meta">
        {formatStamp(text.publishedAt)} · {readingMinutes} min de lecture
      </p>
      <h1 className="article-title">{text.title}</h1>

      {text.coverImage?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="article-cover"
          src={text.coverImage.url}
          alt={text.coverImage.alt ?? ''}
        />
      ) : null}

      <div className="article-body">
        <RichText data={text.content} />
      </div>

      {text.audioVersion ? (
        <div className="cross-sell">
          Ce texte existe aussi en version lue par l'auteur — l'onglet Audio
          arrive dans une prochaine étape.
        </div>
      ) : null}

      <Link href="/" className="back-link">
        ← Retour
      </Link>
    </main>
  )
}
