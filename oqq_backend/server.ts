/**
 * oqq_backend/server.ts
 *
 * Serveur Express principal pour oùquandquoi.fr (API backend)
 * - Sert l'API REST pour les utilisateurs (via MongoDB et userController)
 * - Sert les images statiques (public/images)
 * - Gère les activités via MongoDB natif (fini le JSON local)
 * - Gère la réinitialisation de mot de passe sécurisée (token + expiration)
 * - Toutes les routes /api/users et /api/activities sont 100% ObjectId natif Mongo côté favoris
 */

import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";

// === Routes principales ===
import userRoutes from "./routes/users";
import activityRoutes from "./routes/activities";
// import passwordRoutes from "./routes/passwords"; // Anciennes routes reset (doublon)

// === Sécurité / Hashing ===
import bcrypt from "bcryptjs"; // utilisé pour le hash dans le reset password
import crypto from "crypto";   // utilisé pour générer des tokens sécurisés

// === Configuration Express ===
const app = express();
const PORT = 4000;

// ==========================================================
// === CONNEXION À MONGODB ATLAS OU LOCALE ==================
// ==========================================================
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost/oqq_local";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("Erreur MongoDB :", err));

// ==========================================================
// === MIDDLEWARES GLOBAUX ==================================
// ==========================================================
app.use(cors());
app.use(express.json());

// Sert les images statiques depuis /images/
app.use("/images", express.static("/app/public/images"));

// ==========================================================
// === ROUTES API PRINCIPALES ===============================
// ==========================================================
app.use("/api/users", userRoutes);        // Gestion utilisateurs
app.use("/api/activities", activityRoutes); // Gestion activités
// Les routes de reset sont désormais gérées sous /api/users (forgot-password, reset-password)
// app.use("/api/passwords", passwordRoutes);

// ==========================================================
// === MULTER : UPLOAD D'IMAGES POUR LES ACTIVITÉS =========
// ==========================================================
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

// Exemple d’upload direct (désactivé pour le moment)
// app.post("/api/activities", upload.single("image"), (req, res) => { ... });

// ==========================================================
// === ENDPOINT SANTÉ POUR MONITORING =======================
// ==========================================================
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", mongo: mongoose.connection.readyState });
});

// ==========================================================
// === LANCEMENT DU SERVEUR ================================
// ==========================================================
app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});
