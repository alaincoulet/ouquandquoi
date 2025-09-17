// ==========================================================
// FICHIER : src/pages/Home/index.tsx
// Page d'accueil oùquandquoi.fr : sticky chaîné, pubs partenaires, carrousels
// ==========================================================

import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
// import Header from '@/components/layout/Header'; // SUPPRIMÉ
import ProductCard from '@/components/molecules/ProductCard';
import Icon from '@/components/atoms/Icon';
import Carousel from '@/components/ui/Carousel';
import { Activity } from '@/types/activity';
import { WhereFilter } from '@/types/search';
import { useGeolocation } from '@/context/GeolocationContext';
import { haversineDistance } from '@/utils/geolocationFallback';
import { useAuth } from "@/context/AuthContext";
import { getRecentlyViewed } from "@/services/user";

// ... (utils extractEndDate/isExpiredActivity inchangés)

function extractEndDate(when?: string): Date | undefined {
  if (!when) return undefined;
  const regex = /^(\d{2}\/\d{2}\/\d{4})(\s*-\s*(\d{2}\/\d{2}\/\d{4}))?$/;
  const match = when.match(regex);
  if (!match) return undefined;
  const endDateStr = match[3] || match[1];
  const [day, month, year] = endDateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}
function isExpiredActivity(when?: string): boolean {
  const endDate = extractEndDate(when);
  if (!endDate) return false;
  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= endDatePlusOne;
}

interface HomePageProps {
  favoritesActive: boolean;
  onToggleFavorites: () => void;
  onToggleFavorite: (_id: string, newFav: boolean) => Promise<void> | void;
  whereFilter: WhereFilter;
  onWhereChange: (val: WhereFilter) => void;
  whenFilter: string;
  onWhenChange: (val: string) => void;
  value: { keyword: string; category?: string; subcategory?: string; excludedSubcategories?: string[] };
  onWhatChange: (val: { keyword: string; category?: string; subcategory?: string; excludedSubcategories?: string[] }) => void;
  filteredResults: Activity[];
  allOnlineActivities: Activity[];
  userFavorites: string[];
  isLoading?: boolean;
  errorMsg?: string | null;
}

const getActivityId = (activity: Activity) => activity._id;

const HomePage: React.FC<HomePageProps> = ({
  favoritesActive,
  onToggleFavorites,
  onToggleFavorite,
  whereFilter,
  onWhereChange,
  whenFilter,
  onWhenChange,
  value,
  onWhatChange,
  filteredResults,
  allOnlineActivities,
  userFavorites = [],
  isLoading,
  errorMsg
}) => {
  const [recentlyViewed, setRecentlyViewed] = useState<Activity[]>([]);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (token && isAuthenticated) {
      getRecentlyViewed(token).then(setRecentlyViewed).catch(() => setRecentlyViewed([]));
    } else {
      setRecentlyViewed([]);
    }
  }, [token, isAuthenticated]);

  const { active, lat, lon } = useGeolocation();

  const favorites = allOnlineActivities.filter(
    (a) => userFavorites.includes(getActivityId(a)) && !isExpiredActivity(a.when)
  );

  const onlineActivities = allOnlineActivities.filter((a) => !isExpiredActivity(a.when));
  const filteredNotExpired = filteredResults.filter((a) => !isExpiredActivity(a.when));

  const nearbyActivities = active && lat && lon
    ? allOnlineActivities.filter(a =>
        !isExpiredActivity(a.when) &&
        typeof a.lat === 'number' &&
        typeof a.lon === 'number' &&
        haversineDistance(lat, lon, a.lat, a.lon) <= 50
      )
    : [];

  const sectionFavorites = favoritesActive && (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-black flex items-center">
          Mes favoris
          <span className="text-lg font-normal text-gray-500 ml-2">
            ({favorites.length} {favorites.length > 1 ? 'activités' : 'activité'})
          </span>
        </h3>
      </div>
      <div className="mb-8">
        <Carousel>
          {favorites.map((activity) => (
            <ProductCard
              key={activity._id}
              product={{ ...activity, isFavorite: true }}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </Carousel>
      </div>
    </>
  );

  const sectionNearby = (nearbyActivities.length > 0) && (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-black flex items-center">
          Proches de chez vous
          <span className="text-lg font-normal text-gray-500 ml-2">
            ({nearbyActivities.length} {nearbyActivities.length > 1 ? 'activités' : 'activité'})
          </span>
        </h3>
      </div>
      <div className="mb-8">
        <Carousel>
          {nearbyActivities.map((activity) => (
            <ProductCard
              key={activity._id}
              product={{
                ...activity,
                isFavorite: userFavorites.includes(activity._id)
              }}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </Carousel>
      </div>
    </>
  );

  const sectionAllOnline = onlineActivities.length > 0 && (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-black flex items-center">
          Activités en ligne
          <span className="text-lg font-normal text-gray-500 ml-2">
            ({onlineActivities.length} {onlineActivities.length > 1 ? 'activités' : 'activité'})
          </span>
        </h3>
      </div>
      <div className="mb-8">
        <Carousel>
          {onlineActivities.map((activity) => (
            <ProductCard
              key={activity._id}
              product={{
                ...activity,
                isFavorite: userFavorites.includes(activity._id)
              }}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </Carousel>
      </div>
    </>
  );

  const hasWhere = !!(whereFilter.location || whereFilter.label || whereFilter.lat || whereFilter.lon || whereFilter.distance);
  const hasWhen = !!whenFilter;
  const hasWhat = !!(value.keyword?.trim() || value.category || value.subcategory);

  const showRechercheActive = hasWhere || hasWhen || hasWhat;

  return (
    <Layout
      favoritesActive={favoritesActive}
      onToggleFavorites={onToggleFavorites}
      where={whereFilter}
      onWhereChange={onWhereChange}
      when={whenFilter}
      onWhenChange={onWhenChange}
      value={value}
      onWhatChange={onWhatChange}
      activitiesFiltered={filteredResults}
    >
      {/* --- Contenu principal Home --- */}
      <div className="flex flex-col items-center mb-5 mt-5">
        <span className="text-red-600 text-3xl font-bold mb-1 text-center">
          Site en construction, recherche de partenaires
        </span>
        <span className="text-red-600 text-l text-center">
          Renseignements&nbsp;:
          <a
            href="mailto:partenariat@oùquandquoi.fr"
            className="underline hover:text-red-800 transition-colors ml-1"
            tabIndex={0}
            aria-label="Contacter l’équipe commerciale ou technique par mail"
          >
            partenariat@oùquandquoi.fr
          </a>
        </span>
      </div>

      <main className="container mx-auto px-4 py-8">
        {showRechercheActive && filteredNotExpired.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-black flex items-center">
                Recherche active
                <span className="text-lg font-normal text-gray-500 ml-2">
                  ({filteredNotExpired.length} {filteredNotExpired.length > 1 ? 'activités' : 'activité'})
                </span>
              </h3>
              <button
                className="ml-4 px-3 py-1 rounded bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                onClick={() => {
                  onWhereChange({ label: '', location: '', distance: undefined, lat: undefined, lon: undefined });
                  onWhenChange('');
                  onWhatChange({ keyword: '', category: '', subcategory: '', excludedSubcategories: [] });
                }}
              >
                Réinitialiser
              </button>
            </div>
            <Carousel>
              {filteredNotExpired.map((activity) => (
                <ProductCard
                  key={activity._id}
                  product={{
                    ...activity,
                    isFavorite: userFavorites.includes(activity._id)
                  }}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </Carousel>
          </section>
        )}

        <section>
          {sectionFavorites}
          {sectionNearby}
          {sectionAllOnline}

          {!isLoading && !sectionAllOnline && !sectionFavorites && (
            <div className="text-center py-12">
              <Icon name="search" size="xl" className="mx-auto mb-4 text-gray-400" ariaLabel="Aucun résultat" />
              <h4 className="text-xl font-medium text-gray-900 mb-2">Aucune activité trouvée</h4>
              <p className="text-gray-600 mb-4">Aucune activité disponible.</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
                <span className="text-gray-600">Chargement…</span>
              </div>
            </div>
          )}

          {errorMsg && <div className="text-center text-red-600 mb-4">{errorMsg}</div>}
        </section>

        {/* --- Carousel "Consulté récemment" --- */}
        {recentlyViewed.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-black flex items-center">
                Consulté récemment
                <span className="text-lg font-normal text-gray-500 ml-2">
                  ({recentlyViewed.length} {recentlyViewed.length > 1 ? 'activités' : 'activité'})
                </span>
              </h3>
            </div>
            <Carousel>
              {recentlyViewed.map((activity) => (
                <ProductCard
                  key={activity._id}
                  product={{
                    ...activity,
                    isFavorite: userFavorites.includes(activity._id)
                  }}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </Carousel>
          </section>
        )}

      </main>
    </Layout>
  );
};

export default HomePage;
