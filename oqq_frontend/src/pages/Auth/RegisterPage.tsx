/**
 * src/pages/Auth/RegisterPage.tsx
 * 
 * Page d’inscription utilisateur (oùquandquoi.fr)
 * - Saisie : nom, prénom, email, mot de passe, pseudo
 * - Étape 2 : demande de motivation/commentaire ("comment avez-vous connu le site ?")
 * - Appelle POST /api/users/register avec le champ motivation
 * - Feedback, erreurs, success, UX moderne
 * - Redirige vers /login après création
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/atoms/Icon";

export default function RegisterPage() {
  // État principal formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Ajout pour l'écran motivation
  const [motivation, setMotivation] = useState("");
  const [step, setStep] = useState(1); // 1: infos de base, 2: motivation

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Premier submit → passe à l'écran motivation
  const handleFirstStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // (optionnel : validation JS ici)
    setStep(2);
  };

  // Deuxième submit = envoi final
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          pseudo,
          nom,
          prenom,
          motivation, // Champ ajouté au body
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Erreur lors de l’inscription.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Affichage ----
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
        {/* Étape 1 : formulaire classique */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">Créer mon compte</h1>
            <form onSubmit={handleFirstStep} className="space-y-5">
              <div>
                <label htmlFor="nom" className="block mb-1 font-medium">Nom</label>
                <input
                  id="nom"
                  type="text"
                  className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  required
                  autoComplete="family-name"
                />
              </div>
              <div>
                <label htmlFor="prenom" className="block mb-1 font-medium">Prénom</label>
                <input
                  id="prenom"
                  type="text"
                  className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  value={prenom}
                  onChange={e => setPrenom(e.target.value)}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">Email</label>
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
              </div>
              <div>
                <label htmlFor="password" className="block mb-1 font-medium">Mot de passe</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 pr-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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
                    {/* Utilise ton composant Icon comme sur la page Login */}
                    <Icon name={showPassword ? "eyeOff" : "eye"} size="md" />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="pseudo" className="block mb-1 font-medium">Pseudo</label>
                <input
                  id="pseudo"
                  type="text"
                  className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  value={pseudo}
                  onChange={e => setPseudo(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              {error && (
                <div className="text-red-600 bg-red-50 rounded p-2 text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 font-semibold transition"
                disabled={loading}
              >
                {loading ? "..." : "Créer mon compte"}
              </button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-500">
              Déjà inscrit ?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Se connecter
              </a>
            </div>
          </>
        )}

        {/* Étape 2 : fenêtre motivation */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-center mb-4">
              Demande d’accès
            </h2>
            <div className="mb-4 text-gray-700 text-sm">
              oùquandquoi.fr est un démonstrateur ouvert à tous mais avec accès restreint.<br />
              <b>Merci de nous donner plus d’informations sur vous, et surtout comment vous avez connu notre site web.</b>
            </div>
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              <div>
                <label htmlFor="motivation" className="block mb-1 font-medium">
                  Votre message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="motivation"
                  className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                  required
                  rows={4}
                  placeholder="Ex : Je souhaite découvrir la plateforme, j’ai connu oùquandquoi.fr via... etc."
                  autoFocus
                />
              </div>
              {error && (
                <div className="text-red-600 bg-red-50 rounded p-2 text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-600 bg-green-50 rounded p-2 text-center">
                  Demande envoyée avec succès !
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 font-semibold transition"
                disabled={loading}
              >
                {loading ? "Envoi..." : "Envoyer la demande d’accès"}
              </button>
              <button
                type="button"
                className="w-full bg-gray-100 text-gray-500 mt-2 rounded-xl py-2 font-semibold hover:bg-gray-200 transition"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Retour
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
