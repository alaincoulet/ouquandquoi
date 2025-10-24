/**
 * oqq_backend/routes/activities.ts
 *
 * Routes Express pour la gestion des activités (oùquandquoi.fr)
 * - Utilise le contrôleur activityController
 * - Utilisé par server.ts (app.use("/api/activities", activityRoutes))
 */

import express from "express";
import { 
  getAllActivities, 
  getActivityById, 
  addActivity, 
  deleteActivity,
  testExpiration
} from "../controllers/activityController";
import { verifyToken } from "../middleware/verifyToken";
import { isAdvertiser } from "../middleware/isAdvertiser";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configuration Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "public/images/");
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-").toLowerCase());
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg" && ext !== ".gif" && ext !== ".webp") {
      return cb(new Error("Seules les images sont autorisées"));
    }
    cb(null, true);
  },
});

// ==========================================================
// === ROUTES PUBLIQUES =====================================
// ==========================================================
router.get("/", getAllActivities);                    // Liste des activités (avec filtre expired)
router.get("/test-expiration", testExpiration);       // TEST - Endpoint de debug
router.get("/:id", getActivityById);                  // Détail d'une activité

// ==========================================================
// === ROUTES PROTÉGÉES (ADVERTISER) ========================
// ==========================================================
router.post("/", verifyToken, isAdvertiser, upload.single("image"), addActivity);  // Créer une activité
router.delete("/:id", verifyToken, isAdvertiser, deleteActivity);                  // Supprimer une activité

export default router;
