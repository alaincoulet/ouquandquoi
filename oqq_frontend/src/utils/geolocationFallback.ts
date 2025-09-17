// ==========================================================
// FICHIER : src/utils/geolocationFallback.ts
// Fonctions utilitaires pour fallback géolocalisation par grande ville
// - Utilisé dans le panel "Déposer une activité" & le filtre "Où ?"
// - Fournit une suggestion "mairie principale" (code postal central) si Nominatim ne retourne rien
// - Fallback 100% open-source, utilise la table MAIN_CITY_POSTAL_CODES et Nominatim
// ==========================================================

import { MAIN_CITY_POSTAL_CODES } from './postalCodes'
import { geocodeAddress, GeocodeResult } from '@/services/geolocation'

/**
 * Tente de retourner une suggestion "ville principale" formatée et géocodée.
 * Si la saisie correspond à une grande ville, requête Nominatim avec "{cp} {ville}" pour obtenir la mairie centrale.
 * Si la requête Nominatim échoue, retourne un fallback local avec coordonnées GPS approximatives.
 *
 * @param input - Saisie utilisateur (ville, lieu, etc.)
 * @returns Promise<GeocodeResult | null> - Suggestion fallback (ou null si rien)
 */
export async function getFallbackMainCitySuggestion(input: string): Promise<GeocodeResult | null> {
  if (!input) return null

  // Normalise la saisie pour matcher la table (casse, accents, espaces)
  const normalized = input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Recherche dans la table enrichie
  const match = Object.entries(MAIN_CITY_POSTAL_CODES).find(([city]) =>
    city
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') === normalized
  )
  if (!match) return null

  const [city, info] = match
  const { postcode, lat, lon } = info

  // Requête Nominatim pour "{cp} {ville}"
  try {
    const query = `${postcode} ${city}`
    const data = await geocodeAddress(query)
    if (data && data.length > 0) {
      // On prend la première suggestion (la plus centrale, souvent mairie)
      const s = data[0]
      s.formattedLabel = `${postcode} ${city} (Mairie principale)`
      return s
    }
  } catch {
    // Ignore erreur API, fallback brut
  }

  // Fallback local avec coordonnées GPS
  return {
    display_name: `${postcode} ${city} (Mairie principale)`,
    formattedLabel: `${postcode} ${city} (Mairie principale)`,
    address: {
      city,
      postcode,
    },
    lat,
    lon,
  } as GeocodeResult
}

/**
 * Helper pour formater le label code postal + ville (usage badge/affichage)
 * @param cp - code postal
 * @param city - nom de la ville
 * @returns string (ex: "31000 Toulouse")
 */
export function getPostalLabel(cp: string, city: string) {
  return `${cp} ${city}`.trim()
}

// ==========================================================
// FONCTION AJOUTÉE : Calcul de distance Haversine entre deux points
// - Utilisé pour déterminer les activités proches de chez l'utilisateur
// - Retourne une distance en kilomètres avec deux décimales
// ==========================================================

/**
 * Calcule la distance en km entre deux points (lat1/lon1, lat2/lon2)
 * @returns distance en kilomètres (float, précision 2 décimales)
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Rayon de la Terre en km
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 100) / 100 // arrondi à 2 décimales
}
