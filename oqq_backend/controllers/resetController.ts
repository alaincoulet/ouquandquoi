/**
 * oqq_backend/controllers/resetController.ts
 *
 * Contrôleur Express pour la réinitialisation de mot de passe.
 * - /request : génère un token de réinitialisation et l’envoie à l’utilisateur.
 * - /reset : vérifie le token, met à jour le mot de passe et invalide le token.
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/User";

// ==========================================================
// === ÉTAPE 1 : DEMANDE DE RÉINITIALISATION (email) ========
// ==========================================================
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    // Génère un token aléatoire
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 3600000; // 1 heure

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(expiry);
    await user.save();

    // En dev, on renvoie directement le token
    res.status(200).json({
      message: "Lien de réinitialisation généré (valide 1h).",
      resetToken: token,
    });
  } catch (err) {
    console.error("Erreur reset password (request):", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ==========================================================
// === ÉTAPE 2 : RÉINITIALISATION DU MOT DE PASSE ============
// ==========================================================
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "Token et nouveau mot de passe requis." });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Token invalide ou expiré." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    console.error("Erreur reset password (apply):", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
