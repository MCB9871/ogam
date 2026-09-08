import type { CollectionConfig } from 'payload'

// Onglet Audio (§4/§6 CONTEXTE_TMA_v2.md). Collection upload-enabled dédiée
// (distincte de `media`, qui ne gère que les images) car les fichiers son ont
// leurs propres contraintes de taille/mimetype.
//
// TODO (ouvert, §6.3) : le seuil et le prix exact du pass "accès à vie" ne sont
// pas tranchés (prix fondateur limité vs périmètre défini). Le champ `unlockTier`
// ci-dessous reste volontairement un simple select modifiable depuis le CMS,
// pas une valeur figée dans le code.
export const Audio: CollectionConfig = {
  slug: 'audio',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'unlockTier', 'priceStars', 'status'],
  },
  upload: {
    staticDir: '../media/audio',
    mimeTypes: ['audio/*'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'Publié', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'relatedText',
      type: 'relationship',
      relationTo: 'texts',
      label: 'Texte lié (optionnel — sinon audio only)',
    },
    { name: 'seasonNumber', type: 'number' },
    { name: 'episodeNumber', type: 'number' },
    {
      name: 'unlockTier',
      type: 'select',
      required: true,
      defaultValue: 'unit',
      options: [
        { label: 'À l\'unité', value: 'unit' },
        { label: 'Pack saison', value: 'season' },
        { label: 'Pass accès à vie', value: 'lifetime' },
      ],
      admin: {
        description:
          'TODO ouvert : structure de prix/seuil du pass lifetime pas encore tranchée (§6 CONTEXTE_TMA_v2.md).',
      },
    },
    { name: 'priceStars', type: 'number', label: 'Prix en Telegram Stars' },
    {
      name: 'sleepTimerEnabled',
      type: 'checkbox',
      label: 'Sleep timer disponible',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
