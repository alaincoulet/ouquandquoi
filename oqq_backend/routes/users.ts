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
  getRecentlyViewed,
  getSavedSearches,
  addSavedSearch,
  removeSavedSearch,
  getScheduledActivities,
  addScheduledActivity,
  updateScheduledActivity,
  removeScheduledActivity
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

// ==========================================================
// === SAVED SEARCHES =======================================
// ==========================================================

// Get user's saved searches
router.get("/saved-searches", verifyToken, getSavedSearches);

// Add a new saved search (max 3)
router.post("/saved-searches", verifyToken, addSavedSearch);

// Remove a saved search by index
router.delete("/saved-searches/:index", verifyToken, removeSavedSearch);

// ==========================================================
// === SCHEDULED ACTIVITIES (CALENDAR) ======================
// ==========================================================

// Get user's scheduled activities
router.get("/scheduled-activities", verifyToken, getScheduledActivities);

// Add a scheduled activity with reminders
router.post("/scheduled-activities", verifyToken, addScheduledActivity);

// Update a scheduled activity
router.patch("/scheduled-activities/:index", verifyToken, updateScheduledActivity);

// Remove a scheduled activity
router.delete("/scheduled-activities/:index", verifyToken, removeScheduledActivity);

export default router;
