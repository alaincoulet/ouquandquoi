// src/pages/Auth/ProfilePage.tsx
/**
 * Page profil utilisateur (oùquandquoi.fr)
 * - Affiche/modifie pseudo, nom, prénom, mot de passe
 * - Bouton de déconnexion
 * - Bouton "Supprimer mon compte" avec confirmation sécurisée (plus de question secrète)
 * - ⚠️ Fix UI : le conteneur parent est positionné en `relative` et la croix a un `z-10`
 */

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGeolocation } from "@/context/GeolocationContext";

export default function ProfilePage() {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();

  // --- Suppression de compte (sans question secrète)
  const [showDelete, setShowDelete] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [accountDeleted, setAccountDeleted] = useState(false);

  // --- États édition pseudo, nom, prénom
  const [editPseudo, setEditPseudo] = useState(false);
  const [pseudo, setPseudo] = useState(user?.pseudo ?? "");
  const [pseudoStatus, setPseudoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pseudoError, setPseudoError] = useState<string | null>(null);

  const [editNom, setEditNom] = useState(false);
  const [nom, setNom] = useState(user?.nom ?? "");
  const [nomStatus, setNomStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [nomError, setNomError] = useState<string | null>(null);

  const [editPrenom, setEditPrenom] = useState(false);
  const [prenom, setPrenom] = useState(user?.prenom ?? "");
  const [prenomStatus, setPrenomStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [prenomError, setPrenomError] = useState<string | null>(null);

  // --- États édition mot de passe
  const [editPassword, setEditPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Vous devez être connecté pour voir votre profil.</p>
      </div>
    );
  }

  // PATCH profil API — Pseudo
  const handleSavePseudo = async () => {
    setPseudoStatus("loading");
    setPseudoError(null);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pseudo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPseudoStatus("error");
        setPseudoError(data?.error || "Erreur lors de la modification du pseudo.");
        return;
      }
      setPseudoStatus("success");
      login(token!, { ...user, pseudo });
      setEditPseudo(false);
    } catch (err) {
      setPseudoStatus("error");
      setPseudoError("Erreur réseau ou serveur.");
    }
  };

  // PATCH profil API — Nom
  const handleSaveNom = async () => {
    setNomStatus("loading");
    setNomError(null);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNomStatus("error");
        setNomError(data?.error || "Erreur lors de la modification du nom.");
        return;
      }
      setNomStatus("success");
      login(token!, { ...user, nom });
      setEditNom(false);
    } catch (err) {
      setNomStatus("error");
      setNomError("Erreur réseau ou serveur.");
    }
  };

  // PATCH profil API — Prénom
  const handleSavePrenom = async () => {
    setPrenomStatus("loading");
    setPrenomError(null);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prenom }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPrenomStatus("error");
        setPrenomError(data?.error || "Erreur lors de la modification du prénom.");
        return;
      }
      setPrenomStatus("success");
      login(token!, { ...user, prenom });
      setEditPrenom(false);
    } catch (err) {
      setPrenomStatus("error");
      setPrenomError("Erreur réseau ou serveur.");
    }
  };

  // PATCH profil API — Mot de passe
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus("loading");
    setPasswordError(null);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordStatus("error");
        setPasswordError(data?.error || "Erreur lors du changement de mot de passe.");
        return;
      }
      setPasswordStatus("success");
      setEditPassword(false);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordStatus("error");
      setPasswordError("Erreur réseau ou serveur.");
    }
  };

  // Suppression du compte utilisateur : simple confirmation (plus de question secrète)
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteStatus("loading");
    setDeleteError(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteStatus("error");
        setDeleteError(data?.error || "Erreur lors de la suppression du compte.");
        return;
      }
      setDeleteStatus("success");
      setShowDelete(false);
      setAccountDeleted(true);
      setTimeout(() => {
        logout();
      }, 2500);
    } catch (err) {
      setDeleteStatus("error");
      setDeleteError("Erreur réseau ou serveur.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* parent positionné pour l'absolu de la croix */}
      <div className="relative max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        {/* === CROIX FERMETURE en haut à droite === */}
        <button
          className="absolute top-3 right-3 z-10 text-gray-400 hover:text-red-500 text-2xl font-bold p-1 rounded-full transition"
          onClick={() => navigate("/")}
          title="Fermer le profil"
          aria-label="Fermer le profil"
          type="button"
        >
          &times;
        </button>
        <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
        <div className="space-y-4 mb-6">

          {/* Email */}
          <div>
            <strong>Email :</strong> {user.email}
          </div>

          {/* Pseudo (édition inline) */}
          <div>
            <strong>Pseudo :</strong>{" "}
            {!editPseudo ? (
              <>
                {user.pseudo}
                <button
                  className="ml-2 text-blue-600 text-xs underline"
                  onClick={() => {
                    setEditPseudo(true);
                    setPseudo(user.pseudo ?? "");
                    setPseudoStatus("idle");
                    setPseudoError(null);
                  }}
                >
                  Modifier
                </button>
                {pseudoStatus === "success" && (
                  <span className="ml-2 text-green-600 text-xs">Modifié !</span>
                )}
                {pseudoStatus === "error" && (
                  <span className="ml-2 text-red-600 text-xs">{pseudoError}</span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-2">
                <input
                  className="border rounded p-1 text-sm"
                  value={pseudo}
                  onChange={e => setPseudo(e.target.value)}
                  autoFocus
                  maxLength={32}
                />
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  onClick={handleSavePseudo}
                  disabled={pseudoStatus === "loading"}
                >
                  Sauvegarder
                </button>
                <button
                  className="text-gray-500 text-xs underline"
                  onClick={() => setEditPseudo(false)}
                  type="button"
                >
                  Annuler
                </button>
              </span>
            )}
          </div>

          {/* Nom (édition inline) */}
          <div>
            <strong>Nom :</strong>{" "}
            {!editNom ? (
              <>
                {user.nom}
                <button
                  className="ml-2 text-blue-600 text-xs underline"
                  onClick={() => {
                    setEditNom(true);
                    setNom(user.nom ?? "");
                    setNomStatus("idle");
                    setNomError(null);
                  }}
                >
                  Modifier
                </button>
                {nomStatus === "success" && (
                  <span className="ml-2 text-green-600 text-xs">Modifié !</span>
                )}
                {nomStatus === "error" && (
                  <span className="ml-2 text-red-600 text-xs">{nomError}</span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-2">
                <input
                  className="border rounded p-1 text-sm"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  autoFocus
                  maxLength={50}
                />
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  onClick={handleSaveNom}
                  disabled={nomStatus === "loading"}
                >
                  Sauvegarder
                </button>
                <button
                  className="text-gray-500 text-xs underline"
                  onClick={() => setEditNom(false)}
                  type="button"
                >
                  Annuler
                </button>
              </span>
            )}
          </div>

          {/* Prénom (édition inline) */}
          <div>
            <strong>Prénom :</strong>{" "}
            {!editPrenom ? (
              <>
                {user.prenom}
                <button
                  className="ml-2 text-blue-600 text-xs underline"
                  onClick={() => {
                    setEditPrenom(true);
                    setPrenom(user.prenom ?? "");
                    setPrenomStatus("idle");
                    setPrenomError(null);
                  }}
                >
                  Modifier
                </button>
                {prenomStatus === "success" && (
                  <span className="ml-2 text-green-600 text-xs">Modifié !</span>
                )}
                {prenomStatus === "error" && (
                  <span className="ml-2 text-red-600 text-xs">{prenomError}</span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-2">
                <input
                  className="border rounded p-1 text-sm"
                  value={prenom}
                  onChange={e => setPrenom(e.target.value)}
                  autoFocus
                  maxLength={50}
                />
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  onClick={handleSavePrenom}
                  disabled={prenomStatus === "loading"}
                >
                  Sauvegarder
                </button>
                <button
                  className="text-gray-500 text-xs underline"
                  onClick={() => setEditPrenom(false)}
                  type="button"
                >
                  Annuler
                </button>
              </span>
            )}
          </div>

          <div><strong>Rôle :</strong> {user.role}</div>
          {/* --- Géolocalisation utilisateur --- */}
          <div className="mt-2">
            <GeolocToggle />
          </div>
        </div>

        {/* Formulaire de changement de mot de passe */
        }
        <div className="mb-4">
          {!editPassword ? (
            <button
              className="text-blue-600 underline text-sm"
              onClick={() => {
                setEditPassword(true);
                setPasswordStatus("idle");
                setPasswordError(null);
              }}
            >
              Changer mon mot de passe
            </button>
          ) : (
            <form onSubmit={handleSavePassword} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Ancien mot de passe</label>
                <input
                  type="password"
                  className="w-full rounded border border-gray-300 p-2"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Nouveau mot de passe</label>
                <input
                  type="password"
                  className="w-full rounded border border-gray-300 p-2"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              {passwordStatus === "error" && (
                <div className="text-red-600 bg-red-50 rounded p-2 text-center text-xs">
                  {passwordError}
                </div>
              )}
              {passwordStatus === "success" && (
                <div className="text-green-600 bg-green-50 rounded p-2 text-center text-xs">
                  Mot de passe modifié avec succès !
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  disabled={passwordStatus === "loading"}
                >
                  Sauvegarder
                </button>
                <button
                  type="button"
                  className="text-gray-500 text-xs underline"
                  onClick={() => setEditPassword(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Lien: Changer de rôle ? */}
        <div className="mb-6">
          <button
            type="button"
            className="text-blue-600 underline text-sm"
            onClick={() => navigate("/changer-de-role")}
          >
            Changer de rôle ?
          </button>
        </div>

        {/* Bouton de déconnexion */}
        <div className="mt-6 flex justify-center">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold shadow transition"
            onClick={() => {
              if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
                logout();
              }
            }}
          >
            Se déconnecter
          </button>
        </div>

        {/* Bouton de suppression du compte */}
        <div className="mt-8 flex justify-center">
          <button
            className="bg-gray-200 hover:bg-red-500 hover:text-white text-red-700 font-semibold px-4 py-2 rounded-xl transition shadow"
            onClick={() => setShowDelete(true)}
          >
            Supprimer mon compte
          </button>
        </div>

        {/* Dialogue/modal de suppression du compte (confirmation simple) */}
        {showDelete && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
              <button
                className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl"
                onClick={() => setShowDelete(false)}
                title="Fermer"
                aria-label="Fermer"
              >
                &times;
              </button>
              <h2 className="font-bold text-lg mb-2 text-red-700">
                Êtes-vous sûr de vouloir supprimer votre compte ?
              </h2>
              <p className="mb-3 text-sm text-gray-700">
                <strong>Attention :</strong> Cette action est <span className="text-red-600">irréversible</span>.<br />
                Pour confirmer, cliquez sur "Confirmer la suppression".
              </p>
              <form onSubmit={handleDeleteAccount} className="space-y-2">
                {deleteStatus === "error" && (
                  <div className="text-red-600 bg-red-50 rounded p-2 text-center text-xs">
                    {deleteError}
                  </div>
                )}
                {deleteStatus === "success" && (
                  <div className="text-green-600 bg-green-50 rounded p-2 text-center text-xs">
                    Votre compte a été supprimé. À bientôt !
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                    disabled={deleteStatus === "loading"}
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 text-xs underline"
                    onClick={() => setShowDelete(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {accountDeleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
              <h2 className="font-bold text-lg text-green-700 mb-2">Compte supprimé</h2>
              <p className="mb-2">Votre compte a bien été supprimé.<br />Déconnexion en cours…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 
 * Composant interne : Bouton toggle géolocalisation (profil utilisateur)
 * Affiche l’état, active/désactive la position, feedback UX/RGPD.
 */
function GeolocToggle() {
  const { active, lat, lon, error, loading, requestGeolocation, clearGeolocation } = useGeolocation();

  return (
    <div className="flex flex-col gap-2">
      {active && lat && lon ? (
        <>
          <div className="text-green-700 text-sm">
            📍 Votre position est activée.<br />
            <span className="text-gray-600">
              (Vos résultats sont personnalisés dans un rayon de 50 km.)
            </span>
          </div>
          <button
            type="button"
            className="px-3 py-1 bg-gray-200 hover:bg-red-500 hover:text-white text-red-700 text-sm rounded transition font-semibold"
            onClick={clearGeolocation}
            disabled={loading}
          >
            Désactiver la géolocalisation
          </button>
        </>
      ) : (
        <>
          <div className="text-gray-700 text-sm">
            La géolocalisation vous permet de trouver les activités proches de chez vous.<br />
            <span className="text-gray-500">Vous pouvez l’activer ou la désactiver à tout moment.</span>
          </div>
          <button
            type="button"
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition font-semibold"
            onClick={requestGeolocation}
            disabled={loading}
          >
            {loading ? "Activation..." : "Activer la géolocalisation"}
          </button>
          {error && (
            <div className="text-red-600 text-xs mt-1">{error}</div>
          )}
        </>
      )}
    </div>
  );
}
