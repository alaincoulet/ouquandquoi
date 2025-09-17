import React from 'react'
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ChatBubbleOvalLeftIcon,
  HeartIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { CategoryNav } from '@/components/layout/CategoryNav'
import { Link } from 'react-router-dom'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onCategorySelect: (category: string, subcategory: string) => void
  catSelection: { category?: string; subcategory?: string }
  showDeposer?: boolean // ✅ Ajout : permet d’afficher le bouton vert en mobile seulement
  onNavigate?: (navId: string, href: string) => void // (optionnel, utile pour analytics/navigation)
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onCategorySelect,
  catSelection,
  showDeposer = false, // par défaut: ne s’affiche pas sauf si précisé
  onNavigate
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col h-full overflow-y-auto md:hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Header du menu mobile */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="text-xl font-bold text-green-600 tracking-tight">
          oùquandquoi
        </span>
        <button onClick={onClose} aria-label="Fermer le menu">
          <XMarkIcon className="w-7 h-7 text-gray-700" />
        </button>
      </div>

      {/* Bouton Déposer activité (mobile only) */}
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

      {/* Menu principal */}
      <nav className="flex flex-col gap-1 px-4 py-4">
        <MenuItem icon={<MagnifyingGlassIcon className="w-5 h-5" />} label="Rechercher" />
        <MenuItem icon={<ChatBubbleOvalLeftIcon className="w-5 h-5" />} label="Messages" />
        <MenuItem icon={<HeartIcon className="w-5 h-5" />} label="Favoris" />
        <MenuItem icon={<UserIcon className="w-5 h-5" />} label="Recherches sauvegardées" />
      </nav>

      {/* Catégories menu mobile */}
      <div className="border-t border-gray-100 mt-2 pt-3">
        <CategoryNav
  onSelect={(category, subcategory) => {
    onCategorySelect(category, subcategory)
    onClose()
  }}
  selected={catSelection}
  value={{
    keyword: "",
    category: catSelection.category,
    subcategory: catSelection.subcategory,
    excludedSubcategories: [],
  }}
  mode="vertical"
/>
      </div>

      {/* Profil / infos utilisateur */}
      <div className="border-t border-gray-100 mt-5 py-3 px-4 flex items-center gap-3">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Profil"
          className="w-9 h-9 rounded-full border border-gray-300"
        />
        <div className="flex-1">
          <div className="font-medium">Alain</div>
          <div className="text-xs text-gray-500">Mon espace (en ligne, profil paramétrable)</div>
        </div>
        <button className="text-gray-400">
          <UserIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Informations pratiques */}
      <div className="border-t border-gray-100 mt-5 py-3 px-4 text-xs flex flex-col gap-2">
        <span>Informations pratiques</span>
        <div className="flex items-center justify-between">
          <span>oùquandquoi, 2025</span>
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6c/Trustpilot_logo.png" alt="Trustpilot" className="h-5" />
        </div>
      </div>
    </div>
  )
}

function MenuItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center gap-3 px-2 py-2 text-[17px] text-gray-700 rounded-lg hover:bg-gray-100 transition w-full text-left">
      {icon}
      <span>{label}</span>
    </button>
  )
}

export default MobileMenu
