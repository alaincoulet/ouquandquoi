/**
 * oqq_backend/routes/activities.ts
 * Router Express pour les activités (oùquandquoi.fr)
 * - Route GET /api/activities : liste toutes les activités MongoDB
 * - Route GET /api/activities/:id : détail d'une activité MongoDB
 */

import { Router } from "express";
import { getAllActivities, getActivityById } from "../controllers/activityController";

const router = Router();

// Liste toutes les activités
router.get("/", getAllActivities);

// Détail d'une activité par ID
router.get("/:id", getActivityById);

export default router;
