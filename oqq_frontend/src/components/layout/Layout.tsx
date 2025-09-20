// ==========================================================
// FILE : src/components/layout/Layout.tsx
// Main layout for oùquandquoi.fr
// - Full-screen background with fixed pub
// - Sticky header (via StickyHeaderBlock)
// - Scrollable main container with content and footer
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
  // ==========================================================
  // === STATE (references) ===================================
  // ==========================================================
  const sentinelRef = useRef<HTMLDivElement>(null)

  // ==========================================================
  // === BEHAVIOR =============================================
  // ==========================================================
  // No logic here, props are passed down to children

  // ==========================================================
  // === RENDER (main container with header and footer) =======
  // ==========================================================
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
      {/* Sentinel for sticky header trigger */}
      <div ref={sentinelRef} style={{ height: 10, width: '100%' }} />

      {/* Sticky header block */}
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

      {/* Main content container */}
      <div
        className="
          z-40
          flex flex-col
          mx-auto
          w-full
          max-w-7xl
          bg-gray-50
          rounded-bl-2xl
          rounded-br-2xl
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
