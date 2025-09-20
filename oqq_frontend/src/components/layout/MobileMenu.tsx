// ==========================================================
// FILE : src/components/layout/MobileMenu.tsx
// Menu mobile latéral pour oùquandquoi.fr
// - Affiche navigation mobile, catégories, favori, profil
// - Utilise useAuth() pour pseudo/avatar dynamique
// ==========================================================

import React from 'react'
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { CategoryNav } from '@/components/layout/CategoryNav'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onCategorySelect: (category: string, subcategory: string) => void
  catSelection: { category?: string; subcategory?: string }
  showDeposer?: boolean
  onNavigate?: (navId: string, href: string) => void
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onCategorySelect,
  catSelection,
  showDeposer = false,
  onNavigate
}) => {
  const { user, isAuthenticated } = useAuth()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col h-full overflow-y-auto md:hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* === HEADER DU MENU === */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="text-xl font-bold text-green-600 tracking-tight">oùquandquoi</span>
        <button onClick={onClose} aria-label="Fermer le menu">
          <XMarkIcon className="w-7 h-7 text-gray-700" />
        </button>
      </div>

      {/* === BOUTON "DÉPOSER UNE ACTIVITÉ" === */}
      {showDeposer && (
        <nav className="flex flex-col gap-1 px-4 pt-4">
          <Link
            to="/deposer"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition mb-3 block text-center"
            onClick={() => {
              onClose()
              onNavigate?.('deposer', '/deposer')
            }}
          >
            ＋ Déposer une activité
          </Link>
        </nav>
      )}

      {/* === NAVIGATION PRINCIPALE === */}
      <nav className="flex flex-col gap-1 px-4 py-4">
        <MenuItem icon={<MagnifyingGlassIcon className="w-5 h-5" />} label="Rechercher" />
        <Link
          to="/favoris"
          className="flex items-center gap-3 px-2 py-2 text-[17px] text-gray-700 rounded-lg hover:bg-gray-100 transition"
          onClick={onClose}
        >
          <HeartIcon className="w-5 h-5" />
          <span>Favoris</span>
        </Link>
        <MenuItem icon={<UserIcon className="w-5 h-5" />} label="Recherches sauvegardées" />
      </nav>

      {/* === CATÉGORIES === */}
      <div className="border-t border-gray-100 mt-2 pt-3">
        <CategoryNav
          onSelect={(category, subcategory) => {
            onCategorySelect(category, subcategory)
            onClose()
          }}
          selected={catSelection}
          value={{
            keyword: '',
            category: catSelection.category,
            subcategory: catSelection.subcategory,
            excludedSubcategories: []
          }}
          mode="vertical"
        />
      </div>

      {/* === PROFIL UTILISATEUR === */}
      <div className="border-t border-gray-100 mt-5 py-3 px-4 flex items-center gap-3">
        <img
          src={user?.avatar || '/default-avatar.svg'}
          alt="Profil"
          className="w-9 h-9 rounded-full border border-gray-300 object-cover"
        />
        <div className="flex-1">
          <div className="font-medium">
            {isAuthenticated && user?.pseudo ? user.pseudo : 'Profil invité'}
          </div>
          <div className="text-xs text-gray-500">
            {isAuthenticated ? 'Mon espace personnel' : 'Non connecté'}
          </div>
        </div>
        <button className="text-gray-400">
          <UserIcon className="w-6 h-6" />
        </button>
      </div>

      {/* === INFOS PRATIQUES === */}
      <div className="border-t border-gray-100 mt-5 py-3 px-4 text-xs flex flex-col gap-2">
        <span>Informations pratiques</span>
        <div className="flex items-center justify-between">
          <span>oùquandquoi, 2025</span>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6c/Trustpilot_logo.png"
            alt="Trustpilot"
            className="h-5"
          />
        </div>
      </div>
    </div>
  )
}

// ==========================================================
// === ITEM DE MENU RÉUTILISABLE ============================
// ==========================================================
function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-3 px-2 py-2 text-[17px] text-gray-700 rounded-lg hover:bg-gray-100 transition w-full text-left">
      {icon}
      <span>{label}</span>
    </button>
  )
}

export default MobileMenu
