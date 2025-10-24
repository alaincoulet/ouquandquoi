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
 * - Validation admin : suspension, réactivation, suppression admin
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
    if (user.role === "pending") {
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

    const { pseudo, nom, prenom, oldPassword, newPassword, preferredEmailClient } = req.body;
    if (pseudo && pseudo !== user.pseudo) {
      const existing = await User.findOne({ pseudo });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(409).json({ error: "Ce pseudo est déjà utilisé." });
      }
      user.pseudo = pseudo;
    }

    if (nom) user.nom = nom.trim();
    if (prenom) user.prenom = prenom.trim();
    if (preferredEmailClient) {
      if (['gmail', 'outlook', 'yahoo', 'default'].includes(preferredEmailClient)) {
        user.preferredEmailClient = preferredEmailClient;
      }
    }

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
   === SUSPENSION / RÉACTIVATION / SUPPRESSION ADMIN ========
   ========================================================== */

/**
 * Suspension ou réactivation d’un compte utilisateur (admin)
 * PATCH /api/users/:userId/status
 * Body: { status: "active" | "suspended" }
 */
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "ID utilisateur invalide." });
    if (!["active", "suspended"].includes(status))
      return res.status(400).json({ message: "Statut invalide." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    user.status = status;
    await user.save();

    res.json({ message: `Statut utilisateur mis à jour: ${status}` });
  } catch (err) {
    console.error("Erreur updateUserStatus:", err);
    res.status(500).json({ message: "Erreur serveur (update status)" });
  }
}

/**
 * Suppression définitive d’un utilisateur par un admin
 * DELETE /api/users/:userId
 */
export async function deleteUserByAdmin(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "ID utilisateur invalide." });

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    res.json({ message: "Utilisateur supprimé définitivement." });
  } catch (err) {
    console.error("Erreur deleteUserByAdmin:", err);
    res.status(500).json({ message: "Erreur serveur (suppression utilisateur)" });
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

/* ==========================================================
   === ACTIVITÉS PROGRAMMÉES (CALENDRIER) ==================
   ========================================================== */

/**
 * Récupère les activités programmées de l'utilisateur
 */
export async function getScheduledActivities(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id).populate("scheduledActivities.activityId");

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json({ scheduledActivities: user.scheduledActivities });
  } catch (err) {
    console.error("Erreur getScheduledActivities:", err);
    res.status(500).json({ error: "Erreur serveur (lecture activités programmées)" });
  }
}

/**
 * Ajoute une activité programmée avec rappels
 */
export async function addScheduledActivity(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    const { activityId, scheduledDate, reminders, notes } = req.body;

    if (!activityId || !scheduledDate)
      return res.status(400).json({ error: "activityId et scheduledDate requis" });

    if (!mongoose.Types.ObjectId.isValid(activityId))
      return res.status(400).json({ error: "activityId invalide" });

    // Vérifier que l'activité est dans les favoris
    if (!user.favoris.map(id => id.toString()).includes(activityId)) {
      return res.status(400).json({ 
        error: "Cette activité doit d'abord être ajoutée à vos favoris" 
      });
    }

    // Vérifier si l'activité n'est pas déjà programmée
    const alreadyScheduled = user.scheduledActivities.some(
      sa => sa.activityId.toString() === activityId
    );

    if (alreadyScheduled) {
      return res.status(400).json({ 
        error: "Cette activité est déjà programmée dans votre calendrier" 
      });
    }

    user.scheduledActivities.push({
      activityId: new mongoose.Types.ObjectId(activityId),
      scheduledDate: new Date(scheduledDate),
      reminders: reminders || [],
      notes: notes || "",
      createdAt: new Date(),
    });

    await user.save();
    res.json({ 
      success: true, 
      scheduledActivities: user.scheduledActivities,
      message: "Activité programmée avec succès" 
    });
  } catch (err) {
    console.error("Erreur addScheduledActivity:", err);
    res.status(500).json({ error: "Erreur serveur (ajout activité programmée)" });
  }
}

/**
 * Met à jour une activité programmée
 */
export async function updateScheduledActivity(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    const { index } = req.params;
    const scheduledIndex = parseInt(index, 10);

    if (isNaN(scheduledIndex) || scheduledIndex < 0 || scheduledIndex >= user.scheduledActivities.length) {
      return res.status(400).json({ error: "Index invalide" });
    }

    const { scheduledDate, reminders, notes } = req.body;

    if (scheduledDate) {
      user.scheduledActivities[scheduledIndex].scheduledDate = new Date(scheduledDate);
    }
    if (reminders !== undefined) {
      user.scheduledActivities[scheduledIndex].reminders = reminders;
    }
    if (notes !== undefined) {
      user.scheduledActivities[scheduledIndex].notes = notes;
    }

    await user.save();
    res.json({ 
      success: true, 
      scheduledActivities: user.scheduledActivities,
      message: "Activité mise à jour avec succès" 
    });
  } catch (err) {
    console.error("Erreur updateScheduledActivity:", err);
    res.status(500).json({ error: "Erreur serveur (mise à jour activité programmée)" });
  }
}

/**
 * Supprime une activité programmée par son index
 */
export async function removeScheduledActivity(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    const { index } = req.params;
    const scheduledIndex = parseInt(index, 10);

    if (isNaN(scheduledIndex) || scheduledIndex < 0 || scheduledIndex >= user.scheduledActivities.length) {
      return res.status(400).json({ error: "Index invalide" });
    }

    user.scheduledActivities.splice(scheduledIndex, 1);
    await user.save();

    res.json({ 
      success: true, 
      scheduledActivities: user.scheduledActivities,
      message: "Activité retirée du calendrier avec succès" 
    });
  } catch (err) {
    console.error("Erreur removeScheduledActivity:", err);
    res.status(500).json({ error: "Erreur serveur (suppression activité programmée)" });
  }
}

/* ==========================================================
   === RECHERCHES SAUVEGARDÉES =============================
   ========================================================== */

/**
 * Génère automatiquement le nom d'une recherche à partir des filtres
 */
function generateSearchName(filters: any): string {
  const parts: string[] = [];
  
  if (filters.where?.location) {
    parts.push(filters.where.location);
  }
  
  if (filters.when && filters.when !== "Toute l'année") {
    parts.push(filters.when);
  }
  
  if (filters.what?.keyword) {
    parts.push(filters.what.keyword);
  } else if (filters.what?.category) {
    parts.push(filters.what.category);
  }
  
  return parts.length > 0 ? parts.join(" • ") : "Recherche sans critère";
}

/**
 * Récupère les recherches sauvegardées de l'utilisateur
 */
export async function getSavedSearches(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json({ savedSearches: user.savedSearches });
  } catch (err) {
    console.error("Erreur getSavedSearches:", err);
    res.status(500).json({ error: "Erreur serveur (lecture recherches sauvegardées)" });
  }
}

/**
 * Ajoute une nouvelle recherche sauvegardée (max 3)
 */
export async function addSavedSearch(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    const { filters } = req.body;
    if (!filters)
      return res.status(400).json({ error: "Filtres manquants" });

    // Limite à 3 recherches sauvegardées
    if (user.savedSearches.length >= 3) {
      return res.status(400).json({ 
        error: "Vous avez atteint la limite de 3 recherches sauvegardées. Veuillez en supprimer une avant d'en ajouter une nouvelle." 
      });
    }

    const searchName = generateSearchName(filters);
    
    user.savedSearches.push({
      name: searchName,
      filters,
      createdAt: new Date(),
    });

    await user.save();
    res.json({ 
      success: true, 
      savedSearches: user.savedSearches,
      message: "Recherche sauvegardée avec succès" 
    });
  } catch (err) {
    console.error("Erreur addSavedSearch:", err);
    res.status(500).json({ error: "Erreur serveur (ajout recherche sauvegardée)" });
  }
}

/**
 * Supprime une recherche sauvegardée par son index
 */
export async function removeSavedSearch(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Non authentifié" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded._id);

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    const { index } = req.params;
    const searchIndex = parseInt(index, 10);

    if (isNaN(searchIndex) || searchIndex < 0 || searchIndex >= user.savedSearches.length) {
      return res.status(400).json({ error: "Index invalide" });
    }

    user.savedSearches.splice(searchIndex, 1);
    await user.save();

    res.json({ 
      success: true, 
      savedSearches: user.savedSearches,
      message: "Recherche supprimée avec succès" 
    });
  } catch (err) {
    console.error("Erreur removeSavedSearch:", err);
    res.status(500).json({ error: "Erreur serveur (suppression recherche sauvegardée)" });
  }
}

/**
 * Récupère la liste de tous les utilisateurs (admin only)
 * GET /api/admin/all-users
 */
export async function getAllUsers(req: Request, res: Response) {
  try {
    // Sélection stricte pour sécurité RGPD (évite mot de passe etc.)
    const users = await User.find({})
      .select("email pseudo nom prenom motivation createdAt role status")
      .sort({ createdAt: 1 });
    res.json({ users });
  } catch (err) {
    console.error("Erreur getAllUsers:", err);
    res.status(500).json({ message: "Erreur serveur (listing all users)" });
  }
}

