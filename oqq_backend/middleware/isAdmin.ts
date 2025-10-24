/**
 * oqq_backend/middleware/isAdmin.ts
 *
 * Express middleware for admin/moderator role protection.
 * - isAdminOrModerator: autorise admin OU modérateur
 * - isAdmin: autorise uniquement admin
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme!"; // À sécuriser en production

export interface AuthRequest extends Request {
  user?: any; // Peut être typé plus strictement avec IUser si besoin
}

/**
 * Middleware : autorise admin OU modérateur
 */
export function isAdminOrModerator(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Not authenticated. Token missing." });
  }

  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return res.status(403).json({ error: "Access restricted to administrators and moderators." });
  }

  req.user = user;
  next();
}

/**
 * Middleware : autorise uniquement admin
 */
export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Not authenticated. Token missing." });
  }

  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Access restricted to administrators only." });
  }

  req.user = user;
  next();
}
