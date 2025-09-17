/**
 * oqq_backend/routes/users.ts
 *
 * Router Express pour la gestion des utilisateurs (oùquandquoi.fr)
 * ...
 */

import { Router } from "express";
import {
  registerUser,
  loginUser,
  getFavorites,
  addFavorite,
  removeFavorite,
  forgotPassword,
  resetPassword,
  updateProfile,
  deleteMe,
  // === Ajouts admin-only ===
  getPendingUsers,
  validateUser
} from "../controllers/userController";
import { isAdmin } from "../middleware/isAdmin"; // Ajout middleware
import { addRecentlyViewed, getRecentlyViewed } from "../controllers/userController";

const router = Router();

// === Authentification & gestion utilisateur ===

// Inscription utilisateur
router.post("/register", registerUser);

// Connexion utilisateur (JWT)
router.post("/login", loginUser);

// Liste des favoris utilisateur (GET)
router.get("/favorites", getFavorites);

// Ajout d'une activité aux favoris (PATCH)
router.patch("/favorites/:activityId", addFavorite);

// Suppression d'une activité des favoris (DELETE)
router.delete("/favorites/:activityId", removeFavorite);

// Mise à jour du profil utilisateur (pseudo, nom, prénom, mdp)
router.patch("/profile", updateProfile);

// === Reset password (sécurisé) ===

// Demande de reset password (envoi email)
router.post("/forgot-password", forgotPassword);

// Réinitialisation du mot de passe via token
router.post("/reset-password", resetPassword);

// === Suppression du compte utilisateur ===

// Suppression définitive (authentification JWT requise)
router.delete("/me", deleteMe);

// === ADMIN ONLY : validation utilisateurs en attente ===

// Liste tous les users "pending"
router.get("/pending", isAdmin, getPendingUsers);

// Validation d'un user "pending" (passe en "user")
router.patch("/validate/:userId", isAdmin, validateUser);

// === Consulté récemment (consultation d'activité) ===

// Ajoute une activité à la liste "consulté récemment"
router.patch("/recently-viewed/:activityId", addRecentlyViewed);

// Liste les activités consultées récemment (10 max, plus récente à gauche)
router.get("/recently-viewed", getRecentlyViewed);

export default router;
