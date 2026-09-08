import type { GlobalConfig } from 'payload'

// Le bloc "à la une" doit apparaître sur les 4 onglets (§3 CONTEXTE_TMA_v2.md).
// Par défaut il pointe vers le dernier `texts` publié (calculé côté front),
// mais on garde ici la possibilité de le forcer manuellement vers une annonce
// libre (ex. "prochain événement", "nouvelle saison audio").
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    {
      // Visibilité des onglets, indépendante de la publication du contenu.
      // Permet ex. de préparer/publier des audios en coulisses (showAudioTab: false)
      // et de les rendre visibles côté TMA d'un coup, sans redéploiement.
      name: 'tabsVisibility',
      type: 'group',
      label: 'Visibilité des onglets',
      admin: {
        description:
          "Contrôle l'affichage des onglets côté TMA, indépendamment du contenu déjà publié dessous.",
      },
      fields: [
        {
          name: 'showReadingTab',
          type: 'checkbox',
          label: "Afficher l'onglet Lecture",
          defaultValue: true,
        },
        {
          name: 'showShopTab',
          type: 'checkbox',
          label: "Afficher l'onglet Boutique",
          defaultValue: false,
        },
        {
          name: 'showAudioTab',
          type: 'checkbox',
          label: "Afficher l'onglet Audio",
          defaultValue: false,
        },
        {
          name: 'showEventsTab',
          type: 'checkbox',
          label: "Afficher l'onglet Événements",
          defaultValue: false,
        },
      ],
    },
    {
      name: 'featuredOverride',
      type: 'group',
      label: 'Forcer le bloc "à la une" (sinon = dernier texte publié)',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'title', type: 'text' },
        { name: 'body', type: 'textarea' },
        { name: 'link', type: 'text' },
      ],
    },
    {
      // Prompt "Add to Home Screen" (§8.3) — à déclencher après une première
      // valeur perçue (première lecture complète, premier achat), pas à la
      // toute première visite. La condition de déclenchement reste côté front ;
      // ici on ne gère que le contenu du message.
      name: 'homeScreenPrompt',
      type: 'group',
      label: 'Prompt "Ajouter à l\'écran d\'accueil"',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Garde l\'app à portée de main' },
        { name: 'body', type: 'textarea' },
      ],
    },
    {
      // Don ponctuel mécène (§6) — montant libre, pas de palier récurrent.
      // TODO ouvert : la contrepartie exacte (voix au chapitre / correspondance
      // intime / autre) n'est pas tranchée ; ce champ ne fait que porter le
      // texte affiché, pas la logique de contrepartie.
      name: 'donationBlock',
      type: 'group',
      label: 'Bloc don ponctuel (mécène)',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}
