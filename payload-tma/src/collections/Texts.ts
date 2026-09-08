import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

// Onglet Lecture (§3 CONTEXTE_TMA_v2.md) : navigation essentiellement
// chronologique, thème en option secondaire. `featured` alimente le bloc
// "à la une" qui doit apparaître sur les 4 onglets (voir global SiteSettings).
//
// Deux façons indépendantes de poster sur le canal Telegram :
// 1. AUTO — coche `telegramAutoPost.enabled` ici, réutilise titre + excerpt +
//    image de couverture, envoyé une seule fois au moment où le texte passe
//    en "published" (jamais republié tout seul ensuite, voir `postedAt`).
// 2. MANUEL — collection `ChannelPosts`, message libre, déclenché à la main,
//    aucun lien avec le statut de ce texte.
export const Texts: CollectionConfig = {
  slug: 'texts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'featured'],
  },
  access: {
    read: ({ req }) => {
      // Public ne voit que les textes publiés ; le CMS voit tout.
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const shouldAutoPost =
          doc.status === 'published' &&
          doc.telegramAutoPost?.enabled &&
          !doc.telegramAutoPost?.postedAt && // garde-fou : jamais reposté automatiquement
          previousDoc?.status !== 'published'

        if (!shouldAutoPost) return doc

        const botUrl = process.env.BOT_INTERNAL_URL
        const botSecret = process.env.BOT_INTERNAL_SECRET
        if (!botUrl || !botSecret) {
          req.payload.logger.warn(
            'BOT_INTERNAL_URL/BOT_INTERNAL_SECRET absents : post auto canal ignoré pour ce texte.',
          )
          return doc
        }

        try {
          const res = await fetch(`${botUrl}/publish/text/${doc.id}`, {
            method: 'POST',
            headers: { 'x-internal-secret': botSecret },
          })
          if (res.ok) {
            await req.payload.update({
              collection: 'texts',
              id: doc.id,
              data: { telegramAutoPost: { ...doc.telegramAutoPost, postedAt: new Date().toISOString() } },
            })
          } else {
            req.payload.logger.error(`Échec post auto canal (HTTP ${res.status}) pour le texte ${doc.id}`)
          }
        } catch (err) {
          req.payload.logger.error(`Échec appel bot post auto canal : ${err}`)
        }

        return doc
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
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
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Mettre en "à la une"',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'theme',
      type: 'text',
      label: 'Thème (navigation secondaire, optionnel)',
    },
    { name: 'excerpt', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', editor: lexicalEditor({}), required: true },
    {
      // Cross-sell contextuel retenu (§6) : bouton direct vers la version audio.
      name: 'audioVersion',
      type: 'relationship',
      relationTo: 'audio',
      label: 'Version audio liée (cross-sell)',
    },
    {
      name: 'telegramAutoPost',
      type: 'group',
      label: 'Post canal automatique',
      admin: {
        description:
          'Réutilise titre + description + image de couverture. Envoyé une seule fois, au moment où ce texte passe en "Publié". Pour un post personnalisé (message libre, sans lien avec ce texte), utilise plutôt la collection "Channel Posts".',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: "Publier automatiquement sur le canal à la publication",
          defaultValue: false,
        },
        {
          name: 'buttonLabel',
          type: 'text',
          label: 'Texte du bouton',
          defaultValue: "Lire dans l'app",
          admin: { condition: (data) => data?.telegramAutoPost?.enabled },
        },
        {
          name: 'postedAt',
          type: 'date',
          label: 'Posté automatiquement le',
          admin: { readOnly: true },
        },
      ],
    },
  ],
  timestamps: true,
}
