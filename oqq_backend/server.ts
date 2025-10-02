/**
 * oqq_backend/server.ts
 *
 * Serveur Express principal pour oùquandquoi.fr (API backend)
 * - Sert l'API REST pour les utilisateurs (via MongoDB et userController)
 * - Sert les images statiques (public/images)
 * - Gère les activités uniquement via MongoDB natif (fini le JSON local)
 * - Toutes les routes /api/users et /api/activities sont 100% ObjectId natif Mongo côté favoris
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/users";
import activityRoutes from "./routes/activities"; // Nouvelle route Mongo natif

const app = express();
const PORT = 4000;

// ===== Connexion MongoDB Atlas ou locale =====
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost/oqq_local";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("Erreur MongoDB :", err));
// =============================================

// --- Middlewares globaux ---
app.use(cors());
app.use(express.json());

// Sert les images statiques depuis /images/
app.use("/images", express.static(path.join(__dirname, "public/images")));

// === ROUTES UTILISATEURS (MongoDB natif, favoris via _id) ===
app.use("/api/users", userRoutes);

// === ROUTES ACTIVITÉS (MongoDB natif) ===
app.use("/api/activities", activityRoutes);

// === MULTER : gestion des images pour les activités ===
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "public/images");
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
const upload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return (cb as any)(new Error("Seuls les fichiers image sont autorisés !"), false);
    }
    cb(null, true);
  },
});

// ====== EXEMPLE POUR GÉRER LE POST IMAGE EN MONGO (si besoin plus tard) ======
// (À activer plus tard : ici, tu passes par activityRoutes pour CRUD MongoDB)
// app.post("/api/activities", upload.single("image"), (req, res) => { ... })

// === ENDPOINT SANTÉ (optionnel, pour vérifier Mongo) ===
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mongo: mongoose.connection.readyState });
});

// ==== Lancement serveur ====
app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});
