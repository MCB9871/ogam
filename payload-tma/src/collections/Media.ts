import type { CollectionConfig } from 'payload'

// Stockage local dans /media par défaut (Payload gère le disque).
// Suffisant pour le profil de trafic annoncé (§2 CONTEXTE_TMA_v2.md).
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    staticDir: '../media',
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 900 },
    ],
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Texte alternatif',
    },
  ],
}
