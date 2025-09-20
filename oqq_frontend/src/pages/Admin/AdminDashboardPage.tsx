// ==========================================================
// FILE: src/pages/Admin/AdminDashboardPage.tsx
// Central admin dashboard for oùquandquoi.fr
// - Validation of pending user accounts
// - Display of expired activities (carousel)
// - Ready for further admin features
// ==========================================================

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Carousel from "@/components/ui/Carousel";
import ProductCard from "@/components/molecules/ProductCard";
import { Activity } from "@/types/activity";
import { getExpiredActivities } from "@/config/api"; // Import API call

interface PendingUser {
  _id: string;
  email: string;
  pseudo?: string;
  nom: string;
  prenom: string;
  motivation?: string;
  createdAt?: string;
}

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // --- Pending users management ---
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Expired activities management ---
  const [expiredActivities, setExpiredActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [errorActivities, setErrorActivities] = useState<string | null>(null);

  // Redirect if not admin (front-end security)
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Load pending users at mount
  useEffect(() => {
    if (!token) return;
    setLoadingUsers(true);
    fetch("/api/users/pending", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Erreur inconnue");
        setPendingUsers(data.users);
      })
      .catch((err) => setError(err.message || "Erreur"))
      .finally(() => setLoadingUsers(false));
  }, [token]);

  // Load expired activities at mount (now via API helper)
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

  // Handler for user validation
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
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur validation");
      setPendingUsers((users) => users.filter((u) => u._id !== userId));
      setSuccessMsg("Utilisateur validé !");
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Tableau de bord administrateur
        </h1>

        {/* ----- Block: Pending users ----- */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-blue-700 text-center">
            Validation des utilisateurs en attente
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
          ) : pendingUsers.length === 0 ? (
            <div className="text-center text-gray-500">
              Aucun utilisateur en attente de validation.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 font-semibold">Nom / Prénom</th>
                    <th className="p-2 font-semibold">Email</th>
                    <th className="p-2 font-semibold">Pseudo</th>
                    <th className="p-2 font-semibold">Date</th>
                    <th className="p-2 font-semibold">Motivation</th>
                    <th className="p-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 whitespace-nowrap">
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
                      <td className="p-2 max-w-xs break-words">
                        {u.motivation || <span className="italic text-gray-400">(vide)</span>}
                      </td>
                      <td className="p-2 text-right">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-semibold text-xs transition"
                          disabled={actionId === u._id}
                          onClick={() => handleValidate(u._id)}
                        >
                          {actionId === u._id ? "Validation..." : "Valider"}
                        </button>
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

        {/* ----- Future blocks: Add more admin features here ----- */}
      </div>
    </div>
  );
}
