/**
 * src/services/geolocation.ts
 * 
 * Service d'accès à l'API OpenStreetMap Nominatim pour géolocalisation et géocodage.
 * Fournit des fonctions pour obtenir des coordonnées à partir d'une adresse, ou inversement.
 */

export interface GeocodeResult {
  lat: number
  lon: number
  display_name: string           // Libellé brut OSM
  formattedLabel: string        // Libellé formaté propre, ex: "23 Rue des Consuls, 31300 Toulouse"
  address: AddressObject        // Composants d'adresse pour usage futur (rayon, tri, etc.)
}

export interface AddressObject {
  house_number?: string
  road?: string
  postcode?: string
  city?: string
  town?: string
  village?: string
  hamlet?: string
  suburb?: string
  municipality?: string
  state?: string
  county?: string
  country?: string
  [key: string]: string | undefined
}

/**
 * Formatte une adresse lisible à partir des composants OSM
 * @param item objet brut OSM avec .address
 * @returns ex: "23 Rue des Consuls, 31300 Toulouse"
 */
export function formatAddressLabel(item: { address?: AddressObject }): string {
  const addr: AddressObject = item.address ?? {}

  const parts: string[] = []

  // Ligne 1 : numéro et rue
  if (addr.house_number) {
    parts.push(`${addr.house_number} ${addr.road ?? ''}`.trim())
  } else if (addr.road) {
    parts.push(addr.road)
  }

  // Ligne 2 : code postal + ville
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.hamlet ||
    addr.suburb ||
    addr.municipality

  if (addr.postcode || city) {
    parts.push([addr.postcode, city].filter(Boolean).join(' '))
  }

  return parts.join(', ')
}

/**
 * Effectue une requête de géocodage Nominatim à partir d'une adresse (forward)
 * @param address Adresse texte saisie par l'utilisateur
 * @returns Liste de suggestions (GeocodeResult[])
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}&addressdetails=1&countrycodes=fr`

  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'fr',
      'User-Agent': 'ouquandquoi.fr demo - contact: admin@ouquandquoi.fr'
    }
  })

  if (!response.ok) throw new Error('Erreur de géocodage')

  const data = await response.json()
  return data.map((item: any): GeocodeResult => ({
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    display_name: item.display_name,
    formattedLabel: formatAddressLabel(item),
    address: item.address ?? {}
  }))
}

/**
 * Requête inverse pour retrouver une adresse à partir de coordonnées GPS (reverse)
 * @param lat Latitude
 * @param lon Longitude
 * @returns Résultat formaté ou null
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`

  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'fr',
      'User-Agent': 'ouquandquoi.fr demo - contact: admin@ouquandquoi.fr'
    }
  })

  if (!response.ok) throw new Error('Erreur de reverse geocoding')

  const data = await response.json()
  if (!data || !data.lat || !data.lon) return null

  return {
    lat: parseFloat(data.lat),
    lon: parseFloat(data.lon),
    display_name: data.display_name,
    formattedLabel: formatAddressLabel(data),
    address: data.address ?? {}
  }
}
