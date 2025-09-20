// ==========================================================
// FILE : src/components/layout/Header.tsx
// Main sticky header for oùquandquoi.fr
// - Inline filters Où ? Quand ? Quoi ?
// - Horizontal category nav below header
// - Rounded top corners for visual continuity with layout
// ==========================================================

import React, { useState } from 'react'
import { CategoryNav } from '@/components/layout/CategoryNav'
import MobileMenu from '@/components/layout/MobileMenu'
import {
  MapPinIcon,
  CalendarIcon,
  KeyIcon,
  XMarkIcon,
  Bars3Icon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import logo from '@/assets/images/logo_oqq.png'
import { useAuth } from '@/context/AuthContext'
import { FilterWherePanel } from '@/components/molecules/filters/FilterWherePanel'
import { FilterWhenPanel } from '@/components/molecules/filters/FilterWhenPanel'
import { FilterWhatPanel } from '@/components/molecules/filters/FilterWhatPanel'

interface HeaderProps {
  onNavigate?: (navId: string, href: string) => void
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
  value: { keyword: string; category?: string; subcategory?: string; excludedSubcategories?: string[] }
  onWhatChange: (val: { keyword: string; category?: string; subcategory?: string; excludedSubcategories?: string[] }) => void
  activitiesFiltered?: any[]
}

const Header: React.FC<HeaderProps> = ({
  onNavigate,
  favoritesActive = false,
  onToggleFavorites,
  where,
  onWhereChange,
  when,
  onWhenChange,
  value,
  onWhatChange,
  activitiesFiltered
}) => {
  // ==========================================================
  // === STATE ================================================
  // ==========================================================
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'where' | 'when' | 'what' | null>(null)
  const { user, isAuthenticated } = useAuth()

  // ==========================================================
  // === BEHAVIOR =============================================
  // ==========================================================
  const formatAddressLabel = () => {
    if (!where.label) return 'Où ?'
    const city = where.location || ''
    const dist = where.distance ? `, ${where.distance} km` : ''
    return `${city}${dist}`.trim()
  }
  const whenLabel = !when || when === 'Toute l’année' ? 'Quand ?' : when
  const renderWhatLabel = () => value.keyword || 'Quoi ?'

  const handleClick = (filter: 'where' | 'when' | 'what') =>
    setActiveFilter(prev => (prev === filter ? null : filter))
  const handleClosePanel = () => setActiveFilter(null)

  const handleClearWhere = (e: React.MouseEvent) => {
    e.stopPropagation()
    onWhereChange({ label: '', location: '', distance: undefined, lat: undefined, lon: undefined })
  }
  const handleClearWhen = (e: React.MouseEvent) => {
    e.stopPropagation()
    onWhenChange('')
  }
  const handleClearWhat = (e: React.MouseEvent) => {
    e.stopPropagation()
    onWhatChange({ ...value, keyword: '', excludedSubcategories: [] })
  }

  const toggleMenu = () => setMenuOpen(prev => !prev)
  const closeMenu = () => setMenuOpen(false)

  const handleCategorySelect = (category: string, subcategory?: string) => {
    onWhatChange({ keyword: '', category, subcategory })
    onNavigate?.('category', `/category/${category}`)
  }

  // ==========================================================
  // === RENDER ===============================================
  // ==========================================================
  return (
    <>
      {/* === STICKY HEADER BLOCK === */}
      <header
        className="sticky top-0 z-30 bg-white transition-shadow rounded-tl-2xl rounded-tr-2xl"
        style={{ minHeight: 70 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          {/* === Logo + Burger === */}
          <div className="flex items-center flex-shrink-0 gap-2">
            <button
              onClick={toggleMenu}
              className="sm:hidden text-gray-600 hover:text-gray-800 focus:outline-none mr-2"
              aria-label="Menu principal"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Link
              to="/"
              onClick={() => onNavigate?.('logo', '/')}
              className="flex items-center gap-2 group"
              aria-label="Accueil oùquandquoi.fr"
            >
              <img
                src={logo}
                alt="Logo oùquandquoi.fr"
                className="h-14 w-14 object-contain"
                style={{ minWidth: 32 }}
              />
              <span className="text-xl sm:text-2xl font-bold text-green-600 tracking-tight group-hover:underline transition">
                oùquandquoi.fr
              </span>
            </Link>
          </div>

          {/* === Filters OÙ / QUAND / QUOI === */}
          <div className="flex-1 flex justify-center">
            <div className="flex gap-2">
              {/* Filter: Où ? */}
              <div className="relative">
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    activeFilter === 'where'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  } text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition`}
                  aria-label="Filtrer par lieu"
                  onClick={() => handleClick('where')}
                >
                  <MapPinIcon className="w-5 h-5 mr-1 text-green-600" />
                  <span>{formatAddressLabel()}</span>
                  {where.label && (
                    <button
                      type="button"
                      aria-label="Effacer le filtre lieu"
                      className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                      onClick={handleClearWhere}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </button>
                {activeFilter === 'where' && (
                  <FilterWherePanel
                    value={where.label}
                    onChange={onWhereChange}
                    onClose={handleClosePanel}
                  />
                )}
              </div>

              {/* Filter: Quand ? */}
              <div className="relative">
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    activeFilter === 'when'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  } text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition`}
                  aria-label="Filtrer par date"
                  onClick={() => handleClick('when')}
                >
                  <CalendarIcon className="w-5 h-5 mr-1 text-green-600" />
                  <span>{whenLabel}</span>
                  {when && when !== 'Toute l’année' && (
                    <button
                      type="button"
                      aria-label="Effacer le filtre date"
                      className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                      onClick={handleClearWhen}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </button>
                {activeFilter === 'when' && (
                  <FilterWhenPanel
                    value={when}
                    onChange={(val) => {
                      onWhenChange(val)
                      handleClosePanel()
                    }}
                    onClose={handleClosePanel}
                  />
                )}
              </div>

              {/* Filter: Quoi ? */}
              <div className="relative">
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    activeFilter === 'what'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  } text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition`}
                  aria-label="Filtrer par mot-clé"
                  onClick={() => handleClick('what')}
                >
                  <KeyIcon className="w-5 h-5 mr-1 text-green-600" />
                  <span>{renderWhatLabel()}</span>
                  {value.keyword && (
                    <button
                      type="button"
                      aria-label="Effacer le filtre mot-clé"
                      className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                      onClick={handleClearWhat}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </button>
                {activeFilter === 'what' && (
                  <FilterWhatPanel
                    value={value}
                    onChange={onWhatChange}
                    onClose={handleClosePanel}
                  />
                )}
              </div>
            </div>
          </div>

          {/* === Actions: Déposer / Favoris / Profil === */}
          <div className="flex items-center gap-3">
            <Link
              to="/deposer"
              onClick={() => onNavigate?.('deposer', '/deposer')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold transition duration-300 hover:brightness-105 hover:scale-[1.02]"
            >
              <span className="text-lg font-semibold">＋</span>
              <span className="text-sm font-semibold">Déposer une activité</span>
            </Link>

            <button
              className="relative group focus:outline-none"
              aria-label={favoritesActive ? 'Voir toutes les activités' : 'Afficher mes favoris en premier'}
              onClick={onToggleFavorites}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-6 h-6 transition-colors duration-150 ${
                  favoritesActive
                    ? 'text-yellow-400'
                    : 'text-gray-400 group-hover:text-yellow-400'
                }`}
                fill={favoritesActive ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke={favoritesActive ? 'currentColor' : '#a1a1aa'}
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21C12 21 4 13.888 4 8.941A4.941 4.941 0 019 4a5.024 5.024 0 013 1.05A5.024 5.024 0 0115 4a4.941 4.941 0 015 4.941C20 13.888 12 21 12 21z"
                  fill={favoritesActive ? 'currentColor' : 'none'}
                />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <Link
                to={isAuthenticated ? '/profil' : '/connexion'}
                className="hover:text-blue-600 flex items-center"
                aria-label={isAuthenticated ? 'Profil utilisateur' : 'Se connecter / Créer un compte'}
              >
                <UserIcon className="w-5 h-5" />
              </Link>
              <Link
                to={isAuthenticated ? '/profil' : '/connexion'}
                className="ml-1 text-xs sm:text-sm font-semibold text-gray-500 hover:text-blue-600 whitespace-nowrap transition"
              >
                {isAuthenticated && user?.pseudo
                  ? user.pseudo
                  : 'Connectez-vous / créer votre compte'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* === Mobile menu === */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={closeMenu}
        onCategorySelect={handleCategorySelect}
        catSelection={value}
        showDeposer
        onNavigate={onNavigate}
      />

      {/* === Category nav (horizontal) === */}
      <CategoryNav
        onSelect={handleCategorySelect}
        selected={value}
        mode="horizontal"
        value={value}
        activitiesFiltered={activitiesFiltered}
        onWhatChange={onWhatChange}
      />
    </>
  )
}

export default Header
