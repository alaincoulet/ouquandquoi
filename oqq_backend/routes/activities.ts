/**
 * oqq_backend/routes/activities.ts
 * Router Express pour les activités (oùquandquoi.fr)
 * - Route GET    /api/activities       : liste toutes les activités MongoDB
 * - Route GET    /api/activities/:id   : détail d'une activité MongoDB
 * - Route POST   /api/activities       : création d'une activité (NOUVEAU)
 * - Route DELETE /api/activities/:id   : suppression d'une activité MongoDB
 */

import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getAllActivities,
  getActivityById,
  deleteActivity,
  addActivity, // Ajout : création activité
} from "../controllers/activityController";

const router = Router();

// === Multer config locale (pour upload image) ===
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/images");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const original = file.originalname;
    const clean = original
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    const unique = Date.now() + "-" + clean;
    cb(null, unique);
  },
});
const upload = multer({ storage: imageStorage });

// === ROUTES ACTIVITÉS ===
router.get("/", getAllActivities);
router.get("/:id", getActivityById);
// ROUTE NOUVELLE : création (POST)
router.post("/", upload.single("image"), addActivity);
router.delete("/:id", deleteActivity);

export default router;
