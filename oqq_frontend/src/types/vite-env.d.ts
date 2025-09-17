/**
 * Déclarations globales de types pour le projet oùquandquoi.fr
 * -----------------------------------------------------------
 * - Permet l'import d'images (SVG, PNG, JPG, JPEG, WEBP) dans les composants React.
 * - Charge les types Vite (client) pour intellisense et transpilation.
 * - Déclare les variables d'environnement accessibles via import.meta.env.
 * - Fichier à ne placer qu'à la racine ou dans src/, jamais ailleurs.
 */

/// <reference types="vite/client" />

// Types pour les imports d'images dans React
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

// Types d'environnement Vite (variables import.meta.env)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly MODE: string; // 
  // Ajoute ici d'autres variables Vite si besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Permet d'importer des fichiers CSS (ex: import 'klaro/dist/klaro.css')
declare module '*.css';

// Permet d'importer 'klaro' en JS sans typage officiel (évite l'erreur sur klaro)
declare module 'klaro' {
  const whatever: any;
  export default whatever;
}
