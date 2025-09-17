// ===============================================
// FICHIER : src/types/search.ts
// Type partagé pour la recherche multi-critères (full Mongo natif)
// Projet : oùquandquoi.fr
// - Harmonisé avec le typage front/back Mongo (_id, category, subcategory, keyword, etc.)
// ===============================================

/**
 * Interface pour les paramètres de recherche multi-critères
 * - Tous les champs sont optionnels sauf “lieu” et “rayonKm” (si recherche géo)
 * - Utilisée pour générer la requête API REST vers le backend Mongo
 * - Noms homogènes avec le reste du projet (anglais)
// - RGPD : aucune donnée nominative transmise, seulement critère de recherche
 */
export interface SearchParams {
  /** Lieu : nom de ville ou code postal (input utilisateur, string) */
  lieu: string;

  /** Rayon de recherche en kilomètres (obligatoire si lieu rempli) */
  rayonKm: number;

  /** Date unique (ISO, ex : "2025-09-12") */
  dateUnique?: string;

  /** Début de période (ISO, ex : "2025-09-12") */
  dateDebut?: string;

  /** Fin de période (ISO, ex : "2025-09-16") */
  dateFin?: string;

  /** Identifiant de catégorie (slug, _id, ou nom, selon l’implémentation backend) */
  category?: string;

  /** Identifiant de sous-catégorie (slug, _id, ou nom, selon l’implémentation backend) */
  subcategory?: string;

  /** Recherche libre (mot-clé) */
  keyword?: string;
}

/**
 * Interface "Où ?" centralisée pour le front
 * - Remplace l'ancienne définition locale dans src/App.tsx
 * - À utiliser partout : import { WhereFilter } from '@/types/search'
 */
export interface WhereFilter {
  label: string;
  location?: string;
  distance?: number;
  lat?: number;
  lon?: number;
}
