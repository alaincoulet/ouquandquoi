import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";

export default function MentionsLegales() {
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
        <h1 className="text-3xl font-bold mb-4">Mentions légales</h1>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Éditeur du site</h2>
        <p><strong>Nom du site :</strong> OùQuandQuoi.fr</p>
        <p><strong>Raison sociale :</strong> [Nom de l’entreprise ou micro-entreprise]</p>
        <p><strong>Forme juridique :</strong> [SARL, SAS, auto-entrepreneur, etc.]</p>
        <p><strong>Adresse :</strong> [Adresse complète du siège social]</p>
        <p><strong>SIRET :</strong> [Numéro SIRET]</p>
        <p><strong>Responsable de publication :</strong> [Nom + fonction]</p>
        <p><strong>Email :</strong> contact@ouquandquoi.fr</p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Hébergement</h2>
        <p><strong>Hébergeur :</strong> [Exemple : Infomaniak]</p>
        <p><strong>Adresse :</strong> [Adresse complète de l’hébergeur]</p>
        <p><strong>Téléphone :</strong> [Numéro de téléphone de l’hébergeur]</p>
        <p><strong>Site web :</strong> [URL du site de l’hébergeur]</p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Propriété intellectuelle</h2>
        <p>
          L’ensemble du contenu présent sur le site (textes, images, logos, éléments graphiques,
          structure générale...) est la propriété exclusive de OùQuandQuoi, sauf mention contraire.
          Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle,
          sans l’autorisation écrite préalable de l’éditeur est interdite.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Responsabilité</h2>
        <p>
          OùQuandQuoi décline toute responsabilité en cas d'erreurs ou d'omissions dans les
          contenus diffusés sur le site, ainsi qu’en cas d’interruption ou de non-disponibilité
          temporaire du service.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Données personnelles</h2>
        <p>
          Les informations collectées via les formulaires sont exclusivement destinées à OùQuandQuoi
          et ne sont jamais cédées à des tiers. Conformément à la loi « Informatique et Libertés »
          et au RGPD, vous disposez d’un droit d’accès, de rectification et de suppression de vos
          données. Vous pouvez exercer ces droits à l’adresse : contact@ouquandquoi.fr.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Cookies</h2>
        <p>
          Le site utilise des cookies à des fins de mesure d’audience et de bon fonctionnement.
          Vous pouvez configurer leur gestion à tout moment via notre module de consentement.
        </p>
      </div>
    </Layout>
  );
}
