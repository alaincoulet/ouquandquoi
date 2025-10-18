import React, { useState, useEffect, useRef } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { fr } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'

interface FilterWhenPanelProps {
  value: string
  onChange: (val: string) => void
  onClose: () => void
}

function formatDate(date: Date | undefined): string {
  return date ? date.toLocaleDateString('fr-FR') : '--/--/----'
}

function parseDateFromValue(val: string): Date | undefined {
  if (!val) return undefined
  const parts = val.split('/')
  if (parts.length !== 3) return undefined
  const [day, month, year] = parts.map(x => parseInt(x, 10))
  if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined
  return new Date(year, month - 1, day)
}

function parseRangeFromValue(val: string): DateRange | undefined {
  if (!val.includes('-')) return undefined
  const [fromStr, toStr] = val.split('-').map(s => s.trim())
  const from = parseDateFromValue(fromStr)
  const to = parseDateFromValue(toStr)
  if (!from) return undefined
  return { from, to }
}

export function FilterWhenPanel({ value, onChange, onClose }: FilterWhenPanelProps) {
  const [mode, setMode] = useState<'range' | 'single'>('range')
  const [selected, setSelected] = useState<Date | undefined>()
  const [range, setRange] = useState<DateRange | undefined>()
  const [month, setMonth] = useState<Date | undefined>(undefined)
  const lastFromRef = useRef<Date | undefined>(undefined)

  // Synchronise l’état local à la prop value à chaque ouverture OU changement de mode
  useEffect(() => {
    if (mode === 'single') {
      const date = parseDateFromValue(value)
      setSelected(date)
      if (date) setMonth(date)
    }
    if (mode === 'range') {
      const r = parseRangeFromValue(value)
      setRange(r)
      if (r?.from) setMonth(r.from)
    }
    lastFromRef.current = undefined
    // eslint-disable-next-line
  }, [value, mode])

  // -- Mise à jour de la variable temporaire à chaque clic de date en mode range
  const handleRangeSelect = (rangeValue: DateRange | undefined) => {
    setRange(rangeValue)
    if (rangeValue?.from) {
      lastFromRef.current = rangeValue.from
    }
    if (
      rangeValue?.from &&
      rangeValue?.to &&
      rangeValue.from.getTime() !== rangeValue.to.getTime()
    ) {
      onChange(`${formatDate(rangeValue.from)} - ${formatDate(rangeValue.to)}`)
      lastFromRef.current = undefined
      onClose()
    }
  }

  // -- Validation d'une date simple
  const handleSelect = (date: Date | undefined) => {
    setSelected(date)
    if (date) {
      onChange(formatDate(date))
      lastFromRef.current = undefined
      onClose()
    }
  }

  // --- UX : passage en "Date simple" avec une date from temporaire = validation + fermeture immédiate
  const handleSwitchMode = (newMode: 'range' | 'single') => {
    if (newMode === 'single' && lastFromRef.current) {
      onChange(formatDate(lastFromRef.current))
      setSelected(lastFromRef.current)
      lastFromRef.current = undefined
      setRange(undefined)
      onClose()
      return
    }
    setMode(newMode)
  }

  // --- Navigation années suivantes/précédentes
  const goToNextYear = () => {
    setMonth((prev) => {
      const ref = prev || new Date()
      return new Date(ref.getFullYear() + 1, 0, 1)
    })
  }
  const goToPrevYear = () => {
    setMonth((prev) => {
      const ref = prev || new Date()
      return new Date(ref.getFullYear() - 1, 0, 1)
    })
  }

  const startLabel = range?.from ? formatDate(range.from) : 'Sélectionner la date de début'
  const endLabel = range?.to ? formatDate(range.to) : 'Sélectionner la date de fin'

  return (
    <div className="absolute top-full left-0 bg-white border shadow rounded-lg p-4 z-50 w-[450px]">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Quand ?</span>
        <button onClick={() => { lastFromRef.current = undefined; onClose() }} className="text-xs text-gray-500">Fermer</button>
      </div>
      <div className="mb-2 flex gap-2">
        <button
          className={`px-2 py-1 rounded ${mode === 'range' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => handleSwitchMode('range')}
        >
          Sélectionner une période
        </button>
        <button
          className={`px-2 py-1 rounded ${mode === 'single' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => handleSwitchMode('single')}
        >
          Date simple
        </button>
      </div>

      {/* BLOC CHEVRONS DE NAVIGATION PAR ANNÉE */}
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={goToPrevYear}
          className="px-2 py-1 text-xl text-gray-500 hover:text-green-700 rounded transition"
          aria-label="Année précédente"
        >‹‹</button>
        <span className="font-semibold">
          {month ? month.getFullYear() : new Date().getFullYear()}
        </span>
        <button
          type="button"
          onClick={goToNextYear}
          className="px-2 py-1 text-xl text-gray-500 hover:text-green-700 rounded transition"
          aria-label="Année suivante"
        >››</button>
      </div>

      {mode === 'range' ? (
        <>
          <div className="max-h-[450px] overflow-y-auto flex flex-col">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleRangeSelect}
              month={month}
              onMonthChange={setMonth}
              numberOfMonths={12}
              locale={fr}
              weekStartsOn={1}
              modifiersClassNames={{
                selected: 'bg-green-600 text-white',
                today: 'border border-green-600',
                range_start: 'bg-green-500 text-white',
                range_end: 'bg-green-500 text-white',
                range_middle: 'bg-green-100'
              }}
            />
          </div>
          <div className="mt-3 flex flex-col gap-1 items-center text-sm">
            <div>
              <span className="font-semibold">Date de début : </span>
              <span className={range?.from ? "text-green-700" : "text-gray-400"}>
                {startLabel}
              </span>
            </div>
            <div>
              <span className="font-semibold">Date de fin : </span>
              <span className={range?.to ? "text-green-700" : "text-gray-400"}>
                {endLabel}
              </span>
            </div>
            {!range?.to && range?.from && (
              <span className="text-xs text-gray-500 mt-2">
                Sélectionnez la date de fin de période.
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="max-h-[450px] overflow-y-auto flex flex-col">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            month={selected ?? month}
            onMonthChange={setMonth}
            numberOfMonths={12}
            locale={fr}
            weekStartsOn={1}
            modifiersClassNames={{
              selected: 'bg-green-600 text-white',
              today: 'border border-green-600'
            }}
          />
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400">
        Par défaut : Toute l’année.<br />
        <span className="text-green-700">Astuce : </span>
        En mode période, cliquez deux fois pour définir “du” et “au”.
      </div>
    </div>
  )
}
