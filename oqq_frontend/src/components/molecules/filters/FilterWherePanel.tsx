/**
 * Panel déroulant "Où ?" pour la recherche géographique sur oùquandquoi.fr.
 * - Saisie d'adresse, suggestions, sélection, choix de distance unique (10/20/50/100 km)
 * - Lorsque la distance est changée, elle écrase l'ancienne (pas d'accumulation)
 * - Validation transmet la dernière distance choisie (et l'adresse) au parent via onChange
 * - Applique un fallback code postal et coordonnées GPS si Nominatim ne fournit pas tout
 */

import React, { useState, useRef, useEffect } from 'react'
import { geocodeAddress, GeocodeResult } from '@/services/geolocation'
import { MAIN_CITY_POSTAL_CODES, CityPostalInfo } from '@/utils/postalCodes'

interface FilterWherePanelProps {
  value: string
  onChange: (val: {
    label: string
    location: string
    lat?: number
    lon?: number
    distance?: number
  }) => void
  onClose: () => void
  hideDistance?: boolean
}

const DISTANCES = [10, 20, 50, 100]

export function FilterWherePanel({
  value,
  onChange,
  onClose,
  hideDistance = false
}: FilterWherePanelProps) {
  const [input, setInput] = useState(() => {
    let cleaned = value || ''
    cleaned = cleaned.replace(/\s*,\s*\d+\s*km\s*$/, '')
    return cleaned
  })
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<GeocodeResult | null>(null)
  const [distance, setDistance] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cleanedValue = value || ''
    cleanedValue = cleanedValue.replace(/\s*,\s*\d+\s*km\s*$/, '')
    setInput(cleanedValue)
    setSuggestions([])
    setSelectedSuggestion(null)
    setError(null)
    setShowSuggestions(false)
  }, [value])

  useEffect(() => {
    if (!input) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    setLoading(true)
    setError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await geocodeAddress(input)

        const patched: GeocodeResult[] = data.map((s) => {
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
            display_name: s.display_name || `${postcode} ${city}`,
            formattedLabel: `${postcode} ${city}`,
            address: {
              ...s.address,
              postcode
            }
          }
        })

        setSuggestions(patched.slice(0, 6))
        setShowSuggestions(true)
        if (patched.length === 0) setError("Aucun résultat trouvé.")
      } catch {
        setError("Erreur lors de la recherche.")
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input])

  const handleSelect = (s: GeocodeResult) => {
    setInput(s.formattedLabel)
    setSelectedSuggestion(s)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    setSelectedSuggestion(null)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const panel = document.getElementById('where-panel')
      if (panel && !panel.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    if (showSuggestions) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showSuggestions])

  const handleValidate = () => {
    const location = input.trim()
    const label = location + (!hideDistance ? `, ${distance} km` : '')
    onChange({
      label,
      location,
      distance: hideDistance ? undefined : distance,
      lat: selectedSuggestion?.lat,
      lon: selectedSuggestion?.lon
    })
    onClose()
  }

  function MockMap() {
    return (
      <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center mb-2 text-gray-500 text-xs">
        [Carte interactive ici bientôt]
      </div>
    )
  }

  return (
    <div id="where-panel" className="absolute top-full left-0 bg-white border shadow rounded-lg p-4 z-50 w-80">
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
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleValidate()
        }}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded shadow max-h-40 overflow-auto mt-1 z-30">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => handleSelect(s)}
            >
              <span className="font-medium">{s.formattedLabel}</span>
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
      <MockMap />
      {!hideDistance && (
        <div className="flex items-center gap-2 mt-2 mb-2">
          <label htmlFor="distance" className="text-xs text-gray-500">Distance :</label>
          <select
            id="distance"
            className="border rounded p-1"
            value={distance}
            onChange={e => setDistance(Number(e.target.value))}
          >
            {DISTANCES.map(d => (
              <option key={d} value={d}>{d} km</option>
            ))}
          </select>
        </div>
      )}
      <button
        onClick={handleValidate}
        className="mt-2 w-full bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700 transition"
      >
        Valider
      </button>
    </div>
  )
}
