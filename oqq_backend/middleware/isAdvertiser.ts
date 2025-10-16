/**
 * oqq_backend/middleware/isAdvertiser.ts
 *
 * Express middleware to verify advertiser access rights.
 * - Only verified advertisers can create, edit, or delete their own activities.
 * - Admins and moderators automatically bypass this restriction.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Activity from "../models/Activity"; // Assuming Activity model exists
import { AuthRequest } from "./verifyToken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme!"; // Secure in production

export async function isAdvertiser(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user;

  // --- Step 1: Must be authenticated ---
  if (!user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  // --- Step 2: Allow admins and moderators to bypass ---
  if (user.role === "admin" || user.role === "moderator") {
    return next();
  }

  // --- Step 3: Check advertiser role ---
  if (user.role !== "advertiser") {
    return res.status(403).json({ error: "Access restricted to advertisers only." });
  }

  // --- Step 4: If editing or deleting, verify ownership ---
  const method = req.method.toUpperCase();
  if (["PUT", "PATCH", "DELETE"].includes(method)) {
    try {
      const activityId = req.params.id;
      if (!activityId) {
        return res.status(400).json({ error: "Missing activity ID." });
      }

      const activity = await Activity.findById(activityId);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found." });
      }

      // Only the owner can modify or delete
      if (activity.user.toString() !== user.id.toString()) {
        return res.status(403).json({ error: "You can only manage your own activities." });
      }
    } catch (err) {
      return res.status(500).json({ error: "Error verifying activity ownership." });
    }
  }

  // --- Step 5: Authorized ---
  next();
}
