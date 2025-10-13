/**
 * oqq_backend/routes/activities.ts
 * Router Express pour les activités (oùquandquoi.fr)
 */

import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getAllActivities,
  getActivityById,
  deleteActivity,
  addActivity,
} from "../controllers/activityController";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

// === Multer config locale ===
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/images");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const clean = file.originalname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    cb(null, `${Date.now()}-${clean}`);
  },
});
const upload = multer({ storage: imageStorage });

// === Routes ===
router.get("/", getAllActivities);
router.get("/:id", getActivityById);
router.post("/", verifyToken, upload.single("image"), addActivity);  // ✅ protégé
router.delete("/:id", deleteActivity);

export default router;
