// ==========================================================
// FICHIER : src/context/GeolocationContext.tsx
// Context React global pour la géolocalisation utilisateur (oùquandquoi.fr)
// - Fournit lat/lon, état d’activation/refus, fonctions activer/désactiver
// - Centralise le stockage (localStorage/sessionStorage) et l’accès partout dans l’app
// - RGPD Ready : aucune donnée partagée sans consentement
// ==========================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Type d’état pour le context
export interface GeolocationState {
  active: boolean              // Position activée ?
  lat?: number | null
  lon?: number | null
  error?: string | null        // Message d’erreur/refus utilisateur
  loading?: boolean            // Recherche en cours ?
  timestamp?: number           // Dernière récupération de la position
}

interface GeolocationContextType extends GeolocationState {
  requestGeolocation: () => void
  clearGeolocation: () => void
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined)

// --- Stockage clé pour la persistance douce (ex : sessionStorage, pas localStorage si tu veux “temporaire”)
const STORAGE_KEY = 'user_geolocation'

export const GeolocationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GeolocationState>({
    active: false,
    lat: undefined,
    lon: undefined,
    error: null,
    loading: false,
    timestamp: undefined,
  })

  // Au chargement, restaure la position stockée (si existante et récente, ex : <24h)
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Option : expire la géoloc après X heures (ici 24h)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setState({
            ...parsed,
            active: true,
            error: null,
            loading: false,
          })
        } else {
          sessionStorage.removeItem(STORAGE_KEY)
        }
      } catch { /* ignore */ }
    }
  }, [])

  // --- Fonction pour activer la géoloc (avec demande navigateur)
  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        active: false,
        error: "Votre navigateur ne supporte pas la géolocalisation.",
        loading: false,
      }))
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          active: true,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          error: null,
          loading: false,
          timestamp: Date.now(),
        })
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            timestamp: Date.now(),
          })
        )
      },
      (err) => {
        let errorMsg = "Impossible d'obtenir votre position."
        if (err.code === 1) errorMsg = "Autorisation refusée pour la géolocalisation."
        if (err.code === 2) errorMsg = "Position non disponible."
        if (err.code === 3) errorMsg = "Temps d'attente dépassé."
        setState((s) => ({
          ...s,
          active: false,
          lat: undefined,
          lon: undefined,
          error: errorMsg,
          loading: false,
        }))
        sessionStorage.removeItem(STORAGE_KEY)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10 * 60 * 1000, // 10 min
      }
    )
  }

  // --- Fonction pour désactiver la géolocalisation (efface position et erreur)
  const clearGeolocation = () => {
    setState({
      active: false,
      lat: undefined,
      lon: undefined,
      error: null,
      loading: false,
      timestamp: undefined,
    })
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return (
    <GeolocationContext.Provider
      value={{
        ...state,
        requestGeolocation,
        clearGeolocation,
      }}
    >
      {children}
    </GeolocationContext.Provider>
  )
}

// --- Hook d’accès simplifié ---
export function useGeolocation() {
  const ctx = useContext(GeolocationContext)
  if (!ctx) throw new Error("useGeolocation doit être utilisé dans un GeolocationProvider.")
  return ctx
}
