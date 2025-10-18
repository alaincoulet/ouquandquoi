// ==========================================================
// FILE : src/components/molecules/SavedSearchesPanel.tsx
// Panel pour afficher les recherches sauvegardées de l'utilisateur
// - Maximum 3 recherches sauvegardées
// - Affiche le nom généré automatiquement et la date de création
// - Permet de charger une recherche ou de la supprimer
// ==========================================================

import React, { useEffect, useState } from 'react'
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SavedSearch {
  name: string
  filters: {
    where?: any
    when?: string
    what?: any
  }
  createdAt: string
}

interface SavedSearchesPanelProps {
  onClose: () => void
  onLoadSearch: (filters: SavedSearch['filters']) => void
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`

const SavedSearchesPanel: React.FC<SavedSearchesPanelProps> = ({ onClose, onLoadSearch }) => {
  const { token, isAuthenticated } = useAuth()
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les recherches sauvegardées
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsLoading(false)
      return
    }

    const fetchSavedSearches = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/saved-searches`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSavedSearches(response.data.savedSearches || [])
      } catch (err) {
        console.error('Erreur lors du chargement des recherches sauvegardées:', err)
        setError('Impossible de charger les recherches sauvegardées')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedSearches()
  }, [token, isAuthenticated])

  const handleLoadSearch = (search: SavedSearch) => {
    onLoadSearch(search.filters)
    onClose()
  }

  const handleDeleteSearch = async (index: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette recherche sauvegardée ?')) {
      return
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/users/saved-searches/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSavedSearches(response.data.savedSearches || [])
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      alert('Impossible de supprimer la recherche')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr })
    } catch {
      return dateString
    }
  }

  return (
    <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Recherches sauvegardées</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
          aria-label="Fermer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : !isAuthenticated ? (
          <div className="text-center py-8 text-gray-500">
            Veuillez vous connecter pour accéder à vos recherches sauvegardées
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune recherche sauvegardée
            <p className="text-sm mt-2">
              Utilisez les filtres puis cliquez sur le bouton de sauvegarde dans "Recherche active"
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedSearches.map((search, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <button
                    onClick={() => handleLoadSearch(search)}
                    className="flex-1 text-left"
                  >
                    <h4 className="font-medium text-gray-800 mb-1">{search.name}</h4>
                    <p className="text-xs text-gray-500">
                      Créée le {formatDate(search.createdAt)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSearch(index)
                    }}
                    className="ml-2 text-gray-400 hover:text-red-500 transition"
                    aria-label="Supprimer"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {savedSearches.length < 3 && savedSearches.length > 0 && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            {3 - savedSearches.length} recherche{3 - savedSearches.length > 1 ? 's' : ''}{' '}
            restante{3 - savedSearches.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default SavedSearchesPanel
