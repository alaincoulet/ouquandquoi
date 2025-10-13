// ==========================================================
// FICHIER : oqq_backend/controllers/activityController.ts
// Contrôleur principal pour les activités (oùquandquoi.fr)
// ==========================================================

import { Request, Response } from "express";
import { AuthRequest } from "../middleware/verifyToken";
import Activity, { IActivity } from "../models/Activity";

/**
 * Fonction utilitaire : extrait la date de fin d’une activité ("when" string)
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
 * Détermine si une activité est expirée
 */
function isExpiredActivity(when?: string, id?: string): boolean {
  const endDate = extractEndDate(when);
  if (!endDate) return false;
  const endPlusOne = new Date(endDate);
  endPlusOne.setDate(endPlusOne.getDate() + 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= endPlusOne;
}

/**
 * Liste toutes les activités (avec ou sans expirées)
 */
export async function getAllActivities(req: Request, res: Response) {
  try {
    const expiredParam = req.query.expired;
    const activities: IActivity[] = await Activity.find()
      .populate("user", "prenom nom pseudo")
      .sort({ createdAt: -1 });

    // ✅ Typage explicite => plus d’erreur _id unknown
    const filtered = activities.filter((a: IActivity) => {
      const idStr = a._id ? a._id.toString() : "";
      return expiredParam === "true"
        ? isExpiredActivity(a.when, idStr)
        : !isExpiredActivity(a.when, idStr);
    });

    res.json({ activities: filtered });
  } catch (err) {
    console.error("Erreur getAllActivities:", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des activités." });
  }
}

/**
 * Récupère une activité par ID
 */
export async function getActivityById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24)
      return res.status(400).json({ error: "ID invalide." });

    const activity = await Activity.findById(id).populate(
      "user",
      "prenom nom pseudo"
    );
    if (!activity)
      return res.status(404).json({ error: "Activité non trouvée." });
    res.json({ activity });
  } catch (err) {
    console.error("Erreur getActivityById:", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de l'activité." });
  }
}

/**
 * Supprime une activité
 */
export async function deleteActivity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24)
      return res.status(400).json({ error: "ID invalide." });

    const activity = await Activity.findByIdAndDelete(id);
    if (!activity)
      return res.status(404).json({ error: "Activité non trouvée." });

    res.json({ message: "Activité supprimée." });
  } catch (err) {
    console.error("Erreur deleteActivity:", err);
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
}

/**
 * Crée une nouvelle activité
 */
export async function addActivity(req: AuthRequest, res: Response) {
  try {
    if (!req.user?._id)
      return res.status(401).json({ error: "Utilisateur non authentifié." });

    let imageUrl: string | undefined;
    if (req.file) imageUrl = `/images/${req.file.filename}`;
    else if (req.body.image) imageUrl = req.body.image;

    let data = req.body;
    if (typeof req.body.data === "string") data = JSON.parse(req.body.data);

    const activity = new Activity({
      ...data,
      image: imageUrl,
      user: req.user._id,
    });

    await activity.save();
    const populated = await activity.populate("user", "prenom nom pseudo");

    res.status(201).json({ activity: populated });
  } catch (err) {
    console.error("Erreur addActivity:", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la création de l'activité." });
  }
}
