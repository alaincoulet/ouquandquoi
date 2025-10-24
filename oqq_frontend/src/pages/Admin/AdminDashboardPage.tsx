// ==========================================================
// FILE: src/pages/Admin/AdminDashboardPage.tsx
// Central admin dashboard for oùquandquoi.fr
// - Gestion complète des utilisateurs (validation, bannir, réactiver, suppression)
// - Affichage activités expirées
// ==========================================================

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Carousel from "@/components/ui/Carousel";
import ProductCard from "@/components/molecules/ProductCard";
import { Activity } from "@/types/activity";
import { getExpiredActivities } from "@/config/api";

interface UserAdmin {
  _id: string;
  email: string;
  pseudo?: string;
  nom: string;
  prenom: string;
  motivation?: string;
  createdAt?: string;
  role: string;
  status: "active" | "suspended";
}

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // ==========================================================
  // === ÉTAT (états locaux, hooks) ===========================
  // ==========================================================
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<null | string>(null);

  const [expiredActivities, setExpiredActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [errorActivities, setErrorActivities] = useState<string | null>(null);

  // ==========================================================
  // === COMPORTEMENT (navigation, chargement, callbacks) =====
  // ==========================================================

  // Redirect if not admin (front-end security)
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Load ALL users at mount (admin only)
  useEffect(() => {
    if (!token) return;
    setLoadingUsers(true);
    fetch("/api/users/admin/all-users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Erreur inconnue");
        setUsers(data.users);
      })
      .catch((err) => setError(err.message || "Erreur"))
      .finally(() => setLoadingUsers(false));
  }, [token, successMsg]);

  // Load expired activities at mount
  useEffect(() => {
    if (!token) return;
    setLoadingActivities(true);
    getExpiredActivities()
      .then((activities) => setExpiredActivities(activities))
      .catch((err) =>
        setErrorActivities(
          err?.message || "Erreur lors de la récupération des activités expirées"
        )
      )
      .finally(() => setLoadingActivities(false));
  }, [token]);

  // Handler for user validation (pending → user)
  const handleValidate = async (userId: string) => {
    setActionId(userId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/users/validate/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur validation");
      setSuccessMsg("Utilisateur validé !");
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
    } finally {
      setActionId(null);
    }
  };

  // Handler for ban/reactivate
  const handleToggleStatus = async (userId: string, newStatus: "active" | "suspended") => {
    setActionId(userId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur statut");
      setSuccessMsg(newStatus === "suspended" ? "Utilisateur banni !" : "Compte réactivé !");
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
    } finally {
      setActionId(null);
    }
  };

  // Handler for delete (with confirmation)
  const handleDelete = async (userId: string) => {
    setActionId(userId);
    setShowConfirm(null);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur suppression");
      setSuccessMsg("Utilisateur supprimé définitivement.");
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
    } finally {
      setActionId(null);
    }
  };

  // Utils
  const renderStatusBadge = (status: "active" | "suspended") => (
    <span
      className={
        "inline-block px-2 py-0.5 rounded text-xs font-semibold " +
        (status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700")
      }
    >
      {status === "active" ? "Actif" : "Suspendu"}
    </span>
  );

  // ==========================================================
  // === AFFICHAGE (rendu JSX, mapping état => UI) ============
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Tableau de bord administrateur
        </h1>

        {/* ----- Block: User management ----- */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-blue-700 text-center">
            Gestion des utilisateurs
          </h2>
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-center font-semibold">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded bg-green-50 text-green-700 text-center font-semibold">
              {successMsg}
            </div>
          )}
          {loadingUsers ? (
            <div className="text-center text-gray-500">Chargement...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-500">
              Aucun utilisateur trouvé.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-center">
                    <th className="p-2 font-semibold">Nom / Prénom</th>
                    <th className="p-2 font-semibold">Email</th>
                    <th className="p-2 font-semibold">Pseudo</th>
                    <th className="p-2 font-semibold">Date</th>
                    <th className="p-2 font-semibold">Rôle</th>
                    <th className="p-2 font-semibold">Statut</th>
                    <th className="p-2 font-semibold">Motivation</th>
                    <th className="p-2 font-semibold" colSpan={3}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50 text-center">
                      <td className="p-2 whitespace-nowrap text-left">
                        <b>{u.nom}</b> <br />
                        {u.prenom}
                      </td>
                      <td className="p-2 whitespace-nowrap">{u.email}</td>
                      <td className="p-2 whitespace-nowrap">{u.pseudo}</td>
                      <td className="p-2 whitespace-nowrap">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("fr-FR")
                          : ""}
                      </td>
                      <td className="p-2 whitespace-nowrap">{u.role}</td>
                      <td className="p-2 whitespace-nowrap">
                        {renderStatusBadge(u.status)}
                      </td>
                      <td className="p-2 max-w-xs break-words">
                        {u.motivation || <span className="italic text-gray-400">(vide)</span>}
                      </td>
                      {/* Validation (pending) */}
                      <td className="p-2">
                        {u.role === "pending" && (
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 py-1 font-semibold text-xs transition"
                            disabled={actionId === u._id}
                            onClick={() => handleValidate(u._id)}
                          >
                            {actionId === u._id ? "Validation..." : "Valider"}
                          </button>
                        )}
                      </td>
                      {/* Bannir / Réactiver */}
                      <td className="p-2">
                        {u.role !== "admin" && u.role !== "pending" && (
                          <button
                            className={`${
                              u.status === "active"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            } text-white rounded-xl px-3 py-1 font-semibold text-xs transition`}
                            disabled={actionId === u._id}
                            onClick={() =>
                              handleToggleStatus(
                                u._id,
                                u.status === "active" ? "suspended" : "active"
                              )
                            }
                          >
                            {actionId === u._id
                              ? (u.status === "active" ? "Bannir..." : "Réactivation...")
                              : u.status === "active"
                              ? "Bannir"
                              : "Réactiver"}
                          </button>
                        )}
                      </td>
                      {/* Supprimer définitivement */}
                      <td className="p-2">
                        {u.role !== "admin" && (
                          <>
                            <button
                              className="bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700 rounded-xl px-3 py-1 font-semibold text-xs transition"
                              disabled={actionId === u._id}
                              onClick={() => setShowConfirm(u._id)}
                            >
                              {actionId === u._id ? "Suppression..." : "Supprimer"}
                            </button>
                            {/* Confirmation modale basique */}
                            {showConfirm === u._id && (
                              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
                                  <div className="text-lg font-bold text-red-700">
                                    Confirmer la suppression
                                  </div>
                                  <div>
                                    Supprimer <b>{u.nom} {u.prenom}</b> ?
                                  </div>
                                  <div className="flex gap-4">
                                    <button
                                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded px-4 py-1 font-semibold"
                                      onClick={() => setShowConfirm(null)}
                                    >
                                      Annuler
                                    </button>
                                    <button
                                      className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-1 font-semibold"
                                      onClick={() => handleDelete(u._id)}
                                    >
                                      Supprimer définitivement
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ----- Block: Expired activities ----- */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-red-700 text-center">
            Activités expirées ({expiredActivities.length})
          </h2>
          {errorActivities && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-center font-semibold">
              {errorActivities}
            </div>
          )}
          {loadingActivities ? (
            <div className="text-center text-gray-500">Chargement...</div>
          ) : expiredActivities.length === 0 ? (
            <div className="text-center text-gray-500">
              Aucune activité expirée pour le moment.
            </div>
          ) : (
            <Carousel>
              {expiredActivities.map((activity) => (
                <ProductCard
                  key={activity._id}
                  product={activity}
                />
              ))}
            </Carousel>
          )}
        </section>
      </div>
    </div>
  );
}
