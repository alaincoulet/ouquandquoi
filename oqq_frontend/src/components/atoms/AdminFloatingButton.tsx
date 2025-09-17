// ==========================================================
// FICHIER : src/components/atoms/AdminFloatingButton.tsx
// Bouton flottant "Administration" — style identique à CategoryNav
// - Visible uniquement pour les administrateurs connectés
// - Positionné en haut à droite, fixe, hors Header et CategoryNav
// ==========================================================

import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const AdminFloatingButton: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const isAdmin = isAuthenticated && user?.role === 'admin'
  if (!isAdmin) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <Link
        to="/admin/validation-users"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold no-underline hover:no-underline transition duration-300 hover:brightness-105 hover:scale-[1.02] hover:text-white"
        aria-label="Administration"
        style={{ minWidth: 180, justifyContent: 'center' }}
      >
        <span className="text-lg font-semibold">⚙️</span>
        <span className="text-sm font-semibold">Administration</span>
      </Link>
    </div>
  )
}

export default AdminFloatingButton
