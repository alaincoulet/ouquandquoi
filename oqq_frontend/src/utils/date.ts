/**
 * src/utils/date.ts
 * Utilitaires de gestion de dates pour oùquandquoi.fr
 * - parseDate : parse une date ISO ou un format FR "JJ/MM/AAAA"
 * - parseWhen : parse un champ "when" de type "JJ/MM/AAAA - JJ/MM/AAAA" (ou simple date)
 * - periodsOverlap : détermine si deux périodes (date de début/fin) se chevauchent
 *
 * ⚠️ A11y/UX : ces fonctions n'ont pas d'impact UI direct mais garantissent un filtrage cohérent.
 * 🧪 À couvrir par tests unitaires si une suite de tests est présente.
 */

export function parseDate(str: string): Date | undefined {
  if (!str) return undefined;

  // 1) ISO ou formats reconnus par Date()
  const iso = new Date(str);
  if (!isNaN(iso.getTime())) return iso;

  // 2) Format "JJ/MM/AAAA" (ou "AAAA/MM/JJ" par heuristique)
  const parts = str.trim().split(/[\/\-\.]/).map(Number);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    // Heuristique simple : si a > 31 on suppose AAAA/MM/JJ
    if (a > 31) return new Date(a, b - 1, c);
    // Sinon on suppose JJ/MM/AAAA
    return new Date(c, b - 1, a);
  }

  return undefined;
}

/**
 * Parse un champ "when" texte en période { from, to }
 * - Accepte : "JJ/MM/AAAA" OU "JJ/MM/AAAA - JJ/MM/AAAA"
 * - Tolère les tirets typographiques (– — −)
 */
export function parseWhen(str: string): { from: Date; to: Date } | undefined {
  if (!str) return undefined;
  const parts = str.replace(/[–—−]/g, "-").split("-").map(s => s.trim()).filter(Boolean);
  if (!parts[0]) return undefined;

  const from = parseDate(parts[0]);
  const to = parts[1] ? parseDate(parts[1]) : from;

  if (!from || !to) return undefined;
  return { from, to };
}

/**
 * periodsOverlap
 * - Retourne true si [aStart, aEnd] et [bStart, bEnd] se chevauchent
 */
export function periodsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}
