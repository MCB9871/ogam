import type { CollectionConfig } from 'payload'

// Onglet Événements (§5 CONTEXTE_TMA_v2.md). Présentation en carrousel côté
// front, alimenté par les entrées ici. État "aucune date à venir" géré côté
// front quand la liste est vide (pas un champ ici).
//
// TODO (ouvert, §10.5) : le flow complet billetterie (rappel avant l'événement,
// détail de l'expérience post-achat) reste à concevoir. Les champs ci-dessous
// couvrent la mécanique déjà actée (lien d'invitation à usage unique) sans
// figer le reste.
export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'date', 'status'],
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Physique', value: 'physique' },
        { label: 'Conférence en ligne (vocal, via Telegram)', value: 'en_ligne' },
      ],
    },
    { name: 'description', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'date', type: 'date', required: true },
    {
      name: 'location',
      type: 'text',
      label: 'Lieu (si physique)',
      admin: { condition: (data) => data?.type === 'physique' },
    },
    { name: 'ticketPriceStars', type: 'number', label: 'Prix du billet en Stars' },
    {
      // Groupe/canal privé Telegram vers lequel Payload génère un lien
      // d'invitation à usage unique à l'achat (consommé par le bot, pas encore
      // codé ici — ce champ ne fait que stocker la cible).
      name: 'privateChannelId',
      type: 'text',
      label: 'ID du groupe/canal privé Telegram dédié',
      admin: {
        condition: (data) => data?.type === 'en_ligne',
        description: 'Utilisé par le bot pour générer le lien d\'invitation à usage unique à l\'achat.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'Publié', value: 'published' },
        { label: 'Passé', value: 'past' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
