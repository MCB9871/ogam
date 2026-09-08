import type { CollectionConfig } from 'payload'

// Onglet Boutique — reste masqué au lancement (`status: hidden` par défaut),
// publiable plus tard depuis Payload sans redéploiement (§1 CONTEXTE_TMA_v2.md).
// Reprend le modèle de données de Phase 1 (bots), adapté au schéma Payload.
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'priceStars', 'stock', 'status'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'active' } }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Affiche', value: 'affiche' },
        { label: 'Livre', value: 'livre' },
      ],
    },
    { name: 'description', type: 'textarea' },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'priceStars', type: 'number', required: true },
    {
      name: 'stock',
      type: 'number',
      label: 'Stock (laisser vide = illimité)',
    },
    { name: 'stockAlertThreshold', type: 'number', defaultValue: 3 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'hidden',
      options: [
        { label: 'Masqué (pré-lancement)', value: 'hidden' },
        { label: 'Actif', value: 'active' },
        { label: 'Dormant', value: 'dormant' },
        { label: 'Archivé', value: 'deleted' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
  timestamps: true,
}
