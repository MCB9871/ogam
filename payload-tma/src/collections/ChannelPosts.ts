import type { CollectionConfig } from 'payload'

// Formulaire de publication canal Telegram (§8 CONTEXTE_TMA_v2.md), VOLONTAIREMENT
// découplé du statut des autres collections (Texts, Events, Audio...). Publier
// un texte ne poste jamais automatiquement sur le canal — c'est ici, et
// seulement ici, qu'un post est composé puis envoyé, à la main.
//
// Fonctionnement : tu crées un post (lié à un texte existant ou totalement
// libre), tu écris/ajustes le message, tu actives le bouton si besoin, tu
// sauvegardes en brouillon autant de fois que tu veux — puis tu passes le
// statut à "Envoyé" et tu sauvegardes : c'est CE changement précis qui
// déclenche l'envoi réel sur le canal (hook ci-dessous), une seule fois.
export const ChannelPosts: CollectionConfig = {
  slug: 'channel-posts',
  admin: {
    useAsTitle: 'internalLabel',
    defaultColumns: ['internalLabel', 'status', 'sentAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const justTriggered = doc.status === 'sent' && previousDoc?.status !== 'sent'
        if (!justTriggered) return doc

        const botUrl = process.env.BOT_INTERNAL_URL
        const botSecret = process.env.BOT_INTERNAL_SECRET
        if (!botUrl || !botSecret) {
          req.payload.logger.warn(
            'BOT_INTERNAL_URL/BOT_INTERNAL_SECRET absents : envoi canal Telegram ignoré pour ce post.',
          )
          return doc
        }

        try {
          const res = await fetch(`${botUrl}/publish/channel-post/${doc.id}`, {
            method: 'POST',
            headers: { 'x-internal-secret': botSecret },
          })
          if (!res.ok) {
            req.payload.logger.error(`Échec envoi canal (HTTP ${res.status}) pour le post ${doc.id}`)
            return doc
          }
          // On note l'heure d'envoi réel, sans redéclencher ce hook en boucle
          // (le statut ne rechange pas, donc `justTriggered` sera faux au tour
          // suivant même si Payload ré-exécute afterChange sur cette update).
          await req.payload.update({
            collection: 'channel-posts',
            id: doc.id,
            data: { sentAt: new Date().toISOString() },
          })
        } catch (err) {
          req.payload.logger.error(`Échec appel bot publication canal : ${err}`)
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'internalLabel',
      type: 'text',
      required: true,
      label: 'Étiquette interne (pas affichée sur Telegram)',
      admin: { description: 'Juste pour toi, pour retrouver ce post dans la liste.' },
    },
    {
      name: 'relatedText',
      type: 'relationship',
      relationTo: 'texts',
      label: 'Texte lié (optionnel)',
      admin: {
        description:
          'Si renseigné, alimente le lien deep-link du bouton vers ce texte précis. Laisse vide pour un post libre (annonce, événement, etc.) et utilise "Cible du lien" ci-dessous.',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Message du post (Markdown Telegram basique accepté)',
    },
    {
      name: 'buttonEnabled',
      type: 'checkbox',
      label: 'Ajouter un bouton sous le post',
      defaultValue: true,
    },
    {
      name: 'buttonLabel',
      type: 'text',
      label: 'Texte du bouton',
      defaultValue: "Voir dans l'app",
      admin: { condition: (data) => data?.buttonEnabled },
    },
    {
      name: 'startAppOverride',
      type: 'text',
      label: 'Cible du lien (si pas de texte lié)',
      admin: {
        description:
          'Paramètre startapp du deep-link (ex: "event_abc123"). Ignoré si "Texte lié" est renseigné (le lien est alors généré automatiquement vers ce texte).',
        condition: (data) => data?.buttonEnabled && !data?.relatedText,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'Envoyé', value: 'sent' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Passer sur "Envoyé" puis sauvegarder déclenche la publication réelle sur le canal.',
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      label: 'Envoyé le',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  timestamps: true,
}
