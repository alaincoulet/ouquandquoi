/**
 * src/components/molecules/filters/FilterWhatPanel.tsx
 * 
 * Panel déroulant "Quoi ?" pour recherche par mot-clé, catégorie, sous-catégorie.
 * Désélection dynamique des sous-catégories matchées par mot-clé (exclusion filtrée).
 * - Affiche sous-catégories matchées en vert anis (actif)
 * - Clic : désélection/exclusion (blanc bord anis) ou réactivation (vert anis)
 * - Transmission du tableau excludedSubcategories au parent à chaque modification
 * - Props value centralise { keyword, category, subcategory, excludedSubcategories }
 */

import React, { useRef, useEffect } from 'react'

interface FilterWhatPanelProps {
  value: {
    keyword: string
    category?: string
    subcategory?: string
    excludedSubcategories?: string[]
  }
  onChange: (val: { keyword: string; category?: string; subcategory?: string; excludedSubcategories?: string[] }) => void
  onClose: () => void
  matchedSubs?: string[]
}

const CATEGORIES = [
  {
    name: "Événements & divertissements",
    sub: [
      "Arts vivants",
      "Événements festifs",
      "Événements professionnels",
      "Salons expositions, artisanat",
      "Loisirs ludiques",
      "Jeux, tournois, concours"
    ]
  },
  {
    name: "Sports",
    sub: [
      "Sports collectifs",
      "Sports individuels",
      "Sports de combats",
      "Sports de pleine nature",
      "Sports mécaniques",
      "Sports adaptés"
    ]
  },
  {
    name: "Gastronomie",
    sub: [
      "Cours de cuisine",
      "Dégustations",
      "Produits du terroir",
      "Restaurants"
    ]
  },
  {
    name: "Culture & patrimoine",
    sub: [
      "Musées & expositions",
      "Monuments & fouilles",
      "Arts plastiques & numériques",
      "Patrimoines industriels",
      "Patrimoines naturels",
      "Littérature & écriture"
    ]
  },
  {
    name: "Nature",
    sub: [
      "Jardinage & botanique",
      "Observation faune & flore",
      "Écotourisme"
    ]
  },
  {
    name: "Bien-être",
    sub: [
      "Soin du corps",
      "Soin de l’esprit"
    ]
  }
]

export function FilterWhatPanel({
  value,
  onChange,
  onClose,
  matchedSubs
}: FilterWhatPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const safeMatchedSubs = Array.isArray(matchedSubs) ? matchedSubs : []
  const excluded = Array.isArray(value.excludedSubcategories) ? value.excludedSubcategories : []

  // Autofocus à l'ouverture
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.setSelectionRange(0, 0)
  }, [])

  // Toggle exclusion/inclusion de sous-catégorie matchée
  const handleToggleSub = (cat: string, sub: string) => {
    if (!safeMatchedSubs.includes(sub)) return // Ne rien faire si non matchée
    let newExcluded = excluded.includes(sub)
      ? excluded.filter(s => s !== sub)
      : [...excluded, sub]
    onChange({
      ...value,
      excludedSubcategories: newExcluded
    })
  }

  // Saisie mot-clé : on remonte, on reset l'exclusion si le mot-clé change
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      keyword: e.target.value,
      excludedSubcategories: [] // Reset exclusion sur changement de mot-clé
    })
  }

  // Validation : applique la dernière sous-catégorie matchée ET non exclue
  const handleValidate = () => {
    let selected: { category: string, subcategory: string }[] = []
    CATEGORIES.forEach(cat => {
      cat.sub.forEach(sub => {
        if (safeMatchedSubs.includes(sub) && !excluded.includes(sub)) {
          selected.push({ category: cat.name, subcategory: sub })
        }
      })
    })
    const last = selected[selected.length - 1]
    onChange({
      keyword: value.keyword,
      category: last ? last.category : undefined,
      subcategory: last ? last.subcategory : undefined,
      excludedSubcategories: excluded
    })
    onClose()
  }

  // Helper de style
  const getSubButtonStyle = (sub: string) => {
    const matched = safeMatchedSubs.includes(sub)
    const isExcluded = excluded.includes(sub)
    let style = "transition border text-xs px-3 py-1 rounded-lg font-bold"
    if (matched && !isExcluded) {
      style += " bg-lime-300 border-2 border-lime-600"
    } else if (matched && isExcluded) {
      style += " bg-white border-2 border-lime-600"
    } else {
      style += " bg-gray-100 border border-gray-200"
    }
    return style + " hover:bg-lime-200 hover:border-lime-500"
  }

  return (
    <div className="absolute top-full left-0 bg-white border shadow rounded-lg z-50 w-[370px] min-w-[330px] flex flex-col" style={{ maxHeight: "none" }}>
      {/* Header + champ de recherche */}
      <div className="sticky top-0 bg-white p-4 z-10 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Quoi ?</span>
          <button onClick={onClose} className="text-xs text-gray-500">Fermer</button>
        </div>
        <label htmlFor="what-input" className="block text-sm font-medium text-gray-700 mb-1">
          Votre activité recherchée ?
        </label>
        <input
          ref={inputRef}
          id="what-input"
          type="text"
          className="w-full border rounded-lg p-2 text-base"
          value={typeof value.keyword === 'string' ? value.keyword : ''}
          onChange={handleInput}
          onKeyDown={e => {
            if (e.key === 'Enter') handleValidate()
          }}
        />
      </div>
      {/* Liste des catégories et sous-catégories */}
      <div className="p-4 pt-0">
        {CATEGORIES.map(category => (
          <div key={category.name} className="mb-2">
            <div className="font-semibold text-green-700 mb-1">{category.name}</div>
            <div className="flex flex-wrap gap-2">
              {category.sub.map(sub => {
                const matched = safeMatchedSubs.includes(sub)
                const isExcluded = excluded.includes(sub)
                return (
                  <button
                    key={sub}
                    className={getSubButtonStyle(sub)}
                    style={{
                      color: matched && !isExcluded ? "#205100" : undefined,
                      cursor: matched ? "pointer" : "not-allowed",
                      opacity: matched ? 1 : 0.7
                    }}
                    onClick={() => matched && handleToggleSub(category.name, sub)}
                    type="button"
                    aria-pressed={matched && !isExcluded}
                  >
                    {sub}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 pt-0">
        <button
          onClick={handleValidate}
          className="w-full bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700 transition"
        >
          Valider
        </button>
        <div className="mt-2 text-xs text-gray-400">Par défaut : Toutes les activités</div>
      </div>
      {/* Feedback UX si matchedSubs incorrect */}
      {!Array.isArray(matchedSubs) && matchedSubs !== undefined && (
        <div className="px-4 pb-3 text-xs text-red-500">
          Erreur technique : la liste matchedSubs n'est pas un tableau (voir console).
        </div>
      )}
    </div>
  )
}
