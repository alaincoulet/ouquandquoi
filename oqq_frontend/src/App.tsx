/**
 * src/App.tsx
 * Point d'entrée principal de l'application oùquandquoi.fr
 */

import React, { useEffect, useState, Suspense, ReactNode, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";

// Auth et Layout
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useGeolocation } from "@/context/GeolocationContext";

// RGPD
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
import RoleChangePage from "@/pages/Auth/RoleChangePage";

// API & Types
import { getActivities, addFavorite, removeFavorite, getFavorites } from "@/config/api";
import { Activity } from "@/types/activity";

// Utils
import { haversineDistance } from "@/utils/geolocationFallback";
import { parseDate, parseWhen, periodsOverlap } from "@/utils/date";

// Boutons
import AdminFloatingButton from '@/components/atoms/AdminFloatingButton';
import GeoFloatingButton from '@/components/atoms/GeoFloatingButton';




// Legales
import CGU from "@/pages/Legales/CGU";
import MentionsLegales from "@/pages/Legales/MentionsLegales";

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

const ClientOnly: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
};

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

const AppRoutes: React.FC = () => {
  const [favoritesActive, setFavoritesActive] = useState(false);
  const handleToggleFavorites = () => setFavoritesActive(prev => !prev);

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

  const [whenFilter, setWhenFilter] = useState<string>("");

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

  const handleWhatChange = (val: {
    keyword: string;
    category?: string;
    subcategory?: string;
    excludedSubcategories?: string[];
  }) => {
    setSearchValue(val);
  };

  const [allResults, setAllResults] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  const { user, token } = useAuth();

  // ⬇️ CHARGEMENT ACTIVITÉS
  useEffect(() => {
    setIsLoading(true);
    getActivities()
      .then(data => {
        setAllResults(Array.isArray(data) ? data : []);
        console.log("DEBUG - ACTIVITES RECUES :", data);
      })
      .catch(() => {
        setErrorMsg("Erreur lors de la récupération des activités");
        setAllResults([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ⬇️ FAVORIS UTILISATEUR
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

  // ⬇️ FILTRAGE
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

      if (whenFilter.includes("-")) {
        const filter = parseWhen(whenFilter);
        if (!filter) return true;
        return periodsOverlap(act.from, act.to, filter.from, filter.to);
      }

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
  }, [allResults, whereFilter, whenFilter, searchValue]);

  // ⬇️ 🔁 Redirection vers Home après action dans Header
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state;
    if (state?.redirectTriggered) {
      if (state.where) handleWhereChange(state.where);
      if (state.when) setWhenFilter(state.when);
      if (state.what) handleWhatChange(state.what);
      if (state.favoritesActive !== undefined) setFavoritesActive(state.favoritesActive);
      if (state.toggleFavorite && state.activityId && state.newFav !== undefined) {
        handleToggleFavorite(state.activityId, state.newFav);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ⬇️ ROUTING
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
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/inscription" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/mot-de-passe-oublie" element={<ResetPasswordPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/changer-de-role" element={<RoleChangePage />} />

          {/* === (Optionnel) Espace admin si protégé par route guard ailleurs === */}
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </main>
    </div>
  );
};

/**
 * Composant wrapper pour le bouton de géolocalisation
 * Utilise le GeolocationContext pour gérer l'état
 */
const GeoButtonWrapper: React.FC = () => {
  const { active, requestGeolocation, clearGeolocation } = useGeolocation();

  const handleToggle = () => {
    if (active) {
      clearGeolocation();
    } else {
      requestGeolocation();
    }
  };

  return <GeoFloatingButton isActive={active} onClick={handleToggle} />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <AdminFloatingButton />
        <GeoButtonWrapper />
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
