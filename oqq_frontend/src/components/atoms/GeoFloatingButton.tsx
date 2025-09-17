// ==========================================================
// FICHIER : src/components/atoms/GeoFloatingButton.tsx
// Bouton flottant discret (bas gauche) pour activer/désactiver la géolocalisation
// - UI strictement identique au bouton "Gérer mes cookies" (fond blanc, border, shadow, arrondi, font, padding)
// - Texte dynamique selon l'état
// ==========================================================

import React from 'react'

interface GeoFloatingButtonProps {
  isActive: boolean
  onClick: () => void
  labelActive?: string    // "Désactiver la géolocalisation"
  labelInactive?: string  // "Activer la géolocalisation"
  className?: string
}

const GeoFloatingButton: React.FC<GeoFloatingButtonProps> = ({
  isActive,
  onClick,
  labelActive = "Désactiver la géolocalisation",
  labelInactive = "Activer la géolocalisation",
  className = ""
}) => {
  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        type="button"
        aria-label={isActive ? labelActive : labelInactive}
        onClick={onClick}
        className={`rounded-full border px-4 py-2 text-sm bg-white/90 hover:bg-white shadow ${className}`}
        style={{ minWidth: 180 }}
      >
        {isActive ? labelActive : labelInactive}
      </button>
    </div>
  )
}

export default GeoFloatingButton
