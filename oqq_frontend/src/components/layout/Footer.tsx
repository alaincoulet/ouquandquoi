// ==========================================================
// FICHIER : src/components/layout/Footer.tsx
// Footer principal oùquandquoi.fr (version simplifiée)
// - Largeur max-w-7xl, centré, fond blanc uniquement sur le container interne
// - Bloc navigation supprimé (plus de "Découvrir", "Compte")
// - Footer minimaliste : logo, description, liens légaux, copyright
// ==========================================================

import React from 'react'
import Container from '@/components/layout/Container'

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 mt-0">
      <Container
        size="xl"
        padding="md"
        className="rounded-b-2xl shadow-xl border border-gray-200 bg-gray-50"
      >
        {/* Section principale */}
        <div className="space-y-8">
          {/* Logo et description */}
          <div className="text-center">
            <img 
              src="/src/assets/images/logo-ouquandquoi.svg" 
              alt="OùQuandQuoi"
              className="h-8 w-auto mx-auto mb-4"
            />
            <p className="text-sm text-gray-600 max-w-xs mx-auto">
              Découvrez les meilleures activités et événements près de chez vous
            </p>
          </div>

          {/* Réseaux sociaux (placeholder, à compléter si besoin) */}
          <div className="flex justify-center space-x-6">
            {/* ... SVG réseaux sociaux ... */}
          </div>

          {/* Liens légaux */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <a href="/mentions-legales" className="hover:text-gray-700 transition-colors">
              Mentions légales
            </a>
            <a href="/confidentialite" className="hover:text-gray-700 transition-colors">
              Politique de confidentialité
            </a>
            <a href="/cgu" className="hover:text-gray-700 transition-colors">
              CGU
            </a>
            <a href="/contact" className="hover:text-gray-700 transition-colors">
              Contact
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2025 OùQuandQuoi. Tous droits réservés.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
