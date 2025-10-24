/**
 * oqq_backend/routes/users.ts
 *
 * Express router for user management (oùquandquoi.fr)
 * - Authentication, registration, profile updates
 * - Password recovery (secure)
 * - Favorites and recently viewed activities
 * - Admin/Moderator: validation of pending users
 * - Admin: suspend/reactivate/delete users, all-users listing
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
  removeScheduledActivity,
  updateUserStatus,
  deleteUserByAdmin,
  getAllUsers             // ✅ Ajout pour lister tous les users (admin)
} from "../controllers/userController";

import { verifyToken } from "../middleware/verifyToken";
import { isAdminOrModerator, isAdmin } from "../middleware/isAdmin";

const router = Router();

// ==========================================================
// === AUTHENTICATION & USER MANAGEMENT =====================
// ==========================================================

router.post("/register", registerUser);
router.post("/login", loginUser);

// ==========================================================
// === FAVORITES ============================================
// ==========================================================

router.get("/favorites", verifyToken, getFavorites);
router.patch("/favorites/:activityId", verifyToken, addFavorite);
router.delete("/favorites/:activityId", verifyToken, removeFavorite);

// ==========================================================
// === PROFILE MANAGEMENT ===================================
// ==========================================================

router.patch("/profile", verifyToken, updateProfile);
router.delete("/me", verifyToken, deleteMe);

// ==========================================================
// === PASSWORD RESET (SECURE) ==============================
// ==========================================================

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ==========================================================
// === ADMIN / MODERATOR ACCESS =============================
// ==========================================================

router.get("/pending", verifyToken, isAdminOrModerator, getPendingUsers);
router.patch("/validate/:userId", verifyToken, isAdminOrModerator, validateUser);

// --- NOUVELLES ROUTES ADMIN ---
router.patch("/:userId/status", verifyToken, isAdmin, updateUserStatus);     // Suspend/re-activate
router.delete("/:userId", verifyToken, isAdmin, deleteUserByAdmin);          // Delete (admin only)
router.get("/admin/all-users", verifyToken, isAdmin, getAllUsers);           // ✅ Liste tous les users (admin only)

// ==========================================================
// === RECENTLY VIEWED ACTIVITIES ===========================
// ==========================================================

router.patch("/recently-viewed/:activityId", verifyToken, addRecentlyViewed);
router.get("/recently-viewed", verifyToken, getRecentlyViewed);

// ==========================================================
// === SAVED SEARCHES =======================================
// ==========================================================

router.get("/saved-searches", verifyToken, getSavedSearches);
router.post("/saved-searches", verifyToken, addSavedSearch);
router.delete("/saved-searches/:index", verifyToken, removeSavedSearch);

// ==========================================================
// === SCHEDULED ACTIVITIES (CALENDAR) ======================
// ==========================================================

router.get("/scheduled-activities", verifyToken, getScheduledActivities);
router.post("/scheduled-activities", verifyToken, addScheduledActivity);
router.patch("/scheduled-activities/:index", verifyToken, updateScheduledActivity);
router.delete("/scheduled-activities/:index", verifyToken, removeScheduledActivity);

export default router;
