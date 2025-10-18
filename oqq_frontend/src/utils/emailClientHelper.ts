// ==========================================================
// FILE : src/utils/emailClientHelper.ts
// Utilitaire pour détecter et ouvrir le bon client email
// - Détection automatique du fournisseur d'email
// - Génération d'URLs de webmail (Gmail, Outlook, Yahoo, etc.)
// - Support du mailto: classique en fallback
// ==========================================================

export type EmailClientType = 'gmail' | 'outlook' | 'yahoo' | 'default'

/**
 * Détecte automatiquement le fournisseur d'email à partir de l'adresse
 */
export function detectEmailProvider(email: string): EmailClientType {
  if (!email) return 'default'
  
  const domain = email.toLowerCase().split('@')[1]
  
  if (!domain) return 'default'
  
  // Gmail et domaines Google
  if (domain.includes('gmail.com') || domain.includes('googlemail.com')) {
    return 'gmail'
  }
  
  // Outlook, Hotmail, Live, MSN
  if (
    domain.includes('outlook.com') ||
    domain.includes('hotmail.com') ||
    domain.includes('live.com') ||
    domain.includes('msn.com')
  ) {
    return 'outlook'
  }
  
  // Yahoo
  if (domain.includes('yahoo.com') || domain.includes('yahoo.fr')) {
    return 'yahoo'
  }
  
  // Par défaut, utiliser mailto:
  return 'default'
}

/**
 * Génère l'URL pour ouvrir le webmail approprié avec un email pré-rempli
 */
export function generateEmailShareUrl(
  clientType: EmailClientType,
  subject: string,
  body: string,
  to: string = ''
): string {
  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = encodeURIComponent(body)
  const encodedTo = to ? encodeURIComponent(to) : ''
  
  switch (clientType) {
    case 'gmail':
      // Gmail compose URL
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`
    
    case 'outlook':
      // Outlook.com compose URL
      return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`
    
    case 'yahoo':
      // Yahoo Mail compose URL
      return `https://compose.mail.yahoo.com/?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`
    
    case 'default':
    default:
      // Mailto fallback
      return `mailto:${encodedTo}?subject=${encodedSubject}&body=${encodedBody}`
  }
}

/**
 * Ouvre le client email approprié
 */
export function openEmailClient(
  clientType: EmailClientType,
  subject: string,
  body: string,
  to: string = ''
): void {
  const url = generateEmailShareUrl(clientType, subject, body, to)
  
  // Pour les webmails (Gmail, Outlook, Yahoo), ouvrir dans un nouvel onglet
  if (clientType !== 'default') {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    // Pour mailto:, utiliser window.location
    window.location.href = url
  }
}

/**
 * Obtient le label lisible pour un type de client email
 */
export function getEmailClientLabel(clientType: EmailClientType): string {
  switch (clientType) {
    case 'gmail':
      return 'Gmail'
    case 'outlook':
      return 'Outlook / Hotmail'
    case 'yahoo':
      return 'Yahoo Mail'
    case 'default':
      return 'Application mail par défaut'
    default:
      return 'Par défaut'
  }
}
