// ==========================================================
// FICHIER : src/components/atoms/GreenButton.tsx
// Bouton vert d'action unifié (Déposer, Afficher carte, etc.)
// - Style cohérent pour tous les boutons d'action verts
// - Icône optionnelle à gauche
// - Hover/transition uniformes
// ==========================================================

import React, { ReactNode } from 'react'

interface GreenButtonProps {
  icon?: ReactNode                    // Icône à gauche (optionnelle)
  label: string                       // Libellé du bouton
  onClick?: () => void                // Callback clic
  className?: string                  // Classes CSS additionnelles
  ariaLabel?: string                  // Label pour accessibilité
}

const GreenButton: React.FC<GreenButtonProps> = ({
  icon,
  label,
  onClick,
  className = '',
  ariaLabel
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition bg-green-600 text-white hover:bg-green-700 ${className}`}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span className="text-sm font-semibold">{label}</span>
    </button>
  )
}

export default GreenButton
