/**
 * oqq_backend/middleware/isAdmin.ts
 *
 * Middleware Express pour vérifier que l'utilisateur est authentifié ET admin.
 * - Vérifie la présence et la validité du JWT
 * - Vérifie que le rôle est bien "admin"
 * - Bloque la route sinon (401 ou 403)
 * - Place le user décodé sur req.user (pour usage ultérieur)
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme!"; // À sécuriser en prod

export interface AuthRequest extends Request {
  user?: any; // On peut typer plus finement si besoin
}

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Non authentifié. Token manquant." });
  }

  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return res.status(401).json({ error: "Token invalide." });
  }

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès réservé à l’administrateur." });
  }

  // On place l'utilisateur décodé dans la requête pour la suite si besoin
  req.user = user;
  next();
}
