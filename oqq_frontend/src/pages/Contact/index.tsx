/**
 * src/pages/Contact/index.tsx
 * Page Contact oùquandquoi.fr (formulaire avec Layout global)
 * - Formulaire full-width + upload fichier (1 max, 5 Mo)
 * - Illustration supprimée, Layout unifié
 */

import React, { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";

export default function ContactPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // === STATE ===
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showMap, setShowMap] = useState(false);

  // Gestion fichier (max 1 fichier, 5 Mo)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.size > 5 * 1024 * 1024) {
      alert("Le fichier dépasse 5 Mo.");
      e.target.value = "";
      setFile(null);
    } else {
      setFile(selected || null);
    }
  };

  // Envoi simulé (placeholder, à relier à POST /api/contact)
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
      setFile(null);
    } catch {
      setStatus("error");
    }
  }

  // Redirection intelligente via Layout
  const handleRedirectToHome = (navId: string, href: string) => {
    if (href !== "/") {
      navigate(href);
      return;
    }
    navigate("/", {
      state: {
        from: location.pathname,
        redirectTriggered: true,
      },
    });
  };

  // === RENDER ===
  return (
    <Layout
      where={{ label: "", location: "", distance: undefined, lat: undefined, lon: undefined }}
      onWhereChange={(val) =>
        navigate("/", { state: { where: val, redirectTriggered: true } })
      }
      when=""
      onWhenChange={(val) =>
        navigate("/", { state: { when: val, redirectTriggered: true } })
      }
      value={{ keyword: "", category: undefined, subcategory: undefined, excludedSubcategories: [] }}
      onWhatChange={(val) =>
        navigate("/", { state: { what: val, redirectTriggered: true } })
      }
      onNavigate={handleRedirectToHome}
      showMap={showMap}
      onToggleMap={() => setShowMap(!showMap)}
    >
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Contactez-nous
        </h1>
        <p className="text-gray-500 mb-6 text-center max-w-2xl">
          Une question, une suggestion, un souci ? Remplissez ce formulaire, nous vous répondrons rapidement.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-white shadow-lg rounded-2xl px-6 py-8 flex flex-col gap-4"
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
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setMessage(e.target.value)}
              aria-required="true"
              maxLength={2000}
            />
          </label>
          {/* Champ fichier (facultatif) */}
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Ajouter un fichier (PDF, image…)
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </label>
            {file && (
              <div className="text-sm text-gray-600 mt-1">
                Fichier sélectionné : <strong>{file.name}</strong>
              </div>
            )}
          </div>
          {/* Bouton submit */}
          <button
            type="submit"
            className="mt-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-xl shadow hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={status === "sending"}
            aria-busy={status === "sending"}
          >
            {status === "sending" ? "Envoi…" : "Envoyer"}
          </button>
          {/* Messages retour */}
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
