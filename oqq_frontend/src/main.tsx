/**
 * main.tsx
 * Point d'entrée principal de l'application React.
 * - Monte l'application dans la page.
 * - Ajoute une logique pour gérer la redirection SPA depuis 404.html (fallback OVH).
 * - Ajoute le GeolocationProvider autour de l'app pour un accès global à la position utilisateur.
 */

import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import App from '@/App'
import { GeolocationProvider } from '@/context/GeolocationContext' // <--- Ajout ici
import '@/styles/index.css'

// ✅ Gestion du fallback OVH SPA
const redirectPath = sessionStorage.redirect
if (redirectPath) {
  delete sessionStorage.redirect
  // Remplace l'URL actuelle par celle demandée initialement
  window.history.replaceState(null, '', redirectPath)
}

// Récupère la div racine pour React
const rootElement = document.getElementById('root') as HTMLElement

// Monte l’application en mode Strict + GeolocationProvider
ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <GeolocationProvider>
      <App />
    </GeolocationProvider>
  </StrictMode>,
)
