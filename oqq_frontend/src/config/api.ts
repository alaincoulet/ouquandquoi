// ==========================================================
// FICHIER : src/config/api.ts
// CONFIGURATION AXIOS + gestion des activités & favoris utilisateur (oùquandquoi.fr)
// L’URL de l’API est dynamique : .env (VITE_API_URL) pour basculer entre local et prod
// ==========================================================

import axios, { AxiosInstance, AxiosError } from 'axios'
import { SearchParams } from '@/types/search'
import { Activity } from '@/types/activity' // Import natif du type Activity MongoDB

/**
 * Base URL de l'API :
 * - Dev : .env.local → VITE_API_URL=http://localhost:4000
 * - Prod : .env → VITE_API_URL=https://api.ouquandquoi.fr
 * Fallback hardcodé sur localhost:4000 si variable absente
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

/**
 * Instance axios avec configuration commune
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Gestion d'erreur centralisée (optionnel)
 */
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    console.error('Erreur API :', error.message)
    return Promise.reject(error)
  }
)

/**
 * Récupère la liste complète des activités (MongoDB natif)
 * GET /api/activities
 * Retour attendu : { activities: Activity[] }
 */
export const getActivities = async (): Promise<Activity[]> => {
  try {
    const response = await api.get('/api/activities')
    return response.data.activities ?? response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des activités :', error)
    return []
  }
}

/**
 * Récupère la liste des activités expirées (admin)
 * GET /api/activities?expired=true
 * Retour attendu : { activities: Activity[] }
 */
export const getExpiredActivities = async (): Promise<Activity[]> => {
  try {
    const response = await api.get('/api/activities?expired=true')
    return response.data.activities ?? response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des activités expirées :', error)
    return []
  }
}

/**
 * Récupère une activité unique par son _id Mongo natif
 * GET /api/activities/:id
 * Retour attendu : { activity: Activity }
 */
export const getActivityById = async (id: string): Promise<Activity | null> => {
  try {
    const response = await api.get(`/api/activities/${id}`)
    return response.data.activity ?? response.data
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité :', error)
    return null
  }
}

/**
 * Appel à l'API pour rechercher des activités (ex: filtrage avancé)
 * Peut évoluer : POST /activities/search ou GET avec query params
 */
export const searchActivities = async (params: SearchParams) => {
  try {
    const response = await api.post('/activities/search', params)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la recherche :', error)
    throw error
  }
}

/**
 * Récupère la liste des favoris de l'utilisateur (tableau d'ObjectId natif Mongo sous forme string[])
 * GET /api/users/favorites
 * Retour attendu : { favorites: string[] }
 */
export const getFavorites = async (token: string): Promise<string[]> => {
  try {
    const response = await api.get('/api/users/favorites', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.favorites;
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris :", error)
    return []
  }
}

/**
 * Ajoute une activité aux favoris de l'utilisateur (nécessite token JWT)
 * PATCH /api/users/favorites/:activityId
 * activityId = _id natif MongoDB
 */
export const addFavorite = async (activityId: string, token: string) => {
  try {
    const response = await api.patch(
      `/api/users/favorites/${activityId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('Erreur lors de l\'ajout du favori :', error)
    throw error
  }
}

/**
 * Supprime une activité des favoris de l'utilisateur (nécessite token JWT)
 * DELETE /api/users/favorites/:activityId
 * activityId = _id natif MongoDB
 */
export const removeFavorite = async (activityId: string, token: string) => {
  try {
    const response = await api.delete(
      `/api/users/favorites/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('Erreur lors de la suppression du favori :', error)
    throw error
  }
}

export default api
