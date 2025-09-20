// ==========================================================
// FICHIER : oqq_backend/controllers/activityController.ts
// Contrôleur principal pour les activités (oùquandquoi.fr)
// - Récupération filtrée des activités selon expiration (champ "when")
// - Paramètre ?expired=true pour affichage admin des activités expirées
// - Suppression d'une activité (DELETE)
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
  return new Date(year, month - 1, day);
}

/**
 * Fonction utilitaire : détermine si une activité est expirée
 * - Expirée si la date du jour (à minuit) > date de fin (date+1j)
 * - Ajoute un LOG détaillé pour debug (affiche chaque activité évaluée)
 */
function isExpiredActivity(when?: string, id?: string): boolean {
  const endDate = extractEndDate(when);
  if (!endDate) {
    console.warn(`⛔ [Expiration] _id="${id}" | Champ when illisible :`, when);
    return false;
  }
  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expired = today >= endDatePlusOne;
  console.log(
    `[Expiration] _id="${id}" | when="${when}" | endDate=${endDate.toISOString()} | today=${today.toISOString()} | expired=${expired}`
  );
  return expired;
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
      filteredActivities = activities.filter(act =>
        isExpiredActivity(act.when, act._id?.toString())
      );
    } else {
      // Mode visiteur/utilisateur : que les non-expirées
      filteredActivities = activities.filter(act =>
        !isExpiredActivity(act.when, act._id?.toString())
      );
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

/**
 * Supprime une activité par son _id Mongo natif
 * DELETE /api/activities/:id
 * Retourne : { message: "Activité supprimée." }
 */
export async function deleteActivity(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: "ID d'activité invalide." });
    }
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ error: "Activité non trouvée." });
    }
    await Activity.findByIdAndDelete(id);
    res.json({ message: "Activité supprimée." });
  } catch (err) {
    console.error("Erreur deleteActivity:", err);
    res.status(500).json({ error: "Erreur lors de la suppression de l'activité." });
  }
}

/**
 * Crée une nouvelle activité (POST /api/activities)
 * - Attend un FormData (clé "data" pour l'objet, "image" pour le fichier éventuel)
 * - Retourne { activity }
 */
export async function addActivity(req: Request, res: Response) {
  try {
    let imageUrl;
    if (req.file) {
      imageUrl = `/images/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }
    let data = req.body;
    if (typeof req.body.data === "string") {
      data = JSON.parse(req.body.data);
    }
    const activity = new Activity({
      ...data,
      image: imageUrl,
    });
    await activity.save();
    res.status(201).json({ activity });
  } catch (err) {
    console.error("Erreur addActivity:", err);
    res.status(500).json({ error: "Erreur lors de la création de l'activité." });
  }
}

// ==========================================================
// Convention : clé de haut niveau ("activity", "activities" ou "message")
// Jamais exposer d'info sensible ni __v, ni password, etc.
// ==========================================================
