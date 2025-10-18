// ==========================================================
// FILE : src/components/organisms/ScheduleFavoriteModal.tsx
// Modal pour programmer une activité favorite dans le calendrier
// - Sélection de date avec calendrier
// - Configuration de rappels (email/sms/les deux)
// - Options de temps avant et répétition
// - Zone de notes optionnelle
// ==========================================================

import React, { useState } from 'react'
import { XMarkIcon, CalendarIcon, BellIcon } from '@heroicons/react/24/outline'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'
import { Activity } from '@/types/activity'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'

interface ScheduleFavoriteModalProps {
  activity: Activity
  onClose: () => void
  onSuccess?: () => void
}

interface Reminder {
  type: 'email' | 'sms' | 'both'
  timeBefore: number // minutes
  repeat: number
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`

const ScheduleFavoriteModal: React.FC<ScheduleFavoriteModalProps> = ({
  activity,
  onClose,
  onSuccess
}) => {
  const { token } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)

  // État pour le formulaire de rappel
  const [newReminder, setNewReminder] = useState<Reminder>({
    type: 'email',
    timeBefore: 60, // 1 heure par défaut
    repeat: 1
  })

  const timeOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 heure' },
    { value: 120, label: '2 heures' },
    { value: 1440, label: '1 jour' },
    { value: 2880, label: '2 jours' },
    { value: 10080, label: '1 semaine' }
  ]

  const handleAddReminder = () => {
    if (reminders.length < 5) {
      setReminders([...reminders, { ...newReminder }])
      setNewReminder({ type: 'email', timeBefore: 60, repeat: 1 })
      setShowReminderForm(false)
    }
  }

  const handleRemoveReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!selectedDate) {
      alert('Veuillez sélectionner une date')
      return
    }

    setIsSaving(true)
    try {
      await axios.post(
        `${API_BASE_URL}/users/scheduled-activities`,
        {
          activityId: activity._id,
          scheduledDate: selectedDate.toISOString(),
          reminders,
          notes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      alert('Activité programmée avec succès dans votre calendrier !')
      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error('Erreur lors de la programmation:', err)
      const errorMessage = err.response?.data?.error || 'Impossible de programmer cette activité'
      alert(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const formatTimeLabel = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
    return `${Math.floor(minutes / 1440)}j`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-green-600" />
            Programmer dans le calendrier
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Activité info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-1">{activity.title}</h3>
            <p className="text-sm text-gray-600">{activity.address}</p>
          </div>

          {/* Calendrier */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sélectionnez une date
            </label>
            <div className="flex justify-center border border-gray-200 rounded-lg p-4 bg-gray-50">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
                fromDate={new Date()}
                className="rdp-custom"
              />
            </div>
            {selectedDate && (
              <p className="text-sm text-green-600 mt-2 text-center font-medium">
                Date sélectionnée : {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
              </p>
            )}
          </div>

          {/* Section Rappels */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BellIcon className="w-5 h-5 text-blue-600" />
                Rappels ({reminders.length}/5)
              </label>
              {!showReminderForm && reminders.length < 5 && (
                <button
                  type="button"
                  onClick={() => setShowReminderForm(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  + Ajouter un rappel
                </button>
              )}
            </div>

            {/* Liste des rappels */}
            {reminders.length > 0 && (
              <div className="space-y-2 mb-4">
                {reminders.map((reminder, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800 capitalize">
                        {reminder.type === 'both' ? 'Email + SMS' : reminder.type}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        • {formatTimeLabel(reminder.timeBefore)} avant
                      </span>
                      {reminder.repeat > 1 && (
                        <span className="text-sm text-gray-600 ml-2">
                          • {reminder.repeat}x
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveReminder(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire nouveau rappel */}
            {showReminderForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type de rappel
                  </label>
                  <select
                    value={newReminder.type}
                    onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="both">Email + SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Temps avant l'événement
                  </label>
                  <select
                    value={newReminder.timeBefore}
                    onChange={(e) => setNewReminder({ ...newReminder, timeBefore: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  >
                    {timeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nombre de répétitions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newReminder.repeat}
                    onChange={(e) => setNewReminder({ ...newReminder, repeat: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Le rappel sera envoyé plusieurs fois avant l'événement
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddReminder}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    Ajouter
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReminderForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ajouter des notes pour cette activité..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedDate || isSaving}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Enregistrement...' : 'Programmer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScheduleFavoriteModal
