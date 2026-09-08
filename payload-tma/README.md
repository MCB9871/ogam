# payload-tma — Squelette backend

Backend unique (Payload CMS 3.x intégré dans Next.js) pour la Telegram Mini App.
Voir `CONTEXTE_TMA_v2.md` et `CONTEXTE_V1.md` (Phase 1) pour l'historique complet des décisions.

## Installation (sur ta machine de dev)

Les dépendances ne sont **pas** pinnées à des versions précises dans `package.json` :
mieux vaut laisser npm résoudre les dernières versions compatibles entre elles au moment
où tu installes, plutôt que je fige des numéros qui seront déjà dépassés.

```bash
cd payload-tma
npm install payload @payloadcms/next @payloadcms/db-sqlite @payloadcms/richtext-lexical next react react-dom sharp
npm install -D typescript @types/react @types/node
cp .env.example .env
# renseigner PAYLOAD_SECRET (chaîne aléatoire) et DATABASE_URI dans .env
npx payload generate:types
npm run dev
```

Le premier lancement (`npm run dev` puis visite de `/admin`) te proposera de créer
le premier compte admin CMS.

## Collections livrées dans ce squelette

| Collection | Rôle | Onglet TMA concerné |
|---|---|---|
| `Admins` | Comptes CMS (toi), auth Payload par défaut | — |
| `Readers` | Liste email indépendante de Telegram (RGPD, double opt-in) | tous |
| `Texts` | Blog / archive de textes | Lecture |
| `Audio` | Épisodes audio (unité, saison, ou rattachés à un texte) | Audio |
| `Products` | Tirages / livres physiques | Boutique (masquée au lancement) |
| `Events` | Dates d'événements, physiques ou conférences en ligne | Événements |
| `Orders` | Toute transaction Stars (audio, produit, billet) | tous |
| `PromoCodes` | Codes promo one-shot | Boutique |
| `Media` | Upload d'images (Payload standard) | tous |

Global : `SiteSettings` — bloc "à la une" et textes d'onboarding, partagés entre les 4 onglets.

## Ce qui n'est PAS encore dans ce squelette (volontairement)

- Aucune logique métier (hooks de paiement Stars, génération de lien d'invitation
  Telegram à usage unique, publication automatique sur le canal). Ce sera le rôle
  du bot silencieux (Phase suivante) qui lira/écrira dans cette même base via l'API
  Payload REST/Local.
- Aucun champ n'est figé sur les points encore ouverts (voir `TODO` dans le code) :
  - mécanique exacte du palier mécène (§6 `CONTEXTE_TMA_v2.md`)
  - seuil/prix définitif du pass "accès à vie"
  - détail du flow billetterie (rappel avant événement, etc.)

Ces champs existent déjà en base (pour ne pas bloquer le reste) mais leur usage
précis reste à trancher — rien n'empêche de les enrichir plus tard sans migration
lourde, conformément au principe additif du projet.
