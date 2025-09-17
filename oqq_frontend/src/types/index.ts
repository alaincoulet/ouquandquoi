// ==========================================================
// FICHIER : src/types/index.ts
// Interfaces globales pour les composants et types partagés
// Conventions : typage fort, accessibilité, structuration par blocs
// ==========================================================

import React from 'react'

/**
 * Types pour les composants de base (Atoms)
 * Respectent les standards d'accessibilité WCAG
 */
export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  onClick: () => void
  type?: 'button' | 'submit' | 'reset'
  ariaLabel: string
  className?: string
}

export interface InputProps {
  label?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  disabled?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  id?: string
  name?: string
  ariaDescribedBy?: string
  ariaLabel?: string
  className?: string
}

export interface IconProps {
  name: 'search' | 'location' | 'calendar' | 'filter' | 'star' | 'heart' | 'arrow' | 'close' | 'menu'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
  ariaLabel: string
}

/**
 * Types pour les composants complexes (Molecules & Organisms)
 */
export interface HeaderProps {
  onNavigate: (navId: string, href: string) => void
}

export interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

// Import natif du type Activity (avec _id)
import { Activity } from '@/types/activity'

export interface ProductCardProps {
  product: Activity
  onToggleFavorite: (activityId: string, isFavorite: boolean) => void
}
