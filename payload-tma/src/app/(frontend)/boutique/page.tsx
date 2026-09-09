import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'

type ProductDoc = {
  id: string
  title: string
  slug: string
  category: 'affiche' | 'livre'
  description?: string
  images?: { url: string; alt?: string }[]
  priceStars: number
}

function categoryLabel(category: string): string {
  return category === 'livre' ? 'Livre' : 'Affiche'
}

export default async function BoutiquePage() {
  const payload = await getPayloadClient()

  const { docs: products } = await payload.find({
    collection: 'products',
    where: { status: { equals: 'active' } },
    sort: 'sortOrder',
    depth: 1,
    limit: 50,
  })

  const allProducts = products as unknown as ProductDoc[]

  return (
    <main className="page-shell">
      {allProducts.length > 0 ? (
        <ol className="timeline" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {allProducts.map((product) => {
            const cover = product.images?.[0]
            return (
              <li key={product.id} className="timeline-entry">
                <span className="timeline-stamp">{categoryLabel(product.category)}</span>
                {cover?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover.url} alt={cover.alt ?? ''} className="product-thumb" />
                ) : null}
                <h2 className="timeline-title">
                  <Link href={`/boutique/${product.slug}`}>{product.title}</Link>
                </h2>
                {product.description ? (
                  <p className="timeline-excerpt">{product.description}</p>
                ) : null}
                <span className="price-pill">{product.priceStars} ★</span>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="timeline-empty">La boutique arrive bientôt — repassez plus tard.</p>
      )}
    </main>
  )
}
