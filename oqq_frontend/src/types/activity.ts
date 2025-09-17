// ==========================================================
// FICHIER : src/types/activity.ts
// Interface TypeScript unique pour une activité oùquandquoi.fr (full MongoDB natif)
// - Typage strict, conforme au schéma Mongoose (backend/models/Activity.ts)
// - À utiliser partout : import { Activity } from '@/types/activity'
// - Jamais de champ "id" (legacy) : SEUL "_id" (string, ObjectId MongoDB)
// ==========================================================

/**
 * Interface TypeScript pour une activité (conforme base MongoDB)
 * - Utilisé partout côté frontend pour affichage, favori, détail, etc.
 * - 100% synchronisé avec le backend natif Mongoose/MongoDB.
 */
export interface Activity {
  /** Identifiant natif MongoDB (obligatoire, format ObjectId sous forme string) */
  _id: string;
  /** Titre de l’activité (obligatoire) */
  title: string;
  /** Description détaillée (obligatoire) */
  description: string;
  /** Lieu/ville de l’activité (obligatoire) */
  location: string;
  /** Utilisateur créateur (stocké en clair : nom/pseudo/email ou userId, selon import) */
  user?: string;

  /** Chemin image relative serveur (ex : "/images/xxxx.jpg") */
  image?: string;
  /** Date de création en ISO (format Mongo, typée string côté front pour cohérence) */
  createdAt?: string;

  /** Catégorie principale (optionnelle) */
  category?: string;
  /** Sous-catégorie (optionnelle) */
  subcategory?: string;

  /** Site web externe de l’activité (optionnel) */
  website?: string;
  /** Autorisation explicite de contact (optionnelle) */
  contactAllowed?: boolean;
  /** Email de contact si autorisé (optionnel) */
  contactEmail?: string;

  /** Indicateur favori pour l’utilisateur connecté (rempli dynamiquement côté front) */
  isFavorite?: boolean;

  // === CHAMPS GÉOGRAPHIQUES (optionnels, pour recherche/filtres) ===
  /** Latitude (optionnelle) */
  lat?: number | null;
  /** Longitude (optionnelle) */
  lon?: number | null;

  // === CHAMP DE PÉRIODE / DATE (optionnel) ===
  /** Date unique ou période, format libre : "YYYY-MM-DD" ou "YYYY-MM-DD - YYYY-MM-DD" */
  when?: string;

  /** Version Mongo interne (jamais utilisée côté front, ignorée) */
  __v?: number;
}
