import type { CollectionConfig } from 'payload'

// Table transversale : couvre déblocage audio, commande boutique, et billet
// événement — un seul endroit pour la logique de paiement Stars (§6), quel que
// soit l'onglet d'origine. Reprend les champs utiles de la table `orders`
// Phase 1 (CONTEXTE_V1.md §4) adaptés à Payload et étendus aux 3 types.
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['type', 'reader', 'totalStars', 'status', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user), // pas d'accès public direct ; passera par API dédiée
    create: () => true, // créé par le bot/API au moment du paiement
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Déblocage audio', value: 'audio_unlock' },
        { label: 'Commande boutique', value: 'product' },
        { label: 'Billet événement', value: 'event_ticket' },
      ],
    },
    { name: 'reader', type: 'relationship', relationTo: 'readers' },
    { name: 'telegramUserId', type: 'number', required: true },
    {
      name: 'itemsJson',
      type: 'json',
      label: 'Snapshot des items achetés',
    },
    { name: 'totalStars', type: 'number', required: true },
    { name: 'promoCode', type: 'text' },
    { name: 'discountStars', type: 'number' },
    {
      name: 'telegramPaymentChargeId',
      type: 'text',
      label: 'ID paiement Telegram',
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Payé', value: 'paid' },
        { label: 'Expédié', value: 'shipped' },
        { label: 'Livré', value: 'delivered' },
        { label: 'Problème', value: 'problem' },
        { label: 'Annulé', value: 'cancelled' },
      ],
    },
    // Champs spécifiques boutique physique (repris tels quels de Phase 1)
    { name: 'deliverySnapshot', type: 'json', label: 'Adresse au moment de la commande' },
    { name: 'trackingNumber', type: 'text' },
    // Champ spécifique billet événement
    {
      name: 'eventInviteLink',
      type: 'text',
      label: 'Lien d\'invitation Telegram à usage unique généré',
    },
    { name: 'noteSav', type: 'textarea', label: 'Notes SAV' },
  ],
  timestamps: true,
}
