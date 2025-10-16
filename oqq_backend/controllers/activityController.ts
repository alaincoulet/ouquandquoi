/**
 * ==========================================================
 * FICHIER : oqq_backend/controllers/activityController.ts
 * ----------------------------------------------------------
 * Contrôleur principal des activités (oùquandquoi.fr)
 * - Gestion complète : lecture, création, suppression
 * - Compatible JWT + rôles (advertiser / moderator / admin)
 * - Support du téléversement d’images via Multer
 * ==========================================================
 */

import { Request, Response } from "express";
import { AuthRequest } from "../middleware/verifyToken";
import Activity, { IActivity } from "../models/Activity";

/* ==========================================================
   === ÉTAT (Interfaces, fonctions utilitaires, types) ======
   ========================================================== */

/**
 * Vérifie si une activité est expirée à partir de sa date
 */
function isExpiredActivity(activityDate?: Date): boolean {
  if (!activityDate) return false;
  const endPlusOne = new Date(activityDate);
  endPlusOne.setDate(endPlusOne.getDate() + 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= endPlusOne;
}

/**
 * Interface étendue pour inclure les fichiers Multer
 */
interface UploadRequest extends AuthRequest {
  file?: Express.Multer.File;
}

/* ==========================================================
   === COMPORTEMENT (Logique métier, accès DB) ==============
   ========================================================== */

/**
 * Récupère la liste de toutes les activités
 */
export async function getAllActivities(req: Request, res: Response) {
  try {
    const expiredParam = req.query.expired;
    const activities: IActivity[] = await Activity.find()
      .populate("user", "firstName lastName pseudo")
      .sort({ createdAt: -1 });

    // Filtrage selon expiration
    const filtered = activities.filter((a: IActivity) =>
      expiredParam === "true"
        ? isExpiredActivity(a.date)
        : !isExpiredActivity(a.date)
    );

    res.json({ activities: filtered });
  } catch (err) {
    console.error("Erreur getAllActivities:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des activités." });
  }
}

/**
 * Récupère une activité par son identifiant
 */
export async function getActivityById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24)
      return res.status(400).json({ error: "Identifiant invalide." });

    const activity = await Activity.findById(id).populate(
      "user",
      "firstName lastName pseudo"
    );
    if (!activity)
      return res.status(404).json({ error: "Activité non trouvée." });

    res.json({ activity });
  } catch (err) {
    console.error("Erreur getActivityById:", err);
    res.status(500).json({ error: "Erreur lors de la récupération de l'activité." });
  }
}

/**
 * Supprime une activité (vérification des droits en amont via middleware)
 */
export async function deleteActivity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24)
      return res.status(400).json({ error: "Identifiant invalide." });

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
 * Crée une nouvelle activité (liée à l’utilisateur connecté)
 */
export async function addActivity(req: UploadRequest, res: Response) {
  try {
    if (!req.user?.id)
      return res.status(401).json({ error: "Utilisateur non authentifié." });

    // Construction de l’URL d’image
    let imageUrl: string | undefined;
    if (req.file) imageUrl = `/images/${req.file.filename}`;
    else if (req.body.image) imageUrl = req.body.image;

    // Données du corps de requête
    let data = req.body;
    if (typeof req.body.data === "string") data = JSON.parse(req.body.data);

    // Création du document MongoDB
    const activity = new Activity({
      ...data,
      imageUrl,
      user: req.user.id,
    });

    await activity.save();
    const populated = await activity.populate("user", "firstName lastName pseudo");

    res.status(201).json({ activity: populated });
  } catch (err) {
    console.error("Erreur addActivity:", err);
    res.status(500).json({ error: "Erreur lors de la création de l'activité." });
  }
}

/* ==========================================================
   === AFFICHAGE (réponses, statut HTTP, payload JSON) ======
   ========================================================== */
/**
 * Tous les retours JSON sont structurés sous la forme :
 * { activity: {...} } ou { activities: [...] } ou { error: "..." }
 *
 * Les codes HTTP suivent la norme :
 * - 200 : succès
 * - 201 : création réussie
 * - 400 : requête invalide
 * - 401 : authentification manquante/invalide
 * - 404 : ressource non trouvée
 * - 500 : erreur interne serveur
 */
