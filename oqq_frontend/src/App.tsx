/**
 * src/App.tsx
 * Point d'entrée principal de l'application oùquandquoi.fr
 * - Gestion des routes, contextes, layout général
 * - Centralise les états globaux de filtres et de résultats d'activités
 * - Gère la synchro favoris utilisateur côté backend (MongoDB)
 * - Nettoyage : suppression de code mort (useLocation/headerFooterExclusions),
 *   et réutilisation de l'utilitaire haversineDistance depuis src/utils/geolocationFallback.ts
 */

import React, { useEffect, useState, Suspense, ReactNode, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth et Layout
import { AuthProvider, useAuth } from "@/context/AuthContext";

// RGPD (Cookie) — lazy pour ne pas bloquer le TTI
const CookieConsent = React.lazy(() => import("@/components/rgpd/CookieConsent"));

// Pages
import Home from "@/pages/Home";
import DeposerActivite from "@/pages/DeposerActivite";
import PolitiqueConfidentialite from "@/pages/confidentialite";
import ActivityDetail from "@/pages/Activity";
import ContactPage from "@/pages/Contact";
import AdminDashboardPage from "@/pages/Admin/AdminDashboardPage";

// Auth Pages
import LoginPage from "@/pages/Auth/LoginPage";
import ResetPasswordPage from "@/pages/Auth/ResetPasswordPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import ProfilePage from "@/pages/Auth/ProfilePage";

// API & Types
import { getActivities, addFavorite, removeFavorite, getFavorites } from "@/config/api";
import { Activity } from "@/types/activity";

// Utils : on réutilise l'utilitaire existant pour éviter la duplication de code
import { haversineDistance } from "@/utils/geolocationFallback";
import { parseDate, parseWhen, periodsOverlap } from "@/utils/date";

import AdminFloatingButton from '@/components/atoms/AdminFloatingButton'
import GeoFloatingButton from '@/components/atoms/GeoFloatingButton'

/**
 * Interface du filtre "Où ?"
 * - Centralisée ici pour exposition aux pages enfants (Home, etc.)
 * - NOTE: pourra être déplacée ultérieurement vers src/types/search.ts pour factorisation globale.
 */
export interface WhereFilter {
  label: string;
  location?: string;
  distance?: number;
  lat?: number;
  lon?: number;
}

/**
 * ClientOnly
 * - Évite tout rendu côté serveur (si SSR un jour) ou pendant l'hydratation
 * - Utile pour composants dépendants de window/document
 */
const ClientOnly: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
};

/**
 * ErrorBoundary (usage Klaro)
 * - Isole les erreurs du composant CookieConsent pour ne jamais bloquer l'app
 */
interface ErrorBoundaryProps { fallback?: ReactNode; children?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[CookieConsent] a rencontré une erreur :", error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children ?? null;
  }
}

/**
 * AppRoutes
 * - Contient les états globaux (filtres, résultats, favoris)
 * - Gère la récupération des activités et la synchro des favoris utilisateur
 */
const AppRoutes: React.FC = () => {
  // --- Favoris (affichage)
  const [favoritesActive, setFavoritesActive] = useState(false);
  const handleToggleFavorites = () => setFavoritesActive(prev => !prev);

  // --- Où ?
  const [whereFilter, setWhereFilter] = useState<WhereFilter>({
    label: "",
    location: "",
    distance: undefined,
    lat: undefined,
    lon: undefined,
  });
  const handleWhereChange = (val: WhereFilter) => {
    setWhereFilter(prev => ({
      ...prev,
      ...val,
      lat: val.lat !== undefined ? val.lat : prev.lat,
      lon: val.lon !== undefined ? val.lon : prev.lon,
    }));
  };

  // --- Quand ?
  const [whenFilter, setWhenFilter] = useState<string>("");

  // --- Quoi ?
  const [searchValue, setSearchValue] = useState<{
    keyword: string;
    category?: string;
    subcategory?: string;
    excludedSubcategories?: string[];
  }>({
    keyword: "",
    category: undefined,
    subcategory: undefined,
    excludedSubcategories: [],
  });
  const handleWhatChange = (val: { keyword: string; category?: string; subcategory?: string; excludedSubcategories?: string[] }) => {
    setSearchValue(val);
  };

  // --- Toutes les activités (état central)
  const [allResults, setAllResults] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Favoris utilisateur (synchro MongoDB)
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  // --- Auth (token & user)
  const { user, token } = useAuth();

  // --- Récupération des activités
  useEffect(() => {
    setIsLoading(true);
    getActivities()
      .then(data => {
        setAllResults(Array.isArray(data) ? data : []);
        // Debug : affiche le tableau des activités reçues
        console.log("DEBUG - ACTIVITES RECUES :", data);
      })
      .catch(() => {
        setErrorMsg("Erreur lors de la récupération des activités");
        setAllResults([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // --- Récupération des favoris utilisateur
  const fetchUserFavorites = useCallback(async () => {
    if (!token || !user) {
      setUserFavorites([]);
      return;
    }
    try {
      const favs = await getFavorites(token);
      setUserFavorites(Array.isArray(favs) ? favs : []);
    } catch {
      setUserFavorites([]);
    }
  }, [token, user]);

  useEffect(() => {
    fetchUserFavorites();
  }, [fetchUserFavorites]);

  // --- Toggle favori (add/remove + refresh)
  const handleToggleFavorite = useCallback(
    async (id: string | number, newFav: boolean) => {
      if (!token || !user) {
        alert("Merci de vous connecter pour gérer vos favoris.");
        return;
      }
      try {
        if (newFav) {
          await addFavorite(String(id), token);
        } else {
          await removeFavorite(String(id), token);
        }
        await fetchUserFavorites();
      } catch {
        alert("Erreur lors de la mise à jour du favori.");
      }
    },
    [token, user, fetchUserFavorites]
  );

  // --- Filtrage centralisé
  const filteredResults = React.useMemo(() => {
    const geoOk = (a: Activity) => {
      if (
        typeof whereFilter.distance === "number" &&
        typeof whereFilter.lat === "number" &&
        typeof whereFilter.lon === "number"
      ) {
        if (!a.lat || !a.lon) return false;
        const d = haversineDistance(whereFilter.lat, whereFilter.lon, a.lat, a.lon);
        return d <= whereFilter.distance;
      }
      return true;
    };

    const dateOk = (a: Activity) => {
      if (!whenFilter) return true;
      const act = parseWhen(a.when || "");
      if (!act) return false;

      // Intervalle
      if (whenFilter.includes("-")) {
        const filter = parseWhen(whenFilter);
        if (!filter) return true;
        return periodsOverlap(act.from, act.to, filter.from, filter.to);
      }

      // Date unique
      const filterDate = parseDate(whenFilter);
      if (!filterDate) return true;
      return act.from <= filterDate && filterDate <= act.to;
    };

    const isExcluded = (a: Activity) => {
      if (!Array.isArray(searchValue.excludedSubcategories)) return false;
      if (typeof a.subcategory !== "string") return false;
      return searchValue.excludedSubcategories.includes(a.subcategory);
    };

    const catOk = (a: Activity) => {
      if (!searchValue.category) return true;
      if (searchValue.subcategory) {
        return (
          a.category === searchValue.category &&
          a.subcategory === searchValue.subcategory &&
          !isExcluded(a)
        );
      }
      return a.category === searchValue.category && !isExcluded(a);
    };

    const keywordOk = (a: Activity) => {
      const kw = (searchValue.keyword || "").trim().toLowerCase();
      if (!kw) return true;
      const inTitle = (a.title || "").toLowerCase().includes(kw);
      const inDesc = (a.description || "").toLowerCase().includes(kw);
      return inTitle || inDesc;
    };

    return Array.isArray(allResults)
      ? allResults.filter(
          a =>
            geoOk(a) &&
            dateOk(a) &&
            !isExcluded(a) &&
            (searchValue.category ? catOk(a) && keywordOk(a) : keywordOk(a))
        )
      : [];
  }, [allResults, whereFilter, whenFilter, searchValue, haversineDistance]);

  // --- Routes
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                favoritesActive={favoritesActive}
                onToggleFavorites={handleToggleFavorites}
                onToggleFavorite={handleToggleFavorite}
                whereFilter={whereFilter}
                onWhereChange={handleWhereChange}
                whenFilter={whenFilter}
                onWhenChange={setWhenFilter}
                value={searchValue}
                onWhatChange={handleWhatChange}
                filteredResults={filteredResults}
                allOnlineActivities={allResults}
                userFavorites={userFavorites}
                isLoading={isLoading}
                errorMsg={errorMsg}
              />
            }
          />
          <Route path="/deposer" element={<DeposerActivite />} />
          <Route
            path="/activity/:id"
            element={
              <ActivityDetail
                onToggleFavorite={handleToggleFavorite}
                activities={allResults}
                userFavorites={userFavorites}
              />
            }
          />
          <Route path="/confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* === ROUTES AUTHENTIFICATION (FR + EN) === */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/inscription" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/mot-de-passe-oublie" element={<ResetPasswordPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          {/* === (Optionnel) Espace admin si protégé par route guard ailleurs === */}
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </main>
    </div>
  );
};

/**
 * App
 * - Enveloppe l'application avec AuthProvider et Router
 * - Monte CookieConsent de façon isolée via ClientOnly + ErrorBoundary
 */
export default function App() {
  const [geoActive, setGeoActive] = useState(false)
  const toggleGeo = () => setGeoActive(v => !v)

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <AdminFloatingButton />
        <GeoFloatingButton isActive={geoActive} onClick={toggleGeo} />
        <ClientOnly>
          <ErrorBoundary>
            <Suspense fallback={null}>
              <CookieConsent />
            </Suspense>
          </ErrorBoundary>
        </ClientOnly>
      </Router>
    </AuthProvider>
  );
}
