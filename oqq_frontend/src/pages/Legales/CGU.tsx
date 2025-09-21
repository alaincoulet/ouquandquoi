// ==========================================================
// FICHIER : src/pages/CGU/index.tsx
// Page Conditions Générales d’Utilisation oùquandquoi.fr
// Structure identique à Mentions Légales, sans logo
// ==========================================================

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";

export default function CGU() {
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
        <h1 className="text-3xl font-bold mb-4">Conditions Générales d’Utilisation</h1>

        <h2 className="text-2xl font-semibold mt-6 mb-2">1. Objet</h2>
        <p>
          Les présentes conditions régissent l’utilisation du site oùquandquoi.fr.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">2. Acceptation</h2>
        <p>
          En accédant au site, l’utilisateur accepte sans réserve les présentes CGU.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Services</h2>
        <p>
          Le site permet aux utilisateurs de rechercher, consulter ou publier des activités de loisirs.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">4. Obligations de l’utilisateur</h2>
        <p>
          L’utilisateur s’engage à fournir des informations exactes et à respecter les lois en vigueur.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">5. Propriété intellectuelle</h2>
        <p>
          Tous les éléments du site sont protégés par le droit de la propriété intellectuelle.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Responsabilité</h2>
        <p>
          OùQuandQuoi ne saurait être tenu responsable en cas d’utilisation frauduleuse du site ou de son contenu.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">7. Modifications</h2>
        <p>
          OùQuandQuoi se réserve le droit de modifier les présentes CGU à tout moment.
        </p>
      </div>
    </Layout>
  );
}
