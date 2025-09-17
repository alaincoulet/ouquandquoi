// Page affichant la politique de confidentialité du site

import React from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom"; // ✅ Import du composant Link pour navigation SPA

export default function PolitiqueConfidentialite() {
  return (
    <Layout>
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
          </Link>.
        </p>

        <p className="mt-8 text-sm text-gray-500">Dernière mise à jour : 30 juillet 2025</p>
      </div>
    </Layout>
  );
}
