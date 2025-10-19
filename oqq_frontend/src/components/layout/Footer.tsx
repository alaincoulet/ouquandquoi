// ==========================================================
// FILE : src/components/layout/Footer.tsx
// Main footer for oùquandquoi.fr (simplified version)
// - Full-width flex with logo + tagline aligned with space-around
// - Compact vertical spacing
// - Legal links + copyright
// ==========================================================

import React from "react"
import Container from "@/components/layout/Container"
import { Link } from "react-router-dom"
import logo from "@/assets/images/logo_oqq.png"

const Footer: React.FC = () => {
  // ==========================================================
  // === STATE (useState, useEffect, useContext, etc.) =========
  // ==========================================================
  // No state required

  // ==========================================================
  // === BEHAVIOR (functions, callbacks, business logic) ======
  // ==========================================================
  // No logic required

  // ==========================================================
  // === RENDER (JSX mapping state => UI) ======================
  // ==========================================================
  return (
    <footer className="border-t border-gray-200 mt-0">
      <Container
        size="xl"
        padding="md"
        className="bg-gray-50"
      >
        <div className="space-y-4">
          {/* Logo + tagline with space-around */}
          <div className="flex w-full justify-around items-center flex-wrap gap-3 text-center sm:text-left">
            <Link
              to="/"
              className="flex items-center gap-2 group"
              aria-label="Accueil oùquandquoi.fr"
            >
              <img
                src={logo}
                alt="Logo oùquandquoi.fr"
                className="h-14 w-14 object-contain"
              />
              <span className="text-xl sm:text-2xl font-bold text-green-600 tracking-tight group-hover:underline transition">
                oùquandquoi.fr
              </span>
            </Link>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              Partenaire de votre temps libre...
            </p>
          </div>

          {/* Legal links */}
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
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
          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2025 OùQuandQuoi. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
