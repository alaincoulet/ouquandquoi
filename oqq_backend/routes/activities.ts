/**
 * oqq_backend/routes/activities.ts
 * Router Express pour les activités (oùquandquoi.fr)
 * - Route GET    /api/activities       : liste toutes les activités MongoDB
 * - Route GET    /api/activities/:id   : détail d'une activité MongoDB
 * - Route DELETE /api/activities/:id   : suppression d'une activité MongoDB
 */

import { Router } from "express";
import {
  getAllActivities,
  getActivityById,
  deleteActivity,    // ⬅️ Ajout import suppression
} from "../controllers/activityController";

const router = Router();

// Liste toutes les activités
router.get("/", getAllActivities);

// Détail d'une activité par ID
router.get("/:id", getActivityById);

// Suppression d'une activité par ID (admin ou créateur)
router.delete("/:id", deleteActivity);

export default router;
