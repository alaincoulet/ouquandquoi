// src/components/atoms/Icon.tsx
/**
 * Icône SVG générique utilisée dans tout le site oùquandquoi.fr
 * - Utilise un set d'icônes minimal (search, arrow, eye, eyeOff)
 * - À étendre selon les besoins du projet
 */

import React from 'react'

interface IconProps {
  name: 'search' | 'arrow' | 'eye' | 'eyeOff'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  ariaLabel?: string
}

/**
 * Déclaration des SVG pour chaque icône supportée.
 */
const iconPaths = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M12 5v14m0 0l7-7m-7 7l-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // ==== Ajout oeil ouvert ====
  eye: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path
        d="M1.5 12S5.5 5.5 12 5.5 22.5 12 22.5 12 18.5 18.5 12 18.5 1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3.5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
  // ==== Ajout oeil barré ====
  eyeOff: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.68 10.7A3.5 3.5 0 0 0 12 15.5c1.93 0 3.5-1.57 3.5-3.5 0-.53-.11-1.03-.3-1.48"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5.6 5.65C3.13 7.73 1.5 12 1.5 12S5.5 18.5 12 18.5c1.99 0 3.77-.4 5.22-1.05M18.4 18.35C20.87 16.27 22.5 12 22.5 12S18.5 5.5 12 5.5c-1.35 0-2.62.18-3.77.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3.5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  className = '',
  ariaLabel
}) => (
  <span
    className={`inline-block ${sizes[size]} ${className}`}
    role="img"
    aria-label={ariaLabel}
  >
    {iconPaths[name] || null}
  </span>
)

export default Icon
