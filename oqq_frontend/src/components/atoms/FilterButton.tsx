// ==========================================================
// FICHIER : src/components/atoms/FilterButton.tsx
// Bouton filtre avec icône et label (style header "Où ? Quand ? Quoi ?")
// - Utilisé dans ActivityForm et Header (UI unifiée)
// - Props : icône, label, état actif, callback clic, classe perso
// ==========================================================

import React, { ReactNode } from 'react'

interface FilterButtonProps {
  icon: ReactNode                     // Icône à gauche (ex : <MapPinIcon />)
  label: string                       // Libellé affiché (ex : "Où ?")
  isActive?: boolean                  // État sélectionné (bordure verte)
  onClick?: () => void                // Callback clic
  className?: string                  // Classes CSS additionnelles
}

const FilterButton: React.FC<FilterButtonProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  className = ''
}) => {
  const base =
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition text-sm'

  const activeStyle = 'border-green-500 bg-green-50'
  const inactiveStyle = 'border-gray-200 bg-white'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${isActive ? activeStyle : inactiveStyle} ${className}`}
    >
      <span className="w-5 h-5 text-green-600">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

export default FilterButton
