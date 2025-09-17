// ==========================================================
// FICHIER : oqq_backend/controllers/activityController.ts
// Contrôleur principal pour les activités (oùquandquoi.fr)
// - Récupération filtrée des activités selon expiration (champ "when")
// - Paramètre ?expired=true pour affichage admin des activités expirées
// - Compatible frontend existant (clé "activities" attendue)
// ==========================================================

import { Request, Response } from "express";
import Activity from "../models/Activity";

/**
 * Fonction utilitaire : extrait la date de fin d’une activité ("when" string)
 * - Gère les formats : "JJ/MM/AAAA" ou "JJ/MM/AAAA - JJ/MM/AAAA"
 * - Retourne un objet Date JS correspondant à la date de fin (ou undefined si parsing impossible)
 */
function extractEndDate(when?: string): Date | undefined {
  if (!when) return undefined;
  const regex = /^(\d{2}\/\d{2}\/\d{4})(\s*-\s*(\d{2}\/\d{2}\/\d{4}))?$/;
  const match = when.match(regex);
  if (!match) return undefined;
  const endDateStr = match[3] || match[1];
  const [day, month, year] = endDateStr.split("/").map(Number);
  // Correction mois (0-indexé)
  return new Date(year, month - 1, day);
}

/**
 * Fonction utilitaire : détermine si une activité est expirée
 * - Expirée si la date du jour (à minuit) > date de fin (date+1j)
 * - Typée sur string | undefined (robuste, aucun avertissement TS)
 */
function isExpiredActivity(when?: string): boolean {
  const endDate = extractEndDate(when);
  if (!endDate) return false; // Pas de date = jamais expirée
  // Date +1j (expirée dès lendemain)
  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

  // On compare à la date du jour (heure 0:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today >= endDatePlusOne;
}

/**
 * Liste toutes les activités (MongoDB natif) avec filtrage expiration
 * GET /api/activities?expired=false|true
 * - Par défaut (ou expired=false) : uniquement les activités non expirées (visiteur, utilisateur)
 * - expired=true : uniquement les activités expirées (admin)
 * Retourne : { activities: Activity[] }
 */
export async function getAllActivities(req: Request, res: Response) {
  try {
    const expiredParam = req.query.expired;
    const activities = await Activity.find().sort({ createdAt: -1 });

    let filteredActivities;
    if (expiredParam === "true") {
      // Mode admin : ne retourner QUE les expirées
      filteredActivities = activities.filter(act => isExpiredActivity(act.when));
    } else {
      // Mode visiteur/utilisateur (expired absent ou "false") : que les non-expirées
      filteredActivities = activities.filter(act => !isExpiredActivity(act.when));
    }

    res.json({ activities: filteredActivities });
  } catch (err) {
    console.error("Erreur getAllActivities:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des activités." });
  }
}

/**
 * Récupère une activité par son _id Mongo natif (sans filtrage expiration)
 * GET /api/activities/:id
 * Retourne : { activity: Activity }
 */
export async function getActivityById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    // Vérifie que l'ID a bien 24 caractères (ObjectId MongoDB)
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: "ID d'activité invalide." });
    }
    const activity = await Activity.findById(id);
    if (!activity) return res.status(404).json({ error: "Activité non trouvée." });
    res.json({ activity });
  } catch (err) {
    console.error("Erreur getActivityById:", err);
    res.status(500).json({ error: "Erreur lors de la récupération de l'activité." });
  }
}

// ==========================================================
// Prêt pour extension : création, édition, suppression, upload images
// Pour tout ajout de route, toujours respecter la convention :
// - Retourner une clé de haut niveau ("activity" ou "activities")
// - Ne jamais exposer d'info sensible ni __v, ni password, etc.
// ==========================================================
