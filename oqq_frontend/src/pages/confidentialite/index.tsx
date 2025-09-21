// ==========================================================
// FICHIER : src/pages/confidentialite/index.tsx
// Page Politique de confidentialité oùquandquoi.fr
// - Sans logo, structurée comme CGU et Mentions légales
// ==========================================================

import React, { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";

export default function PolitiqueConfidentialite() {
  const navigate = useNavigate();
  const location = useLocation();

  // Handler général pour renvoyer vers la home avec state
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
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Politique de confidentialité</h1>

        <p className="mb-4">
          Nous attachons une grande importance à la protection de vos données personnelles.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Données collectées</h2>
        <p className="mb-4">
          Lorsque vous utilisez oùquandquoi.fr, certaines données peuvent être collectées, telles que votre nom,
          votre localisation, ou encore des fichiers déposés. Ces données sont utilisées exclusivement dans le
          cadre du service proposé.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Utilisation des données</h2>
        <p className="mb-4">
          Les données sont utilisées pour améliorer votre expérience, afficher des activités pertinentes
          et vous permettre de gérer votre profil et vos contributions.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Vos droits</h2>
        <p className="mb-4">
          Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et de suppression de vos données.
          Pour exercer vos droits, contactez-nous via la page{" "}
          <Link to="/contact" className="underline text-primary-600">
            Contact
          </Link>{" "}
          ou par email : <strong>contact@ouquandquoi.fr</strong>.
        </p>

        <p className="mt-8 text-sm text-gray-500">Dernière mise à jour : 30 juillet 2025</p>
      </div>
    </Layout>
  );
}
