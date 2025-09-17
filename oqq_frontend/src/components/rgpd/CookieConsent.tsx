// src/components/rgpd/CookieConsent.tsx
// =====================================================================
// Composant RGPD pour oùquandquoi.fr
// - Charge le module "klaro" en dynamique côté client (Vite + TS).
// - Tolérant aux environnements ESM/CommonJS: mod.default ?? mod.
// - Ne plante jamais l'app : vérifie l'existence de klaro.setup.
// - Fournit une config FR minimale (à enrichir plus tard).
// - Optionnel: rend un petit bouton "Gérer mes cookies".
// =====================================================================

import React, { useEffect, useState } from "react";

type KlaroModule = {
  setup?: (config: Record<string, any>) => void;
  show?: (configKey?: string) => void;
  getManager?: () => any;
};

declare global {
  interface Window {
    klaro?: KlaroModule;
  }
}

const CookieConsent: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadKlaro = async () => {
      // S'assurer qu'on est bien côté client
      if (typeof window === "undefined") return;

      try {
        // Charge le CSS de Klaro (tolérant : ignore si indisponible)
        try {
          await import("klaro/dist/klaro.css");
        } catch {
          // pas bloquant
        }

        // Import dynamique du module (ESM / CJS)
        const mod: any = await import("klaro");
        const klaro: KlaroModule = (mod?.default ?? mod) as KlaroModule;

        if (!klaro || typeof klaro.setup !== "function") {
          console.warn(
            "[CookieConsent] Module 'klaro' chargé mais API inattendue (pas de setup)."
          );
          return;
        }

        // Expose globalement (certains plugins l'attendent)
        window.klaro = klaro;

        // --- Config minimale FR (à ajuster selon vos services) -------------
        const config = {
          version: 1,
          testing: false,
          elementID: "oqq-klaro",
          lang: "fr",
          storageMethod: "localStorage",
          cookieName: "oqq_klaro",
          htmlTexts: true,
          privacyPolicy: "/confidentialite",
          acceptAll: true,
          translations: {
            fr: {
              consentModal: {
                title: "Gestion des cookies",
                description:
                  "Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez accepter tous les cookies ou personnaliser vos choix.",
              },
              consentNotice: {
                description:
                  "Nous utilisons des cookies pour analyser le trafic et améliorer le site.",
                learnMore: "Personnaliser",
              },
              ok: "Accepter",
              save: "Enregistrer",
              decline: "Refuser",
            },
          },
          // Déclarez vos services ici (Matomo, GA4, Maps, etc.)
          services: [
            // {
            //   name: "matomo",
            //   purposes: ["analytics"],
            //   cookies: [/^_pk_.*$/],
            // },
          ],
          // -----------------------------------------------------------------
        };

        // Initialise Klaro
        if (!cancelled) {
          klaro.setup?.(config);
          setReady(true);
        }
      } catch (err) {
        console.error(
          "[CookieConsent] Impossible de charger/initialiser Klaro :",
          err
        );
        // On ne jette pas d'erreur pour éviter tout crash.
      }
    };

    loadKlaro();

    // Pas d'API publique de "teardown" chez Klaro -> rien à nettoyer
    return () => {
      cancelled = true;
    };
  }, []);

  // Optionnel : bouton pour rouvrir le gestionnaire à tout moment
  if (!ready) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        type="button"
        aria-label="Gérer mes cookies"
        onClick={() => window.klaro?.show?.()}
        className="rounded-full border px-4 py-2 text-sm bg-white/90 hover:bg-white shadow"
      >
        Gérer mes cookies
      </button>
    </div>
  );
};

export default CookieConsent;
