// ==========================================================
// FICHIER : src/components/layout/Layout.tsx
// Layout principal oùquandquoi.fr
// - Fond pub fixe couvrant tout l’écran
// - Header sticky géré par StickyHeaderBlock
// - Container central scrollable avec contenu + footer
// ==========================================================

import React, { useRef } from 'react'
import StickyHeaderBlock from '@/components/layout/StickyHeaderBlock'
import Footer from '@/components/layout/Footer'

interface LayoutProps {
  children: React.ReactNode
  className?: string
  favoritesActive?: boolean
  onToggleFavorites?: () => void
  where: {
    label: string
    location?: string
    distance?: number
    lat?: number
    lon?: number
  }
  onWhereChange: (val: any) => void
  when: string
  onWhenChange: (val: string) => void
  value: {
    keyword: string
    category?: string
    subcategory?: string
    excludedSubcategories?: string[]
  }
  onWhatChange: (val: {
    keyword: string
    category?: string
    subcategory?: string
    excludedSubcategories?: string[]
  }) => void
  activitiesFiltered?: any[]
  onNavigate?: (navId: string, href: string) => void
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className = '',
  favoritesActive,
  onToggleFavorites,
  where,
  onWhereChange,
  when,
  onWhenChange,
  value,
  onWhatChange,
  activitiesFiltered,
  onNavigate
}) => {
  // === 1. STATE (références) ===
  const sentinelRef = useRef<HTMLDivElement>(null)

  // === 2. COMPORTEMENT ===
  // Aucun comportement ici, uniquement passage de props

  // === 3. AFFICHAGE ===
  return (
    <div
      className={`relative flex flex-col font-quicksand overflow-x-hidden ${className}`}
      style={{
        backgroundImage: "url('/pub_adrar.png')",
        backgroundSize: 'auto',
        backgroundPosition: '0 0',
        backgroundAttachment: 'fixed',
        minHeight: '100dvh',
        paddingTop: '20vh',
        paddingBottom: '25vh',
      }}
    >
      {/* SENTINELLE (placée sous la pub) */}
      <div ref={sentinelRef} style={{ height: 10, width: '100%' }} />

      {/* HEADER sticky (géré dans StickyHeaderBlock) */}
      <StickyHeaderBlock
        sentinelRef={sentinelRef}
        favoritesActive={favoritesActive}
        onToggleFavorites={onToggleFavorites}
        where={where}
        onWhereChange={onWhereChange}
        when={when}
        onWhenChange={onWhenChange}
        value={value}
        onWhatChange={onWhatChange}
        activitiesFiltered={activitiesFiltered}
        onNavigate={onNavigate}
      />

      {/* CONTAINER principal (scrollable) */}
      <div
        className="
          z-40
          flex flex-col
          mx-auto
          w-full
          max-w-7xl
          bg-gray-50
          rounded-xl
          shadow-xl
          border border-gray-200
        "
      >
        <main role="main" aria-label="Contenu principal" className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Layout
