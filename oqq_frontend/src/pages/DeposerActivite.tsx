// ==========================================================
// FICHIER : src/pages/DeposerActivite.tsx
// Nouvelle version “Déposer une activité” oùquandquoi.fr
// - Utilise Layout global (UX homogène avec CGU, Contact...)
// - Centre le formulaire <ActivityForm />
// ==========================================================

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ActivityForm from "@/components/activities/ActivityForm";

export default function DeposerActivitePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMap, setShowMap] = useState(false);

  // Navigation intelligente (héritée du modèle CGU)
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
      showMap={showMap}
      onToggleMap={() => setShowMap(!showMap)}
    >
      <div className="max-w-6xl w-full mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {window.location.search.includes("edit") ? "Modifier une activité" : "Déposer une activité"}
        </h1>
        <ActivityForm />
      </div>
    </Layout>
  );
}
