/**
 * IQRA TOGO — Service Email (Resend)
 * Centralise tous les envois d'emails transactionnels de l'application.
 */

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? "IQRA TOGO <noreply@iqra-togo.com>"
const ADMIN = process.env.EMAIL_ADMIN ?? "contact@iqra-togo.com"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://iqra-togo.com"

/* ─── Helpers HTML ─────────────────────────────────────────── */

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IQRA TOGO</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1a2b4a;padding:28px 40px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:1px;">IQRA TOGO</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Le savoir, la liberté</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:36px 40px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              © IQRA TOGO — Quartier Limamwa, Tchamba, Togo<br/>
              <a href="${APP_URL}" style="color:#22c55e;text-decoration:none;">${APP_URL}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/* ─── Reset password ─────────────────────────────────────────── */

export async function sendPasswordReset(data: { email: string; token: string }) {
  const resetUrl = `${APP_URL}/auth/reset-password/${data.token}`
  const content = `
    <h2 style="margin:0 0 12px;color:#1a2b4a;font-size:20px;">Réinitialisation de votre mot de passe</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
      Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous.<br/>
      Ce lien est valide pendant <strong>1 heure</strong>.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${resetUrl}" style="background:#1a2b4a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">
        Réinitialiser mon mot de passe
      </a>
    </p>
    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
      Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe reste inchangé.
    </p>
  `
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "Réinitialisation de votre mot de passe — IQRA TOGO",
    html: baseTemplate(content),
  })
}

/* ─── Inscription : bienvenue + accusé admin ──────────────────── */

export async function sendWelcomeEmail(data: {
  email: string
  firstName: string
  dossierNumber: string
}) {
  const content = `
    <h2 style="margin:0 0 12px;color:#1a2b4a;font-size:20px;">Bienvenue, ${data.firstName} !</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
      Votre demande d'adhésion à <strong>IQRA TOGO</strong> a bien été reçue.<br/>
      Votre numéro de dossier est : <strong style="color:#22c55e;">${data.dossierNumber}</strong>
    </p>
    <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
      Notre équipe va examiner votre dossier et vous contactera dans les meilleurs délais (5 à 10 jours ouvrés).
    </p>
    <a href="${APP_URL}" style="background:#22c55e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block;">
      Visiter notre site
    </a>
  `
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Demande d'adhésion reçue (${data.dossierNumber}) — IQRA TOGO`,
    html: baseTemplate(content),
  })
}

export async function sendNewApplicationAdmin(data: {
  firstName: string
  lastName: string
  email: string
  dossierNumber: string
}) {
  const content = `
    <h2 style="margin:0 0 20px;color:#1a2b4a;font-size:20px;">Nouvelle demande d'adhésion</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:160px;">Dossier</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#22c55e;font-size:14px;font-weight:700;">${data.dossierNumber}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Nom</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:600;">${data.firstName} ${data.lastName}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;font-size:13px;">Email</td>
        <td style="padding:10px 0;color:#111827;font-size:14px;"><a href="mailto:${data.email}" style="color:#22c55e;">${data.email}</a></td>
      </tr>
    </table>
    <p style="margin:24px 0 0;">
      <a href="${APP_URL}/dashboard/membres" style="background:#1a2b4a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;display:inline-block;">
        Gérer les candidatures
      </a>
    </p>
  `
  return resend.emails.send({
    from: FROM,
    to: ADMIN,
    subject: `[Adhésion] Nouveau dossier ${data.dossierNumber} — ${data.firstName} ${data.lastName}`,
    html: baseTemplate(content),
  })
}

/* ─── Remerciement don ───────────────────────────────────────── */

export async function sendDonationThankYou(data: {
  email: string
  firstName: string
  amount: number
  affectation: string
}) {
  const content = `
    <h2 style="margin:0 0 12px;color:#1a2b4a;font-size:20px;">Merci pour votre générosité, ${data.firstName} !</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
      Votre don de <strong style="color:#22c55e;">${data.amount.toLocaleString("fr-FR")} FCFA</strong>
      destiné à <strong>${data.affectation}</strong> a bien été reçu.<br/>
      Grâce à vous, IQRA TOGO peut continuer à accompagner les enfants et familles togolaises.
    </p>
    <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
      Un reçu fiscal est disponible sur simple demande à
      <a href="mailto:${ADMIN}" style="color:#22c55e;">${ADMIN}</a>.
    </p>
    <a href="${APP_URL}/a-propos" style="background:#22c55e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block;">
      Découvrir nos programmes
    </a>
  `
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Merci pour votre don de ${data.amount.toLocaleString("fr-FR")} FCFA — IQRA TOGO`,
    html: baseTemplate(content),
  })
}

/* ─── Campagne newsletter ─────────────────────────────────────── */

export async function sendNewsletterCampaign(data: {
  emails: string[]
  subject: string
  htmlContent: string
  previewText?: string
}) {
  if (data.emails.length === 0) return { success: true, sent: 0 }

  // Resend batch : max 100 emails par appel
  const BATCH_SIZE = 100
  let sent = 0

  for (let i = 0; i < data.emails.length; i += BATCH_SIZE) {
    const batch = data.emails.slice(i, i + BATCH_SIZE)
    await resend.batch.send(
      batch.map((to) => ({
        from: FROM,
        to,
        subject: data.subject,
        html: baseTemplate(data.htmlContent),
      }))
    )
    sent += batch.length
  }

  return { success: true, sent }
}

/* ─── Contact : notification admin ───────────────────────────── */

export async function sendContactNotification(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const content = `
    <h2 style="margin:0 0 20px;color:#1a2b4a;font-size:20px;">Nouveau message de contact</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:120px;">Nom</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:600;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Email</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;">
          <a href="mailto:${data.email}" style="color:#22c55e;">${data.email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Sujet</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;">${data.subject}</td>
      </tr>
    </table>
    <h3 style="margin:24px 0 10px;color:#1a2b4a;font-size:15px;">Message</h3>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.message}</div>
    <p style="margin:24px 0 0;">
      <a href="mailto:${data.email}" style="background:#22c55e;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;display:inline-block;">
        Répondre à ${data.name}
      </a>
    </p>
  `
  return resend.emails.send({
    from: FROM,
    to: ADMIN,
    replyTo: data.email,
    subject: `[Contact] ${data.subject} — ${data.name}`,
    html: baseTemplate(content),
  })
}

/* ─── Contact : accusé de réception ──────────────────────────── */

export async function sendContactConfirmation(data: {
  name: string
  email: string
  subject: string
}) {
  const content = `
    <h2 style="margin:0 0 12px;color:#1a2b4a;font-size:20px;">Message bien reçu, ${data.name} !</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
      Merci pour votre message concernant <strong>${data.subject}</strong>.<br/>
      Notre équipe vous répondra dans les meilleurs délais (généralement sous 48h ouvrées).
    </p>
    <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
      En attendant, n'hésitez pas à découvrir nos programmes et à nous suivre sur les réseaux sociaux.
    </p>
    <a href="${APP_URL}" style="background:#1a2b4a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block;">
      Visiter notre site
    </a>
  `
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "Nous avons bien reçu votre message — IQRA TOGO",
    html: baseTemplate(content),
  })
}

/* ─── Candidature : approbation / refus ──────────────────────── */

export async function sendApplicationApproved(data: {
  email: string
  firstName: string
  memberNumber: string
}) {
  const content = `
    <h2 style="margin:0 0 12px;color:#1a2b4a;font-size:20px;">Félicitations, ${data.firstName} !</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
      Votre demande d'adhésion à <strong>IQRA TOGO</strong> a été <strong style="color:#22c55e;">approuvée</strong>.<br/>
      Vous êtes désormais membre de notre association.
    </p>
    <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
      Votre numéro de membre : <strong style="color:#22c55e;font-size:18px;">${data.memberNumber}</strong>
    </p>
    <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
      Vous pouvez dès maintenant accéder à votre espace membre et consulter vos informations.
    </p>
    <a href="${APP_URL}/dashboard/membre" style="background:#22c55e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block;">
      Accéder à mon espace membre
    </a>
  `
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Bienvenue au sein d'IQRA TOGO — Adhésion approuvée`,
    html: baseTemplate(content),
  })
}

export async function sendApplicationRejected(data: {
  email: string
  firstName: string
  reason?: string
}) {
  const reasonBlock = data.reason
    ? `<p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
        Motif : <em>${data.reason}</em>
       </p>`
    : ""
  const content = `
    <h2 style="margin:0 0 12px;color:#1a2b4a;font-size:20px;">Chère/Cher ${data.firstName},</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
      Après examen attentif de votre dossier, nous sommes au regret de vous informer que votre demande
      d'adhésion à <strong>IQRA TOGO</strong> n'a pas pu être retenue à ce stade.
    </p>
    ${reasonBlock}
    <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
      Vous pouvez renouveler votre candidature ultérieurement ou nous contacter pour plus d'informations.
    </p>
    <a href="mailto:${ADMIN}" style="background:#1a2b4a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block;">
      Nous contacter
    </a>
  `
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Réponse à votre demande d'adhésion — IQRA TOGO`,
    html: baseTemplate(content),
  })
}

/* ─── Newsletter : double opt-in ─────────────────────────────── */

export async function sendNewsletterConfirmation(data: {
  email: string
  confirmToken: string
}) {
  const confirmUrl = `${APP_URL}/newsletter/confirmer?token=${data.confirmToken}`
  const content = `
    <h2 style="margin:0 0 12px;color:#1a2b4a;font-size:20px;">Confirmez votre inscription</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
      Merci de vous être inscrit à la newsletter d'IQRA TOGO.<br/>
      Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre inscription.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${confirmUrl}" style="background:#22c55e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">
        Confirmer mon inscription
      </a>
    </p>
    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
      Si vous n'avez pas demandé cette inscription, ignorez simplement cet email.<br/>
      Ce lien expire dans 48 heures.
    </p>
  `
  return resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "Confirmez votre inscription à la newsletter IQRA TOGO",
    html: baseTemplate(content),
  })
}
