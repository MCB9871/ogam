import type { CollectionConfig } from 'payload'

// Objectif explicite (§7 CONTEXTE_TMA_v2.md) : construire une liste email
// indépendante de Telegram, pas juste un contrôle d'accès. Pas de auth Payload
// ici (pas de mot de passe) — l'identité se fait par email + double opt-in.
export const Readers: CollectionConfig = {
  slug: 'readers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'telegramId', 'rgpdAccepted', 'optedInNewsletter'],
  },
  access: {
    read: () => true, // à resserrer une fois l'API front branchée (auth par token/session)
    create: () => true, // formulaire public d'inscription
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'telegramId',
      type: 'number',
      label: 'ID Telegram (si connu)',
      unique: true,
      index: true,
      admin: { description: 'Rempli automatiquement si le lecteur passe par la TMA' },
    },
    {
      name: 'rgpdAccepted',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'rgpdAcceptedAt',
      type: 'date',
    },
    {
      name: 'optedInNewsletter',
      type: 'checkbox',
      label: 'Opt-in newsletter/relances',
      defaultValue: false,
    },
    {
      name: 'doubleOptInConfirmed',
      type: 'checkbox',
      label: 'Double opt-in confirmé',
      defaultValue: false,
    },
    {
      // Parrainage doux (§6) — réciproque, pas de dashboard d'affilié à construire.
      name: 'referredByCode',
      type: 'text',
      label: 'Code de parrainage utilisé à l\'inscription',
    },
  ],
  timestamps: true,
}
