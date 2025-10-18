// ==========================================================
// FILE : src/components/organisms/MyScheduleCalendar.tsx
// Composant pour afficher les activités programmées de l'utilisateur
// - Liste chronologique des activités à venir
// - Affichage des rappels configurés
// - Options pour modifier ou supprimer
// ==========================================================

import React, { useEffect, useState } from 'react'
import { XMarkIcon, TrashIcon, PencilIcon, BellIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Activity } from '@/types/activity'

interface ScheduledActivity {
  activityId: Activity
  scheduledDate: string
  reminders: {
    type: 'email' | 'sms' | 'both'
    timeBefore: number
    repeat: number
  }[]
  notes?: string
  createdAt: string
}

interface MyScheduleCalendarProps {
  onClose: () => void
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`

const MyScheduleCalendar: React.FC<MyScheduleCalendarProps> = ({ onClose }) => {
  const { token, isAuthenticated } = useAuth()
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsLoading(false)
      return
    }

    fetchScheduledActivities()
  }, [token, isAuthenticated])

  const fetchScheduledActivities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/scheduled-activities`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Trier par date
      const sorted = (response.data.scheduledActivities || []).sort((a: ScheduledActivity, b: ScheduledActivity) => {
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      })
      
      setScheduledActivities(sorted)
    } catch (err) {
      console.error('Erreur lors du chargement des activités programmées:', err)
      setError('Impossible de charger vos activités programmées')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (index: number) => {
    if (!confirm('Voulez-vous vraiment retirer cette activité de votre calendrier ?')) {
      return
    }

    try {
      await axios.delete(`${API_BASE_URL}/users/scheduled-activities/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchScheduledActivities()
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      alert('Impossible de supprimer cette activité')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let relativeText = ''
      if (diffDays === 0) relativeText = "Aujourd'hui"
      else if (diffDays === 1) relativeText = 'Demain'
      else if (diffDays > 1 && diffDays <= 7) relativeText = `Dans ${diffDays} jours`
      
      return {
        full: format(date, 'EEEE dd MMMM yyyy', { locale: fr }),
        short: format(date, 'dd MMM yyyy', { locale: fr }),
        relative: relativeText,
        isPast: diffDays < 0
      }
    } catch {
      return { full: dateString, short: dateString, relative: '', isPast: false }
    }
  }

  const formatTimeLabel = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
    return `${Math.floor(minutes / 1440)}j`
  }

  const upcomingActivities = scheduledActivities.filter(sa => !formatDate(sa.scheduledDate).isPast)
  const pastActivities = scheduledActivities.filter(sa => formatDate(sa.scheduledDate).isPast)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-800">Mon Calendrier</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Chargement...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : !isAuthenticated ? (
            <div className="text-center py-12 text-gray-500">
              Veuillez vous connecter pour voir votre calendrier
            </div>
          ) : scheduledActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Aucune activité programmée</p>
              <p className="text-sm">
                Ajoutez une activité à vos favoris puis programmez-la dans votre calendrier
              </p>
            </div>
          ) : (
            <>
              {/* Activités à venir */}
              {upcomingActivities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    À venir ({upcomingActivities.length})
                  </h3>
                  <div className="space-y-4">
                    {upcomingActivities.map((scheduled, index) => {
                      const dateInfo = formatDate(scheduled.scheduledDate)
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white"
                        >
                          <div className="flex gap-4">
                            {/* Image */}
                            {scheduled.activityId?.image && (
                              <img
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${scheduled.activityId.image}`}
                                alt={scheduled.activityId.title}
                                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                              />
                            )}

                            {/* Infos */}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-1">
                                {scheduled.activityId?.title || 'Activité supprimée'}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {scheduled.activityId?.address}
                              </p>

                              {/* Date */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-green-600">
                                  {dateInfo.short}
                                </span>
                                {dateInfo.relative && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    {dateInfo.relative}
                                  </span>
                                )}
                              </div>

                              {/* Rappels */}
                              {scheduled.reminders.length > 0 && (
                                <div className="flex items-start gap-1 text-xs text-gray-600 mb-2">
                                  <BellIcon className="w-4 h-4 mt-0.5" />
                                  <div className="flex flex-wrap gap-1">
                                    {scheduled.reminders.map((reminder, rIdx) => (
                                      <span key={rIdx} className="bg-blue-50 px-2 py-0.5 rounded">
                                        {reminder.type === 'both' ? 'Email+SMS' : reminder.type} • {formatTimeLabel(reminder.timeBefore)} avant
                                        {reminder.repeat > 1 && ` (${reminder.repeat}x)`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {scheduled.notes && (
                                <p className="text-xs text-gray-500 italic mt-2">
                                  {scheduled.notes}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleDelete(scheduledActivities.indexOf(scheduled))}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Supprimer"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Activités passées */}
              {pastActivities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-500 mb-4">
                    Passées ({pastActivities.length})
                  </h3>
                  <div className="space-y-3 opacity-60">
                    {pastActivities.map((scheduled, index) => {
                      const dateInfo = formatDate(scheduled.scheduledDate)
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-700 text-sm">
                                {scheduled.activityId?.title || 'Activité supprimée'}
                              </h4>
                              <p className="text-xs text-gray-500">{dateInfo.short}</p>
                            </div>
                            <button
                              onClick={() => handleDelete(scheduledActivities.indexOf(scheduled))}
                              className="text-gray-400 hover:text-red-500 text-xs"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyScheduleCalendar
