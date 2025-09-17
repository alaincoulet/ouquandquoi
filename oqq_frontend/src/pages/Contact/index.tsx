/**
 * Page de contact moderne pour oùquandquoi.fr
 * - Présente une illustration SVG "chat/message" en haut
 * - Formulaire accessible (nom, email, message)
 * - Layout épuré, adapté mobile/desktop, style Tailwind v3
 * - Prête à relier au backend (POST /api/contact à implémenter)
 * - Commentaires détaillés pour chaque bloc/fonction
 */

import React, { useState, FormEvent } from "react";
import Layout from "@/components/layout/Layout";

// SVG moderne "chat/message" pour illustrer la page Contact
const ContactIllustration = () => (
  <svg
    width="96"
    height="96"
    viewBox="0 0 96 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="mx-auto mb-4 drop-shadow-lg"
  >
    <rect x="8" y="20" width="80" height="50" rx="10" fill="#3b82f6" />
    <rect x="14" y="28" width="68" height="34" rx="5" fill="white" />
    <rect x="22" y="36" width="36" height="6" rx="3" fill="#dbeafe" />
    <rect x="22" y="48" width="24" height="6" rx="3" fill="#dbeafe" />
    <circle cx="72" cy="58" r="5" fill="#3b82f6" />
    <path
      d="M24 70 L40 66 Q44 72 56 66 L72 70"
      stroke="#60a5fa"
      strokeWidth="2"
      fill="none"
    />
    <rect x="34" y="66" width="28" height="7" rx="3.5" fill="#fff" />
    <rect x="37" y="69" width="22" height="1.5" rx="0.75" fill="#dbeafe" />
  </svg>
);

export default function ContactPage() {
  // État du formulaire
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Validation simple + gestion envoi (POST à intégrer plus tard)
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      // TODO: remplacer cette simulation par un vrai POST vers /api/contact
      await new Promise((res) => setTimeout(res, 1000));
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <Layout>
      {/* Conteneur principal, max largeur, centrage */}
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-8 px-2">
        {/* Illustration SVG moderne */}
        <ContactIllustration />

        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Contactez-nous
        </h1>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          Une question, une suggestion, un souci ? Remplissez ce formulaire, nous vous répondrons rapidement.
        </p>

        {/* Carte formulaire */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 py-8 flex flex-col gap-4"
          aria-label="Formulaire de contact"
        >
          {/* Champ nom */}
          <label htmlFor="name" className="text-sm font-semibold text-gray-600">
            Votre nom
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Votre nom"
              value={name}
              onChange={e => setName(e.target.value)}
              aria-required="true"
              autoComplete="name"
            />
          </label>

          {/* Champ email */}
          <label htmlFor="email" className="text-sm font-semibold text-gray-600">
            Votre email
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="ex: moi@email.fr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-required="true"
              autoComplete="email"
            />
          </label>

          {/* Champ message */}
          <label htmlFor="message" className="text-sm font-semibold text-gray-600">
            Message
            <textarea
              id="message"
              name="message"
              required
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none min-h-[96px]"
              placeholder="Expliquez-nous votre demande…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              aria-required="true"
              maxLength={2000}
            />
          </label>

          {/* Bouton submit */}
          <button
            type="submit"
            className="mt-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-xl shadow hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={status === "sending"}
            aria-busy={status === "sending"}
          >
            {status === "sending" ? "Envoi…" : "Envoyer"}
          </button>

          {/* Message retour utilisateur */}
          {status === "sent" && (
            <div className="text-green-600 text-center text-sm mt-2">
              Merci, votre message a bien été envoyé !
            </div>
          )}
          {status === "error" && (
            <div className="text-red-600 text-center text-sm mt-2">
              Une erreur est survenue, merci de réessayer.
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
