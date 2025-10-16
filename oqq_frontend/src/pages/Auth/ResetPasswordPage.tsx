/**
 * src/pages/Auth/ResetPasswordPage.tsx
 *
 * Page de réinitialisation du mot de passe.
 * - L'utilisateur reçoit un code/token par email
 * - Renseigne ce code + son nouveau mot de passe
 * - UX moderne, mobile friendly
 * - RGPD : aucun stockage local, aucune fuite d’info, feedback générique “si ce compte existe”
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailRequestStatus, setEmailRequestStatus] = useState<
    null | "idle" | "sending" | "sent" | "error"
  >("idle");
  const [devToken, setDevToken] = useState<string | null>(null);

  const navigate = useNavigate();

  // Prefill email and token from query string if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const tokenParam = params.get("token");
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Erreur lors de la réinitialisation.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      setError("Veuillez renseigner votre email.");
      return;
    }
    setEmailRequestStatus("sending");
    setError(null);
    setToken("");
    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEmailRequestStatus("error");
        setError(data?.message || "Impossible d'envoyer le code.");
        return;
      }
      setEmailRequestStatus("sent");
      if (data?.devToken) setDevToken(data.devToken);
    } catch (e) {
      setEmailRequestStatus("error");
      setError("Erreur réseau lors de l'envoi du code.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Réinitialiser le mot de passe</h1>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email utilisé sur le compte
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
            <div className="text-xs text-gray-500 mt-1">
              Vous recevrez un email avec un code de réinitialisation si ce compte existe.
            </div>
            <div className="text-xs text-gray-400 mt-1">
              (Aucune donnée n’est stockée localement. Cette procédure est anonyme et respecte la confidentialité des utilisateurs.)
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendCode}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm"
                disabled={emailRequestStatus === "sending"}
              >
                {emailRequestStatus === "sending" ? "Envoi..." : "Envoyer le code"}
              </button>
              {emailRequestStatus === "sent" && (
                <span className="text-green-600 text-sm">Email envoyé (si le compte existe).</span>
              )}
            </div>
            {devToken && (
              <div className="mt-2 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded p-2">
                <div>
                  Code de test (local): <span className="font-mono select-all">{devToken}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setToken(devToken)}
                  className="mt-1 px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
                >
                  Coller le code
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="token" className="block mb-1 font-medium">
              Code reçu par email
            </label>
            <input
              id="token"
              type="text"
              className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
              autoComplete="one-time-code"
              inputMode="text"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Collez ici le code reçu"
            />
            <div className="text-xs text-gray-500 mt-1">
              Copiez le code reçu par email.
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block mb-1 font-medium">
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              type="password"
              className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="text-red-700 bg-red-50 rounded p-2 text-center border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-700 bg-green-50 rounded p-2 text-center border border-green-200">
              Mot de passe réinitialisé avec succès. Redirection...
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 font-semibold transition"
            disabled={loading}
          >
            {loading ? "En cours..." : "Réinitialiser"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          <a href="/login" className="text-blue-600 hover:underline">
            Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  );
}
