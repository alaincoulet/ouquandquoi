// ===================================================
// FICHIER : src/utils/index.ts
// Helpers utilitaires pour tout le projet
// Projet : oùquandquoi.fr
// ===================================================

/**
 * Met la première lettre d'une chaîne en majuscule
 * Exemple : "pau" → "Pau"
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Transforme une chaîne en "slug" URL-friendly
 * Exemple : "Fête du Village" → "fete-du-village"
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD') // enlève les accents
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // remplace les non-alphanumériques
    .replace(/^-+|-+$/g, '') // supprime les tirets en trop
}

/**
 * Convertit une date ISO (YYYY-MM-DD) en format lisible FR
 * Exemple : "2025-07-26" → "26 juillet 2025"
 */
export function formatDateFR(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
