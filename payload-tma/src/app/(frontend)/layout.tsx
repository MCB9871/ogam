import React from 'react'
import { Inter } from 'next/font/google'

import { getPayloadClient } from '@/lib/payload'

import { TabBar, type Tab } from './components/TabBar'
import './globals.css'

// Police : Inter (variable font, graisses 100 à 900) — auto-hébergée par
// Next.js au build (aucune requête tierce au runtime), permet de vraiment
// jouer sur l'amplitude light/black demandée. Remplace la pile système
// Segoe UI utilisée précédemment.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

// Layout du front public — distinct du group (payload) qui gère /admin et /api.
export const metadata = {
  title: 'ogam',
  description: 'Archive de textes et de voix.',
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })

  // `generate:types` est cassé (workaround manuel de l'importMap, voir
  // README bot-telegram) — typage volontairement souple ici, comme dans
  // page.tsx, le temps que ce soit résolu en amont.
  const visibility = (siteSettings as any)?.tabsVisibility

  // Onglet masqué = pas de contenu supprimé, juste retiré de la nav (voir
  // §2 CONTEXTE_TMA_v2.md — déploiement progressif piloté depuis Payload).
  const allTabs: (Tab & { enabled: boolean })[] = [
    { href: '/', label: 'Lecture', enabled: visibility?.showReadingTab ?? true },
    { href: '/boutique', label: 'Boutique', enabled: visibility?.showShopTab ?? false },
    { href: '/audio', label: 'Audio', enabled: visibility?.showAudioTab ?? false },
    { href: '/evenements', label: 'Événements', enabled: visibility?.showEventsTab ?? false },
  ]
  const tabs = allTabs.filter((tab) => tab.enabled)

  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <TabBar tabs={tabs} />
        {children}
      </body>
    </html>
  )
}
