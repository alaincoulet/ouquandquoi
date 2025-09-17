// ==========================================================
// FICHIER : src/services/user.ts
// Service API utilisateur oùquandquoi.fr (fonctions consulté récemment)
// - Ajout dans "recentlyViewed" (PATCH)
// - Lecture de la liste "recentlyViewed" (GET, retourne Activity[])
// - Nécessite un token JWT valide
// ==========================================================

import { Activity } from "@/types/activity";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Ajoute une activité à la liste "Consulté récemment" de l'utilisateur connecté.
 * @param activityId _id natif MongoDB de l'activité
 * @param token JWT utilisateur
 */
export async function addRecentlyViewed(activityId: string, token: string): Promise<void> {
  try {
    await fetch(`${API_URL}/api/users/recently-viewed/${activityId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    // Fail silently : UX, ne pas bloquer la page si erreur côté tracking
    if (import.meta.env.MODE === "development") {
      console.warn("[user.ts] Erreur addRecentlyViewed", err);
    }
  }
}

/**
 * Récupère la liste ordonnée des activités consultées récemment (10 max)
 * @param token JWT utilisateur
 * @returns Liste d'activités (Activity[]), plus récente d'abord
 */
export async function getRecentlyViewed(token: string): Promise<Activity[]> {
  try {
    const res = await fetch(`${API_URL}/api/users/recently-viewed`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    // backend : { recentlyViewed: Activity[] }
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (import.meta.env.MODE === "development") {
      console.warn("[user.ts] Erreur getRecentlyViewed", err);
    }
    return [];
  }
}
