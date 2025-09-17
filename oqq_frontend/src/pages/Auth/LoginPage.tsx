/**
 * src/pages/Auth/LoginPage.tsx
 * 
 * Page de connexion utilisateur (oùquandquoi.fr)
 * - Utilise le contexte d’auth global (useAuth)
 * - Formulaire : email + mot de passe
 * - Icône œil (gérée via /components/atoms/Icon.tsx) dans le champ mot de passe
 * - Affichage temporaire du mot de passe tant que le clic est maintenu
 * - Appel API POST /api/users/login
 * - Gestion des états, erreurs, feedback utilisateur
 * - Redirection sécurisée via useEffect
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/atoms/Icon";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // État pour affichage temporaire du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Redirection sécurisée si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erreur de connexion.");
        setLoading(false);
        return;
      }

      // ATTENTION : le backend doit renvoyer user._id (et non id)
      login(data.token, data.user);
      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Mot de passe
            </label>
            {/* ==== Champ mot de passe avec icône œil native ==== */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 pr-10" // pr-10 pour l'espace à droite
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-0.5"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size="md" />
              </button>
            </div>
            {/* ==== Fin champ mot de passe ==== */}
          </div>

          {error && (
            <div className="text-red-600 bg-red-50 rounded p-2 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 bg-green-50 rounded p-2 text-center">
              Connexion réussie !
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 font-semibold transition"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        {/* Lien mot de passe oublié */}
        <div className="mt-4 text-center">
          <a
            href="/reset-password"
            className="text-blue-600 hover:underline text-sm"
          >
            Mot de passe oublié&nbsp;?
          </a>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          Pas encore de compte ? <a href="/register" className="text-blue-600 hover:underline">S’inscrire</a>
        </div>
      </div>
    </div>
  );
}
