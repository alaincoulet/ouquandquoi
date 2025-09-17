// ==========================================================
// FICHIER : src/pages/DeposerActivite.tsx
// Page “Déposer une activité” oùquandquoi.fr
// - Affiche le formulaire natif MongoDB pour ajout activité
// - Utilise uniquement ActivityForm, sans fallback JSON ni id JS
// - RGPD : aucune donnée stockée hors session utilisateur
// ==========================================================

import React from "react";
import ActivityForm from "@/components/activities/ActivityForm";

/**
 * Page de dépôt d’activité (création MongoDB only)
 * - Affiche <ActivityForm /> qui gère l’ajout côté API backend natif (full _id)
 * - Aucun fallback, 100% Mongo natif
 */
const DeposerActivite: React.FC = () => {
  return <ActivityForm />;
};

export default DeposerActivite;
