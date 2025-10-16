/**
 * oqq_backend/controllers/userController.ts
 *
 * Contrôleur principal utilisateurs (oùquandquoi.fr)
 * - Inscription (register)
 * - Connexion (login)
 * - Gestion favoris (add/remove, get)
 * - Reset password sécurisé (token/email)
 * - Mise à jour profil (pseudo/nom/prénom/mot de passe)
 * - Suppression de compte sécurisée
 * - Toutes les réponses excluent le mot de passe
 * - Prend en compte "motivation" pour validation admin
 */

import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/email";

const JWT_SECRET = process.env.JWT_SECRET || "changeme!";

/* ==========================================================
   === INSCRIPTION / CONNEXION ==============================
   ========================================================== */

/**
 * Inscription utilisateur (register)
 */
export async function registerUser(req: Request, res: Response) {
  try {
    const { email, password, pseudo, nom, prenom, motivation } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe obligatoires." });
    if (!nom || !prenom)
      return res.status(400).json({ message: "Nom et prénom obligatoires." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Cet email est déjà utilisé." });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: passwordHash,
      pseudo,
      nom,
      prenom,
      role: "pending",
      motivation: motivation?.trim() || undefined,
    });

    await user.save();

    const safeUser = user.toObject();
    delete (safeUser as any).password;

    res.status(201).json({
      message: "Utilisateur créé avec succès (en attente de validation).",
      user: safeUser,
    });
  } catch (err) {
    console.error("Erreur registerUser:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
}

/**
 * Connexion utilisateur (login)
 */
export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email et mot de passe requis." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Utilisateur non trouvé." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Mot de passe invalide." });

    // Comptes non validés
    if (["pending", "guest"].includes(user.role)) {
      return res.status(403).json({
        error: "Votre compte est en attente de validation par un administrateur.",
      });
    }

    const userPayload = {
      _id: user._id,
      email: user.email,
      pseudo: user.pseudo,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: userPayload });
  } catch (err) {
    console.error("Erreur loginUser:", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
}

/* ==========================================================
   === FAVORIS ==============================================
   ========================================================== */

export async function getFavorites(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json({ favorites: user.favoris.map((id) => id.toString()) });
  } catch (err) {
    console.error("Erreur getFavorites:", err);
    res.status(500).json({ error: "Erreur serveur favoris (lecture)" });
  }
}

export async function addFavorite(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const activityId = req.params.activityId;
    if (!mongoose.Types.ObjectId.isValid(activityId))
      return res.status(400).json({ error: "activityId invalide" });

    if (!user.favoris.map((id) => id.toString()).includes(activityId)) {
      user.favoris.push(new mongoose.Types.ObjectId(activityId));
      await user.save();
    }

    res.json({ success: true, favoris: user.favoris.map((id) => id.toString()) });
  } catch (err) {
    console.error("Erreur addFavorite:", err);
    res.status(500).json({ error: "Erreur serveur favoris (ajout)" });
  }
}

export async function removeFavorite(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const activityId = req.params.activityId;
    if (!mongoose.Types.ObjectId.isValid(activityId))
      return res.status(400).json({ error: "activityId invalide" });

    user.favoris = user.favoris.filter(
      (favId) => favId.toString() !== activityId
    );
    await user.save();

    res.json({ success: true, favoris: user.favoris.map((id) => id.toString()) });
  } catch (err) {
    console.error("Erreur removeFavorite:", err);
    res.status(500).json({ error: "Erreur serveur favoris (suppression)" });
  }
}

/* ==========================================================
   === RESET / MOT DE PASSE ================================
   ========================================================== */

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({ message: "Si ce compte existe, un email a été envoyé." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = await bcrypt.hash(token, 10);
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    await sendResetPasswordEmail(user.email, token);
    // En environnement local/dev, renvoyer aussi le token pour faciliter les tests
    const payload: any = { message: "Email de réinitialisation envoyé." };
    if (process.env.NODE_ENV !== "production") {
      payload.devToken = token;
    }
    res.status(200).json(payload);
  } catch (err) {
    console.error("Erreur forgotPassword:", err);
    res.status(500).json({ message: "Erreur lors de la demande de réinitialisation." });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword)
      return res.status(400).json({ message: "Paramètres manquants." });

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires)
      return res.status(400).json({ message: "Lien invalide ou expiré." });

    const isValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValid || user.resetPasswordExpires < new Date())
      return res.status(400).json({ message: "Lien invalide ou expiré." });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    console.error("Erreur resetPassword:", err);
    res.status(500).json({ message: "Erreur lors de la réinitialisation." });
  }
}

/* ==========================================================
   === PROFIL / VALIDATION / SUPPRESSION ===================
   ========================================================== */

export async function updateProfile(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);
    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    const { pseudo, nom, prenom, oldPassword, newPassword } = req.body;
    if (pseudo && pseudo !== user.pseudo) {
      const existing = await User.findOne({ pseudo });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(409).json({ error: "Ce pseudo est déjà utilisé." });
      }
      user.pseudo = pseudo;
    }

    if (nom) user.nom = nom.trim();
    if (prenom) user.prenom = prenom.trim();

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch)
        return res.status(401).json({ error: "Ancien mot de passe incorrect." });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const safe = user.toObject();
    delete (safe as any).password;
    res.json({ message: "Profil mis à jour.", user: safe });
  } catch (err) {
    console.error("Erreur updateProfile:", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
  }
}

/**
 * Liste tous les utilisateurs "pending"
 */
export async function getPendingUsers(req: Request, res: Response) {
  try {
    const pendingUsers = await User.find({ role: "pending" })
      .select("email pseudo nom prenom motivation createdAt")
      .sort({ createdAt: 1 });

    res.json({ users: pendingUsers });
  } catch (err) {
    console.error("Erreur getPendingUsers:", err);
    res.status(500).json({ message: "Erreur serveur (listing users pending)" });
  }
}

/**
 * Validation d’un utilisateur en attente
 */
export async function validateUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { structureType } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "ID utilisateur invalide" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (user.role !== "pending")
      return res.status(400).json({ message: "Utilisateur déjà validé." });

    user.role =
      structureType && ["entreprise", "association", "mairie"].includes(structureType)
        ? "advertiser"
        : "user";

    await user.save();

    res.json({
      message: `Utilisateur validé en tant que ${user.role}.`,
      user: {
        _id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        pseudo: user.pseudo,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Erreur validateUser:", err);
    res.status(500).json({ message: "Erreur serveur (validation utilisateur)" });
  }
}

/**
 * Suppression définitive du compte utilisateur
 */
export async function deleteMe(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    await User.findByIdAndDelete(decoded._id);
    res.json({ message: "Compte supprimé définitivement." });
  } catch (err) {
    console.error("Erreur deleteMe:", err);
    res.status(500).json({ error: "Erreur lors de la suppression du compte." });
  }
}

/* ==========================================================
   === CONSULTÉ RÉCEMMENT ==================================
   ========================================================== */

export async function addRecentlyViewed(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);
    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    const activityId = req.params.activityId;
    if (!mongoose.Types.ObjectId.isValid(activityId))
      return res.status(400).json({ error: "activityId invalide" });

    user.recentlyViewed = [
      new mongoose.Types.ObjectId(activityId),
      ...user.recentlyViewed.filter((id) => id.toString() !== activityId),
    ].slice(0, 10);

    await user.save();
    res.json({ success: true, recentlyViewed: user.recentlyViewed.map((id) => id.toString()) });
  } catch (err) {
    console.error("Erreur addRecentlyViewed:", err);
    res.status(500).json({ error: "Erreur serveur (ajout consulté récemment)" });
  }
}

export async function getRecentlyViewed(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id).populate("recentlyViewed");

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json({ recentlyViewed: user.recentlyViewed });
  } catch (err) {
    console.error("Erreur getRecentlyViewed:", err);
    res.status(500).json({ error: "Erreur serveur (lecture consulté récemment)" });
  }
}
