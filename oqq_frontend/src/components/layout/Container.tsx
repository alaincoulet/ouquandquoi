// ==========================================================
// FICHIER : src/components/layout/Container.tsx
// Composant conteneur responsive global pour oùquandquoi.fr
// - Centralise la logique de largeur max et de padding
// - Utilisé dans toutes les pages et éléments de layout (Header, Footer, etc.)
// - Assure une cohérence visuelle sur tout le site
// ==========================================================

import React from 'react'

interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

// On retire les valeurs nulles pour les clés
type SizeKey = NonNullable<ContainerProps['size']>
type PaddingKey = NonNullable<ContainerProps['padding']>

// ==========================================================
// === ÉTAT (configuration des tailles et espacements) =====
// ==========================================================
const sizeClasses: Record<SizeKey, string> = {
  sm:   'max-w-2xl',
  md:   'max-w-4xl',
  lg:   'max-w-6xl',
  xl:   'max-w-7xl',
  full: 'max-w-none'
}

const paddingClasses: Record<PaddingKey, string> = {
  none: '',
  sm:   'px-4 py-2',
  md:   'px-4 py-6 sm:px-6 lg:px-8',
  lg:   'px-4 py-8 sm:px-6 lg:px-12'
}

// ==========================================================
// === COMPORTEMENT (logique de fusion des classes CSS) =====
// ==========================================================
const Container: React.FC<ContainerProps> = ({
  children,
  size = 'md',
  padding = 'md',
  className = ''
}) => {
  const combinedClasses = [
    'mx-auto w-full',
    sizeClasses[size],
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ')

  // ========================================================
  // === AFFICHAGE (rendu JSX final) ========================
  // ========================================================
  return <div className={combinedClasses}>{children}</div>
}

export default Container
