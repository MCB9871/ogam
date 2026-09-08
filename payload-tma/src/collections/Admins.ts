import type { CollectionConfig } from 'payload'

// Comptes avec accès au CMS Payload (toi, éventuellement co-auteurs plus tard).
// Distinct de `Readers`, qui sont les lecteurs publics de la TMA (pas d'accès CMS).
//
// SÉCURITÉ : par défaut Payload autorise n'importe qui à créer un document dans
// une collection sans règle d'accès explicite, y compris ici. Sans le bloc
// `access` ci-dessous, n'importe qui trouvant l'URL /admin (ou l'API REST
// /api/admins) pourrait créer son propre compte admin. La règle : création
// autorisée uniquement s'il n'existe encore aucun admin (bootstrap du tout
// premier compte) OU si un admin est déjà connecté (pour en inviter un autre).
export const Admins: CollectionConfig = {
  slug: 'admins',
  auth: {
    // Permet de générer une clé API pour un compte admin dédié au bot Telegram
    // (à créer séparément de ton compte personnel — voir README du bot).
    // Le bot s'authentifie ainsi : Authorization: admins API-Key <clé>
    useAPIKey: true,
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: async ({ req }) => {
      if (req.user) return true
      const existingAdmins = await req.payload.count({ collection: 'admins' })
      return existingAdmins.totalDocs === 0
    },
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}
