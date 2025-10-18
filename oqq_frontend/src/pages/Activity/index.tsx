// ==========================================================
// FICHIER : src/pages/Activity/index.tsx
// Page de détail d’une activité (oùquandquoi.fr)
// - Affiche une activité MongoDB (_id unique) + gestion favori, édition, suppression
// - Ajoute le carrousel "Pour vous..." en bas de page selon logique métier
//   1. Activités même subcategory < 100km
//   2. Activités même category (hors subcategory déjà affichée) < 100km
//   3. Autres activités < 100km
//   (hors activité en cours, max 20, aucune duplication)
// ==========================================================

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Layout from '@/components/layout/Layout';
import { useParams, useNavigate } from "react-router-dom";
import { Activity } from '@/types/activity';
import { useAuth } from "@/context/AuthContext";
import ProductCard from '@/components/molecules/ProductCard';
import Carousel from '@/components/ui/Carousel';
import { haversineDistance } from '@/utils/geolocationFallback';
import { ShareIcon } from '@heroicons/react/24/outline';
import { detectEmailProvider, openEmailClient, type EmailClientType } from '@/utils/emailClientHelper';

interface ActivityDetailProps {
  activities: Activity[];
  onToggleFavorite: (_id: string, newFav: boolean) => Promise<void> | void;
  userFavorites: string[];
}

const ActivityDetail: React.FC<ActivityDetailProps> = ({ activities, onToggleFavorite, userFavorites }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // État favori local optimiste
  
  const [favLocal, setFavLocal] = useState(false);

  // Carrousel "Pour vous..."
  const [suggested, setSuggested] = useState<Activity[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { token, isAuthenticated } = useAuth();

  // Layout : valeurs fictives (non utilisées ici)
  const dummyWhere = { label: '', location: '', distance: undefined, lat: undefined, lon: undefined };
  const dummyOnWhereChange = () => {};
  const dummyWhen = '';
  const dummyOnWhenChange = () => {};
  const dummyValue = { keyword: '', category: undefined, subcategory: undefined, excludedSubcategories: [] };
  const dummyOnWhatChange = () => {};

  // Recherche activité dans liste MongoDB
  const activity = useMemo(() => activities.find((a) => a._id === id), [activities, id]);

  // Synchronise favLocal avec favoris globaux (userFavorites)
  useEffect(() => {
    if (id && userFavorites) {
      setFavLocal(userFavorites.includes(id));
    }
  }, [id, userFavorites]);

  // Ajout consulté récemment (chaque vue)
  useEffect(() => {
    if (activity && token && isAuthenticated) {
      import("@/services/user").then(({ addRecentlyViewed }) => {
        addRecentlyViewed(activity._id, token);
      });
    }
  }, [activity, token, isAuthenticated]);

  // Suggestions "Pour vous..."
  useEffect(() => {
    setLoadingSuggestions(true);
    if (!activity) {
      setSuggested([]);
      setLoadingSuggestions(false);
      return;
    }
    const excludeId = activity._id;
    const refLat = activity.lat;
    const refLon = activity.lon;

    // Filtre <100km hors activité en cours
    const others = activities.filter(a =>
      a._id !== excludeId &&
      typeof a.lat === "number" &&
      typeof a.lon === "number" &&
      typeof refLat === "number" &&
      typeof refLon === "number" &&
      haversineDistance(refLat, refLon, a.lat!, a.lon!) <= 100
    );
    // 1. Même subcategory
    const group1 = others.filter(
      a => a.subcategory && activity.subcategory && a.subcategory === activity.subcategory
    );
    // 2. Même category, hors subcategory déjà prise
    const group1Ids = new Set(group1.map(a => a._id));
    const group2 = others.filter(
      a =>
        a.category &&
        activity.category &&
        a.category === activity.category &&
        (!activity.subcategory || a.subcategory !== activity.subcategory) &&
        !group1Ids.has(a._id)
    );
    // 3. Les autres
    const group2Ids = new Set([...group1Ids, ...group2.map(a => a._id)]);
    const group3 = others.filter(
      a => !group2Ids.has(a._id)
    );
    // Final
    const finalSuggested = [...group1, ...group2, ...group3].slice(0, 20);
    setSuggested(finalSuggested);
    setLoadingSuggestions(false);
  }, [activity, activities]);

  // Handler favori aligné ProductCard
  const handleToggleFavorite = useCallback(async () => {
    if (!activity) return;
    const newFav = !favLocal;
    setFavLocal(newFav); // optimistic UI
    try {
      await onToggleFavorite(activity._id, newFav);
    } catch {
      setFavLocal(!newFav); // rollback si échec
    }
  }, [activity, favLocal, onToggleFavorite]);

  // Suppression de l’activité
  const handleDelete = async () => {
    if (!activity) return;
    if (!window.confirm("Confirmer la suppression de cette activité ? Cette action est irréversible.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/activities/${activity._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Activité supprimée avec succès.");
        navigate("/");
      } else {
        alert("Échec de la suppression.");
      }
    } catch (err) {
      alert("Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  // Partage par email avec détection automatique du webmail
  const handleShare = () => {
    if (!activity) return;
    
    const currentUrl = window.location.href;
    const subject = "Découvrez cette activité sur oùquandquoi.fr";
    const body = `Salut mon ami,\n\nRegarde cette activité que je viens de découvrir sur ouquandquoi.fr, tu irais avec moi ?\n\n${activity.title}\n${currentUrl}\n\nÀ bientôt !`;
    
    // Déterminer le client email à utiliser
    let clientType: EmailClientType = 'default';
    
    // 1. Si l'utilisateur est connecté et a une préférence
    if (isAuthenticated && token) {
      const userEmail = (window as any).__userEmail; // Stocké lors de la connexion
      const userPreference = (window as any).__userEmailPreference;
      
      if (userPreference && userPreference !== 'default') {
        clientType = userPreference;
      } else if (userEmail) {
        // 2. Sinon, détecter automatiquement depuis l'email
        clientType = detectEmailProvider(userEmail);
      }
    }
    
    // Ouvrir le client email approprié
    openEmailClient(clientType, subject, body);
  };

  if (!activity) return <div className="p-8 text-red-500">Aucune activité trouvée pour l’ID : {id}</div>;

  return (
    <Layout
      where={dummyWhere}
      onWhereChange={dummyOnWhereChange}
      when={dummyWhen}
      onWhenChange={dummyOnWhenChange}
      value={dummyValue}
      onWhatChange={dummyOnWhatChange}
      showMap={showMap}
      onToggleMap={() => setShowMap(!showMap)}
    >
      <div className="max-w-6xl w-full mx-auto p-8">
        {/* Bouton retour */}
        <button
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => window.history.back()}
        >
          ← Retour
        </button>

        {/* --- TITRE + CŒUR FAVORI --- */}
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-3xl font-bold">{activity.title}</h1>
          <button
            onClick={handleToggleFavorite}
            className="ml-2 rounded-full p-1 bg-white shadow hover:bg-yellow-100 focus:outline-none focus:ring focus:ring-yellow-300 transition"
            aria-label={favLocal ? "Retirer des favoris" : "Ajouter aux favoris"}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-7 h-7 ${favLocal ? "text-yellow-400" : "text-gray-400"} transition`}
              fill={favLocal ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke={favLocal ? "currentColor" : "#a1a1aa"}
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21C12 21 4 13.888 4 8.941A4.941 4.941 0 019 4a5.024 5.024 0 013 1.05A5.024 5.024 0 0115 4a4.941 4.941 0 015 4.941C20 13.888 12 21 12 21z"
                fill={favLocal ? "currentColor" : "none"}
              />
            </svg>
          </button>
        </div>

        {/* Catégorie / sous-catégorie */}
        {(activity.category || activity.subcategory) && (
          <div className="mb-3 text-green-800 font-semibold flex items-center gap-2">
            {activity.category && (
              <span className="inline-block px-2 py-1 rounded bg-green-100 border border-green-200">
                {activity.category}
              </span>
            )}
            {activity.subcategory && (
              <span className="inline-block px-2 py-1 rounded bg-green-50 border border-green-100">
                {activity.subcategory}
              </span>
            )}
          </div>
        )}

        {/* Image principale */}
        <div className="flex justify-center w-full mb-4">
          <img
            src={
              activity.image
                ? `${import.meta.env.VITE_API_URL || "http://localhost:4000"}${activity.image}`
                : "/placeholder.png"
            }
            alt={activity.title}
            className="rounded shadow border w-full max-w-2xl h-auto object-contain bg-white"
            style={{
              display: 'block',
              margin: '0 auto',
              background: '#fff',
            }}
            onError={(e: any) => { e.target.src = "/placeholder.png"; }}
          />
        </div>

        {/* Description */}
        <p className="text-lg mb-2">{activity.description}</p>

        {/* --- BOUTONS ACTIONS --- */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate(`/deposer?edit=${activity._id}`)}
          >
            Modifier
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>

        {/* --- PARTAGE PAR EMAIL --- */}
        <div className="mb-6">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
          >
            <ShareIcon className="w-5 h-5" />
            <span>Partager cette activité avec vos amis</span>
          </button>
        </div>

        {/* Localisation */}
        <div className="mb-2 text-gray-600">
          <span className="font-semibold">Lieu :</span> {activity.location}
        </div>
        {/* Utilisateur */}
        {activity.user && (
          <div className="mb-2 text-gray-600">
            <span className="font-semibold">Publié par :</span> {activity.user}
          </div>
        )}
        {/* Date de création */}
        {activity.createdAt && (
          <div className="text-gray-500 text-sm">
            Ajouté le : {new Date(activity.createdAt).toLocaleString("fr-FR")}
          </div>
        )}

        {/* Site web annonceur */}
        {activity.website && (
          <div className="mt-8 border-t pt-4">
            <div className="font-semibold text-[15px] mb-1">Site web annonceur</div>
            <a
              href={activity.website.startsWith("http") ? activity.website : `https://${activity.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline break-all hover:text-green-900"
            >
              {activity.website}
            </a>
          </div>
        )}

        {/* E-mail contact si autorisé ET renseigné */}
        {activity.contactAllowed && activity.contactEmail && (
          <div className="mt-4">
            <div className="font-semibold text-[15px] mb-1">Contact annonceur</div>
            <a
              href={`mailto:${activity.contactEmail}`}
              className="text-blue-800 underline hover:text-blue-900 break-all"
            >
              {activity.contactEmail}
            </a>
          </div>
        )}

        {/* --- Carrousel "Pour vous…" --- */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-black flex items-center mb-4">
            Pour vous…
            <span className="text-lg font-normal text-gray-500 ml-2">
              ({suggested.length} {suggested.length > 1 ? "activités" : "activité"})
            </span>
          </h3>
          {loadingSuggestions ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
                <span className="text-gray-600">Chargement…</span>
              </div>
            </div>
          ) : suggested.length > 0 ? (
            <Carousel>
              {suggested.map((act) => (
                <ProductCard
                  key={act._id}
                  product={act}
                  onToggleFavorite={onToggleFavorite}
                  modeCarousel
                />
              ))}
            </Carousel>
          ) : (
            <div className="text-center py-12 text-gray-600 text-lg">
              Aucune suggestion trouvée
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ActivityDetail;
