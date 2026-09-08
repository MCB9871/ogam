'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type Tab = {
  href: string
  label: string
}

// Nav partagée par les 4 onglets (Lecture/Boutique/Audio/Événements). Ne reçoit
// que les onglets déjà filtrés par `tabsVisibility` (voir layout.tsx) — ce
// composant ne gère que l'affichage et l'état actif, pas la logique de
// visibilité, pour rester simple et réutilisable.
//
// Logo : attend un fichier statique dans public/logo.svg (ou .png). Version
// unique pour l'instant, l'app restant en light-only (pas de mode sombre
// prévu à ce stade).
export function TabBar({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname()

  return (
    <nav className="tab-bar" aria-label="Navigation principale">
      <Link href="/" aria-label="Accueil">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" className="tab-bar-brand" />
      </Link>
      <ul className="tab-bar-list">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={isActive ? 'tab-bar-link tab-bar-link-active' : 'tab-bar-link'}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
