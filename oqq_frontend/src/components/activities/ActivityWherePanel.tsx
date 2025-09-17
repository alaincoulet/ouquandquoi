// ==========================================================
// FICHIER : src/components/activities/ActivityWherePanel.tsx
// Sélecteur de localisation pour la dépose d’activité (structure “état / comportements / affichage”)
// ==========================================================

import React, { useState, useRef, useEffect } from 'react'
import { geocodeAddress, GeocodeResult } from '@/services/geolocation'
import { MAIN_CITY_POSTAL_CODES, CityPostalInfo } from '@/utils/postalCodes'

interface ActivityWherePanelProps {
  value: string
  onChange: (val: { label: string; location: string; lat?: number; lon?: number }) => void
  onClose: () => void
}

// --- Bloc 1 : STATE (état, données) ---
export function ActivityWherePanel({ value, onChange, onClose }: ActivityWherePanelProps) {
  // état (données du composant)
  const [input, setInput] = useState(value || '')
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([])
  const [grouped, setGrouped] = useState<GeocodeResult[]>([])
  const [selected, setSelected] = useState<GeocodeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Bloc 2 : COMPORTEMENTS (fonctions, useEffect, handlers) ---

  // reset état si valeur d’entrée change
  useEffect(() => {
    setInput(value || '')
    setSuggestions([])
    setGrouped([])
    setSelected(null)
    setError(null)
    setShowSuggestions(false)
  }, [value])

  // récupération suggestions avec debounce
  useEffect(() => {
    if (!input) {
      setSuggestions([])
      setGrouped([])
      setShowSuggestions(false)
      return
    }
    setLoading(true)
    setError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await geocodeAddress(input)
        const patched = data.map((s) => {
          const city =
            s.address.city ||
            s.address.town ||
            s.address.village ||
            s.address.hamlet ||
            s.address.suburb ||
            s.address.municipality ||
            ''
          const fallback: CityPostalInfo | undefined =
            typeof city === 'string' && city in MAIN_CITY_POSTAL_CODES
              ? MAIN_CITY_POSTAL_CODES[city]
              : undefined
          const postcode = s.address.postcode || fallback?.postcode || ''
          const lat = s.lat ?? fallback?.lat ?? 0
          const lon = s.lon ?? fallback?.lon ?? 0
          return {
            ...s,
            lat,
            lon,
            address: {
              ...s.address,
              postcode
            },
            display_name: s.display_name || `${postcode} ${city}`,
            formattedLabel: `${postcode} ${city}`
          }
        })
        setSuggestions(patched.slice(0, 12))
        setShowSuggestions(true)
        const allCities = patched.map(s => ({
          city: s.address.city ||
            s.address.town ||
            s.address.village ||
            s.address.hamlet ||
            s.address.suburb ||
            s.address.municipality ||
            '',
          postcode: s.address.postcode || '',
          ...s
        }))
        const unique = Object.values(
          allCities.reduce((acc, s) => {
            const key = `${s.city}_${s.postcode}`
            if (!acc[key]) acc[key] = s
            return acc
          }, {} as Record<string, GeocodeResult>)
        )
        if (unique.length >= 2) setGrouped(unique)
        else setGrouped([])
        if (patched.length === 0) setError("Aucun résultat trouvé.")
      } catch {
        setError("Erreur lors de la recherche.")
        setSuggestions([])
        setGrouped([])
        setShowSuggestions(false)
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const panel = document.getElementById('activity-where-panel')
      if (panel && !panel.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    if (showSuggestions) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSuggestions])

  // handlers
  const handleSelect = (s: GeocodeResult) => {
    const label = getPostalLabel(s)
    setInput(label)
    setSelected(s)
    setSuggestions([])
    setGrouped([])
    setShowSuggestions(false)
  }
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    setSelected(null)
  }
  const handleValidate = () => {
    if (!selected) {
      setError("Merci de sélectionner une adresse dans la liste.")
      return
    }
    const label = getPostalLabel(selected)
    onChange({
      label,
      location: label,
      lat: selected.lat,
      lon: selected.lon
    })
    onClose()
  }

  function getPostalLabel(s: GeocodeResult): string {
    const city =
      s.address.city ||
      s.address.town ||
      s.address.village ||
      s.address.hamlet ||
      s.address.suburb ||
      s.address.municipality ||
      ''
    const fallback: CityPostalInfo | undefined =
      typeof city === 'string' && city in MAIN_CITY_POSTAL_CODES
        ? MAIN_CITY_POSTAL_CODES[city]
        : undefined
    const cp = s.address.postcode || fallback?.postcode || ''
    return `${cp} ${city}`.trim()
  }

  // --- Bloc 3 : AFFICHAGE (render) ---
  return (
    <div id="activity-where-panel" className="absolute top-full left-0 bg-white border shadow rounded-lg p-4 z-20 w-80">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Où ?</span>
        <button onClick={onClose} className="text-xs text-gray-500">Fermer</button>
      </div>
      <input
        type="text"
        className="w-full border rounded-lg p-2 mb-2"
        placeholder="Commencez à taper une adresse, un lieu, une ville…"
        value={input}
        onChange={handleInput}
        autoFocus
        autoComplete="off"
        onFocus={() => (suggestions.length > 0 || grouped.length > 0) && setShowSuggestions(true)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleValidate()
        }}
      />
      {showSuggestions && (grouped.length > 0 || suggestions.length > 0) && (
        <ul className="absolute left-0 right-0 bg-white border rounded shadow max-h-56 overflow-auto mt-1 z-30">
          {Array.from(
            new Map(
              (grouped.length > 0 ? grouped : suggestions)
                .map(s => [getPostalLabel(s), s])
            ).values()
          ).map((s, i) => (
            <li
              key={i}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => handleSelect(s)}
            >
              <span className="font-medium">{getPostalLabel(s)}</span>
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <div className="absolute right-4 top-10 text-xs text-blue-500">
          Recherche…
        </div>
      )}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        onClick={handleValidate}
        className="mt-2 w-full bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700 transition"
      >
        Valider
      </button>
    </div>
  )
}
