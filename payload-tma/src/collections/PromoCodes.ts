import type { CollectionConfig } from 'payload'

// Reprend telle quelle la mécanique `promo_oneshot` de Phase 1 (CONTEXTE_V1.md §4),
// simplement migrée en collection Payload pour être pilotée depuis le même CMS.
export const PromoCodes: CollectionConfig = {
  slug: 'promo-codes',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'amount', 'expiry', 'used'],
  },
  fields: [
    { name: 'code', type: 'text', required: true, unique: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Pourcentage', value: 'percent' },
        { label: 'Montant fixe (Stars)', value: 'fixed' },
      ],
    },
    { name: 'amount', type: 'number', required: true },
    { name: 'expiry', type: 'date' },
    { name: 'used', type: 'checkbox', defaultValue: false },
    { name: 'usedByReader', type: 'relationship', relationTo: 'readers' },
    { name: 'usedAt', type: 'date' },
  ],
  timestamps: true,
}
