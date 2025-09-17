/**
 * oqq_backend/utils/email.ts
 *
 * Fonction utilitaire d’envoi d’email transactionnel (reset password, version mock)
 * - Fonctionne en local : log console pour les tests (aucun email réel envoyé)
 * - À remplacer par une intégration SMTP Nodemailer pour OVH en production
 * - Aucune donnée sensible stockée ou transmise (RGPD ready)
 *
 * Usage :
 *   await sendResetPasswordEmail(email, token)
 *   // email : email de l'utilisateur
 *   // token : token unique pour réinitialisation du mot de passe
 */

export async function sendResetPasswordEmail(email: string, token: string) {
  // En production, personnaliser l’URL de reset pour pointer vers le frontend/public réel
  const resetUrl = `https://ouquandquoi.fr/reset-password?email=${encodeURIComponent(email)}&token=${token}`;

  // MOCK (développement uniquement) : affichage console (aucun email envoyé)
  console.log(`\n[MOCK EMAIL] ----
À : ${email}
Sujet : Réinitialisation de votre mot de passe

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe sur oùquandquoi.fr.

Cliquez sur ce lien pour choisir un nouveau mot de passe :
${resetUrl}

Ce lien expirera dans 30 minutes.

Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.

— L’équipe oùquandquoi.fr
--------------------------\n`);

  // --- Pour la production réelle ---
  // Remplacer ce bloc par un envoi SMTP via nodemailer, exemple :
  // import nodemailer from "nodemailer";
  // const transporter = nodemailer.createTransport({ ...config OVH SMTP... });
  // await transporter.sendMail({
  //   from: "no-reply@ouquandquoi.fr",
  //   to: email,
  //   subject: "Réinitialisation de votre mot de passe",
  //   text: ...,
  //   html: ...
  // });
}
