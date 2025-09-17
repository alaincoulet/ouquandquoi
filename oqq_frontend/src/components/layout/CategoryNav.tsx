// ==========================================================
// FICHIER : src/components/layout/CategoryNav.tsx
// Navigation catégories sticky pour oùquandquoi.fr
// - Sticky chaîné sous le Header avec filtres (top à ajuster selon design)
// - Sélection catégorie/sous-catégorie, feedback badges, animation toggle
// - Feedback dynamique sur sous-catégories matchées/exclues
// ==========================================================

import React, { useState, useMemo } from 'react'
import { CATEGORIES } from '@/utils/categories'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from "@/context/AuthContext"

// === 1. Typage des props ===
interface CategoryNavProps {
  onSelect: (cat: string, subcat: string) => void
  selected?: { category?: string; subcategory?: string; keyword?: string; excludedSubcategories?: string[] }
  mode?: 'horizontal' | 'vertical'
  value: { keyword: string; category?: string; subcategory?: string; excludedSubcategories?: string[] }
  activitiesFiltered?: any[]
  onWhatChange?: (val: { keyword: string; category?: string; subcategory?: string; excludedSubcategories?: string[] }) => void
}

// === 2. Composant CategoryNav ===
export function CategoryNav({
  onSelect,
  selected,
  mode = 'horizontal',
  value,
  activitiesFiltered,
  onWhatChange
}: CategoryNavProps) {
  
  // === STATE (état local) ===
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [recentlyDisabled, setRecentlyDisabled] = useState<{ [subcat: string]: boolean }>({})
  const { user, isAuthenticated } = useAuth()

  // === COMPORTEMENT (helpers, logique) ===
  const containerClass = mode === 'horizontal'
    ? "flex justify-center gap-6 px-4 py-2 mb-1"
    : "flex flex-col gap-2 px-4 py-2"

  const excluded = Array.isArray(value.excludedSubcategories) ? value.excludedSubcategories : []

  // Sous-catégories présentes dans les résultats filtrés + explicitement exclues
  const matchedSubcategories = useMemo(() => {
    const present = Array.isArray(activitiesFiltered)
      ? activitiesFiltered.map((a: any) => a.subcategory).filter(Boolean)
      : []
    return Array.from(new Set([...present, ...excluded]))
  }, [activitiesFiltered, excluded])

  const keywordActive = !!value.keyword && matchedSubcategories.length > 0

  // --- Feedback badges (anis) ---
  const feedbackBadges = (
    <AnimatePresence>
      {keywordActive
        ? matchedSubcategories
            .filter(sub => !excluded.includes(sub))
            .map(sub => (
              <motion.span
                key={'kw-' + sub}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 bg-lime-100 border-lime-400 text-green-900 shadow-sm mr-2 mb-1"
              >
                {sub}
                <button
                  type="button"
                  aria-label={`Exclure sous-catégorie ${sub}`}
                  className="ml-1 rounded-full p-0.5 hover:bg-lime-200 hover:text-red-700 transition"
                  onClick={() => handleRemoveSubcat(sub)}
                  tabIndex={0}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </motion.span>
            ))
        : (value.subcategory && !excluded.includes(value.subcategory)) ? (
            <motion.span
              key={'sub-' + value.subcategory}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 bg-lime-100 border-lime-400 text-green-900 shadow-sm mr-2 mb-2"
            >
              {value.subcategory}
              <button
                type="button"
                aria-label={`Effacer sous-catégorie`}
                className="ml-1 rounded-full p-0.5 hover:bg-lime-200 hover:text-red-700 transition"
                onClick={() => handleRemoveClassic('subcategory', value.subcategory!)}
                tabIndex={0}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </motion.span>
          ) : null
      }
    </AnimatePresence>
  )

  // --- Badges toggle réactivables (exclus) ---
  const toggleBadges = (
    <AnimatePresence>
      {matchedSubcategories
        .filter(sub => excluded.includes(sub))
        .map(sub => (
          <motion.button
            key={'toggle-' + sub}
            initial={{ opacity: 0, scale: 0.95, x: 12 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 12 }}
            transition={{ duration: 0.18 }}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-4 border-gray-300 bg-gray-100 text-gray-400 shadow-sm mr-2 mb-1 
              ${recentlyDisabled[sub] ? "ring-2 ring-red-300" : "cursor-pointer hover:bg-lime-200 hover:border-lime-400 hover:text-green-700"}`}
            onClick={() => handleToggleSub(sub)}
            aria-label={`Réactiver sous-catégorie ${sub}`}
            type="button"
            tabIndex={0}
          >
            {sub}
          </motion.button>
        ))}
    </AnimatePresence>
  )

  // --- Handlers ---
  function handleRemoveSubcat(subcat: string) {
    if (!onWhatChange) return
    onWhatChange({
      ...value,
      excludedSubcategories: [...excluded, subcat],
      subcategory: undefined,
    })
    setRecentlyDisabled((prev) => ({ ...prev, [subcat]: true }))
    setTimeout(() => setRecentlyDisabled((prev) => ({ ...prev, [subcat]: false })), 200)
  }
  function handleToggleSub(sub: string) {
    if (!onWhatChange) return
    onWhatChange({
      ...value,
      excludedSubcategories: excluded.filter((s) => s !== sub),
      subcategory: sub,
    })
  }
  function handleRemoveClassic(type: 'category' | 'subcategory', label: string) {
    if (!onWhatChange) return
    if (type === 'subcategory') {
      onWhatChange({
        ...value,
        subcategory: undefined,
        excludedSubcategories: [...excluded, label],
      })
      setRecentlyDisabled((prev) => ({ ...prev, [label]: true }))
      setTimeout(() => setRecentlyDisabled((prev) => ({ ...prev, [label]: false })), 200)
    }
  }

  // === AFFICHAGE (render) ===
  return (
    <nav
      className={`
        sticky
        z-10
        bg-white
        w-full
        border-b border-gray-200
        transition-shadow
      `}
      style={{
        minHeight: 58,
        position: "relative"
      }}
    >
      {/* Catégories principales */}
      <div className={containerClass}>
        {CATEGORIES.map(category => (
          <div key={category.name} className="relative">
            <button
              className={`font-medium px-1 pb-0.5 transition 
                ${openCategory === category.name
                  ? "text-green-700 border-b-1 border-green-600"
                  : "text-gray-700 hover:text-green-700"
                }`}
              onClick={() => setOpenCategory(openCategory === category.name ? null : category.name)}
              type="button"
            >
              {category.name}
            </button>
            {/* Sous-catégories (menu déroulant) */}
            {openCategory === category.name && (
              <div className={
                mode === 'horizontal'
                  ? "absolute left-0 top-full mt-2 w-max bg-white border rounded-lg shadow-lg z-40 p-3 flex flex-col gap-1"
                  : "mt-1 ml-4 flex flex-col gap-1"
              }>
                {category.sub.map(sub => (
                  <button
                    key={sub}
                    className={`text-left px-3 py-1 rounded hover:bg-green-100 transition text-sm ${
                      value.subcategory === sub && !excluded.includes(sub)
                        ? "bg-green-200 font-semibold"
                        : excluded.includes(sub)
                          ? "bg-gray-200 font-normal line-through"
                          : ""
                    }`}
                    onClick={() => {
                      if (!excluded.includes(sub)) {
                        onSelect(category.name, sub)
                        setOpenCategory(null)
                      }
                    }}
                    type="button"
                    disabled={excluded.includes(sub)}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Badges feedback (anis/exclus) */}
      <div className="flex flex-wrap gap-1 justify-center mt-0 mb-2 min-h-[32px] transition-all">
        {feedbackBadges}
        {toggleBadges}
      </div>
    </nav>
  )
}
