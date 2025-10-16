/**
 * oqq_backend/routes/activities.ts
 *
 * Routes Express pour la gestion des activités (oùquandquoi.fr)
 * - CRUD complet via Mongoose
 * - Relié au modèle Activity
 * - Utilisé par server.ts (app.use("/api/activities", activityRoutes))
 */

import express, { Request, Response } from "express";
import Activity from "../models/Activity";

const router = express.Router();

// ==========================================================
// === RÉCUPÉRER TOUTES LES ACTIVITÉS =======================
// ==========================================================
router.get("/", async (_req: Request, res: Response) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du chargement des activités", error: err });
  }
});

// ==========================================================
// === RÉCUPÉRER UNE ACTIVITÉ PAR ID ========================
// ==========================================================
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activité non trouvée" });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du chargement de l’activité", error: err });
  }
});

// ==========================================================
// === AJOUTER UNE NOUVELLE ACTIVITÉ ========================
// ==========================================================
router.post("/", async (req: Request, res: Response) => {
  try {
    const newActivity = new Activity(req.body);
    const savedActivity = await newActivity.save();
    res.status(201).json(savedActivity);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la création de l’activité", error: err });
  }
});

// ==========================================================
// === METTRE À JOUR UNE ACTIVITÉ EXISTANTE =================
// ==========================================================
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updated = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Activité non trouvée" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la mise à jour", error: err });
  }
});

// ==========================================================
// === SUPPRIMER UNE ACTIVITÉ ===============================
// ==========================================================
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await Activity.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Activité non trouvée" });
    res.json({ message: "Activité supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression", error: err });
  }
});

export default router;
