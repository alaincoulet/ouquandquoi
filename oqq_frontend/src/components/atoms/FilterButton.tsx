// ==========================================================
// FICHIER : src/components/atoms/FilterButton.tsx
// Bouton filtre avec icône et label (style header "Où ? Quand ? Quoi ?")
// - Utilisé dans ActivityForm et Header (UI unifiée)
// - Props : icône, label, état actif, callback clic, classe perso
// ==========================================================

import React from 'react'

interface FilterButtonProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  onClick?: () => void
  className?: string
  ariaLabel?: string
  rightSlot?: React.ReactNode
}

const FilterButton: React.FC<FilterButtonProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  className = '',
  ariaLabel,
  rightSlot
}) => {
  // === ÉTAT (useState, useEffect, useContext, etc.) ===
  const activeStyle = 'border-green-500 bg-green-50'
  const inactiveStyle = 'border-gray-200 bg-white'

  // === COMPORTEMENT (fonctions, callbacks, logique métier) ===
  const handleClick = () => {
    onClick?.()
  }

  // === AFFICHAGE (rendu JSX, mapping état => UI) ===
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg border text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition text-sm ${isActive ? activeStyle : inactiveStyle} ${className}`}
    >
      <span className="flex items-center gap-2">
        <span className="w-5 h-5 text-green-600 flex items-center justify-center">{icon}</span>
        <span>{label}</span>
      </span>
      {rightSlot && <span className="ml-2 flex items-center">{rightSlot}</span>}
    </button>
  )
}

export default FilterButton
