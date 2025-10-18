// ==========================================================
// FILE : src/components/organisms/MapView.tsx
// Carte interactive avec clustering des activités
// - Affiche les activités filtrées sur une carte de France
// - Regroupement automatique des marqueurs proches (clustering)
// - Zoom pour diviser les clusters
// - Popup au clic sur un marqueur
// ==========================================================

import React, { useMemo, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Activity } from '@/types/activity'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import ProductCard from '@/components/molecules/ProductCard'

// Fix pour les icônes Leaflet par défaut
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapViewProps {
  activities: Activity[]
  onActivityClick?: (activityId: string) => void
  onToggleFavorite?: (_id: string, newFav: boolean) => Promise<void> | void
  userFavorites?: string[]
}

// Composant pour ajuster la vue de la carte automatiquement
function MapBoundsUpdater({ activities }: { activities: Activity[] }) {
  const map = useMap()

  useMemo(() => {
    if (activities.length === 0) {
      // Vue par défaut : France entière
      map.setView([46.603354, 1.888334], 6)
      return
    }

    // Calculer les limites des activités
    const validActivities = activities.filter(
      (a) => a.lat !== undefined && a.lon !== undefined
    )

    if (validActivities.length === 0) {
      map.setView([46.603354, 1.888334], 6)
      return
    }

    if (validActivities.length === 1) {
      const sortedByDate = [...validActivities].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA // Plus récent en premier
      })
      const activity = sortedByDate[0]
      map.setView([activity.lat!, activity.lon!], 10)
      return
    }

    // Créer des bounds pour englober toutes les activités
    const bounds = L.latLngBounds(
      validActivities.map((a) => [a.lat!, a.lon!])
    )
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [activities, map])

  return null
}

const MapView: React.FC<MapViewProps> = ({ 
  activities, 
  onActivityClick,
  onToggleFavorite,
  userFavorites = []
}) => {
  const navigate = useNavigate()
  
  // Activité affichée dans le panneau droit (dernière créée par défaut, puis dernière survolée)
  const [displayedActivity, setDisplayedActivity] = useState<Activity | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  
  // Initialiser avec la dernière activité créée (createdAt)
  React.useEffect(() => {
    if (activities.length > 0 && !displayedActivity) {
      const sortedByDate = [...activities].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA // Plus récent en premier
      })
      setDisplayedActivity(sortedByDate[0])
    }
  }, [activities, displayedActivity])

  // Filtrer les activités avec coordonnées valides
  const validActivities = useMemo(
    () =>
      activities.filter(
        (a) =>
          a.lat !== undefined &&
          a.lon !== undefined &&
          !isNaN(a.lat) &&
          !isNaN(a.lon)
      ),
    [activities]
  )

  const handleMarkerClick = (activityId: string) => {
    if (onActivityClick) {
      onActivityClick(activityId)
    } else {
      navigate(`/activity/${activityId}`)
    }
  }

  // Configuration du clustering
  const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount()
    let size = 'small'
    if (count > 10) size = 'medium'
    if (count > 50) size = 'large'

    return L.divIcon({
      html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
      className: 'custom-marker-cluster',
      iconSize: L.point(40, 40, true),
    })
  }


  return (
    <div className="flex w-full h-full gap-4" ref={mapRef}>
      {/* Panneau latéral ProductCard - 1/3 de la largeur à GAUCHE */}
      <div className="w-1/3 h-full overflow-y-auto flex items-center justify-center">
        {displayedActivity ? (
          <div className="w-full">
            <ProductCard
              product={{
                ...displayedActivity,
                isFavorite: userFavorites.includes(displayedActivity._id),
              }}
              onToggleFavorite={onToggleFavorite}
              modeCarousel={false}
            />
          </div>
        ) : (
          <div className="text-center text-gray-500 px-4">
            Survolez une épingle pour voir les détails
          </div>
        )}
      </div>

      {/* Carte - 2/3 de la largeur à DROITE */}
      <div className="w-2/3 h-full relative">
        <MapContainer
          center={[46.603354, 1.888334]} // Centre de la France
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater activities={validActivities} />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {validActivities.map((activity) => {
            // Utiliser l'épingle bleue par défaut de Leaflet (pas d'icone personnalisée)
            return (
              <Marker
                key={activity._id}
                position={[activity.lat!, activity.lon!]}
                // Pas de prop icon = utilise DefaultIcon (bleu)
                eventHandlers={{
                  mouseover: () => {
                    // Afficher l'activité survolée dans le panneau droit
                    setDisplayedActivity(activity)
                  },
                  click: () => {
                    // Clic: naviguer vers la page détail
                    handleMarkerClick(activity._id)
                  },
                }}
              />
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
      </div>

      {/* Styles pour les clusters */}
      <style>{`
        .custom-marker-cluster {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cluster-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
          color: white;
          border: 3px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .cluster-small {
          width: 40px;
          height: 40px;
          background-color: #16a34a;
          font-size: 14px;
        }
        
        .cluster-medium {
          width: 50px;
          height: 50px;
          background-color: #ea580c;
          font-size: 16px;
        }
        
        .cluster-large {
          width: 60px;
          height: 60px;
          background-color: #dc2626;
          font-size: 18px;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }
        
        .leaflet-popup-content {
          margin: 0;
          min-width: 200px;
        }
      `}</style>
    </div>
  )
}

export default MapView
