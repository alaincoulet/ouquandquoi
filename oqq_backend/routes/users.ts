/**
 * oqq_backend/routes/users.ts
 *
 * Express router for user management (oùquandquoi.fr)
 * - Authentication, registration, profile updates
 * - Password recovery (secure)
 * - Favorites and recently viewed activities
 * - Admin/Moderator: validation of pending users
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
  getPendingUsers,
  validateUser,
  addRecentlyViewed,
  getRecentlyViewed
} from "../controllers/userController";

import { verifyToken } from "../middleware/verifyToken";
import { isAdminOrModerator } from "../middleware/isAdmin";

const router = Router();

// ==========================================================
// === AUTHENTICATION & USER MANAGEMENT =====================
// ==========================================================

// Register new user
router.post("/register", registerUser);

// Login user (returns JWT)
router.post("/login", loginUser);

// ==========================================================
// === FAVORITES ============================================
// ==========================================================

// Get user's favorites (JWT required)
router.get("/favorites", verifyToken, getFavorites);

// Add an activity to favorites
router.patch("/favorites/:activityId", verifyToken, addFavorite);

// Remove an activity from favorites
router.delete("/favorites/:activityId", verifyToken, removeFavorite);

// ==========================================================
// === PROFILE MANAGEMENT ===================================
// ==========================================================

// Update user profile (pseudo, name, password, etc.)
router.patch("/profile", verifyToken, updateProfile);

// Delete user account (self-delete)
router.delete("/me", verifyToken, deleteMe);

// ==========================================================
// === PASSWORD RESET (SECURE) ==============================
// ==========================================================

// Request password reset (send email)
router.post("/forgot-password", forgotPassword);

// Reset password using token
router.post("/reset-password", resetPassword);

// ==========================================================
// === ADMIN / MODERATOR ACCESS =============================
// ==========================================================

// List all users with status "pending"
router.get("/pending", verifyToken, isAdminOrModerator, getPendingUsers);

// Validate a pending user (change role to "user" or "advertiser")
router.patch("/validate/:userId", verifyToken, isAdminOrModerator, validateUser);

// ==========================================================
// === RECENTLY VIEWED ACTIVITIES ===========================
// ==========================================================

// Add an activity to the user's recently viewed list
router.patch("/recently-viewed/:activityId", verifyToken, addRecentlyViewed);

// Get the 10 most recently viewed activities
router.get("/recently-viewed", verifyToken, getRecentlyViewed);

export default router;
