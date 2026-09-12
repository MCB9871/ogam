import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { BuyButton } from '../../components/BuyButton'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, status: { equals: 'active' } },
    depth: 1,
    limit: 1,
  })

  const product = docs[0] as any
  if (!product) notFound()

  const cover = product.images?.[0]

  return (
    <main className="page-shell">
      <p className="article-meta">{product.category === 'livre' ? 'Livre' : 'Affiche'}</p>
      <h1 className="article-title">{product.title}</h1>

      {cover?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="article-cover" src={cover.url} alt={cover.alt ?? ''} />
      ) : null}

      <div className="article-body">
        {product.description ? <p>{product.description}</p> : null}
      </div>

      <BuyButton itemType="product" itemId={product.id} priceStars={product.priceStars} />

      <div>
        <Link href="/boutique" className="back-link">
          ← Retour à la boutique
        </Link>
      </div>
    </main>
  )
}
