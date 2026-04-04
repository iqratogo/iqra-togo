/**
 * IQRA TOGO — Service Email (Resend)
 * Centralise tous les envois d'emails transactionnels de l'application.
 */

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? "IQRA TOGO <noreply@iqra-togo.com>"
const ADMIN = process.env.EMAIL_ADMIN ?? "contact@iqra-togo.com"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://iqra-togo.com"

/* ─── Types email ────────────────────────────────────────────── */

type EmailType =
  | "default"     // transactionnel générique
  | "welcome"     // inscription réussie
  | "approved"    // profil validé
  | "rejected"    // demande refusée
  | "donation"    // merci pour le don
  | "newsletter"  // campagne newsletter
  | "alert"       // mot de passe / sécurité

const EMAIL_TYPE_CONFIG: Record<EmailType, {
  accentColor: string
  label: string
  badge: string
}> = {
  default:    { accentColor: "#22c55e", label: "",                    badge: "" },
  welcome:    { accentColor: "#22c55e", label: "Bienvenue",           badge: "&#127881;" },
  approved:   { accentColor: "#22c55e", label: "Demande approuvée",   badge: "&#10003;" },
  rejected:   { accentColor: "#6b7280", label: "Réponse à votre demande", badge: "&#8226;" },
  donation:   { accentColor: "#22c55e", label: "Merci pour votre don", badge: "&#10084;" },
  newsletter: { accentColor: "#22c55e", label: "Newsletter",          badge: "&#9993;" },
  alert:      { accentColor: "#f59e0b", label: "Sécurité du compte",  badge: "&#128274;" },
}

/* ─── Template de base ───────────────────────────────────────── */

function baseTemplate(content: string, previewText?: string, type: EmailType = "default"): string {
  const cfg = EMAIL_TYPE_CONFIG[type]
  const preview = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
    : ""

  const typeBadge = cfg.label
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:14px;">
        <tr>
          <td style="background-color:${cfg.accentColor}20;border-radius:20px;padding:5px 14px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${cfg.accentColor};letter-spacing:1px;text-transform:uppercase;">
              ${cfg.badge ? `${cfg.badge}&nbsp;` : ""}${cfg.label}
            </p>
          </td>
        </tr>
      </table>`
    : ""

  // Lien désabonnement uniquement pour les newsletters (l'ID est injecté à l'envoi)
  const unsubscribeBlock = type === "newsletter"
    ? `&nbsp;·&nbsp;<a href="${APP_URL}/newsletter/desabonnement?id={{SUBSCRIBER_ID}}" style="color:#c4c4c4;text-decoration:underline;">Se désabonner</a>`
    : ""

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no" />
  <meta name="color-scheme" content="light" />
  <title>IQRA TOGO</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    * { box-sizing: border-box; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .content-pad { padding: 28px 20px !important; }
      .footer-pad { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;">

  ${preview}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
    style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0"
          width="600" style="max-width:600px;width:100%;">

          <!-- Bande accent top -->
          <tr>
            <td style="background-color:${cfg.accentColor};height:4px;font-size:0;line-height:0;border-radius:12px 12px 0 0;">&nbsp;</td>
          </tr>

          <!-- HEADER -->
          <tr>
            <td style="background-color:#1a2b4a;padding:28px 40px 24px;" class="content-pad">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:2px;line-height:1;">IQRA TOGO</p>
              <div style="width:36px;height:3px;background-color:${cfg.accentColor};border-radius:2px;margin-top:8px;"></div>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:3px;text-transform:uppercase;">Le savoir, la liberté</p>
              ${typeBadge}
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 36px;" class="content-pad">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px 28px;border-radius:0 0 12px 12px;border-top:1px solid #e5e7eb;" class="footer-pad">
              <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;text-align:center;">
                <a href="${APP_URL}" style="color:#6b7280;text-decoration:none;">Site web</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/a-propos" style="color:#6b7280;text-decoration:none;">À propos</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/contact" style="color:#6b7280;text-decoration:none;">Contact</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/dons" style="color:#22c55e;font-weight:700;text-decoration:none;">Faire un don</a>
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:14px;">
                <tr><td style="border-top:1px solid #e5e7eb;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;text-align:center;line-height:1.7;">
                <strong style="color:#6b7280;">IQRA TOGO</strong> — Quartier Limamwa, Tchamba, Togo<br/>
                <a href="mailto:${ADMIN}" style="color:#9ca3af;text-decoration:none;">${ADMIN}</a>
              </p>
              <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#c4c4c4;text-align:center;line-height:1.6;">
                <a href="${APP_URL}/confidentialite" style="color:#c4c4c4;text-decoration:underline;">Politique de confidentialité</a>
                ${unsubscribeBlock}
                &nbsp;·&nbsp;© 2026 IQRA TOGO
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
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
    html: baseTemplate(content, "Cliquez pour réinitialiser votre mot de passe. Lien valide 1h.", "alert"),
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
    html: baseTemplate(content, `Votre dossier ${data.dossierNumber} est bien enregistré.`, "welcome"),
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
    html: baseTemplate(content, `Nouveau dossier à traiter : ${data.firstName} ${data.lastName}`, "alert"),
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
    html: baseTemplate(content, `Votre don de ${data.amount.toLocaleString("fr-FR")} FCFA a bien été reçu.`, "donation"),
  })
}

/* ─── Campagne newsletter ─────────────────────────────────────── */

export async function sendNewsletterCampaign(data: {
  recipients: { email: string; id: string }[]
  subject: string
  htmlContent: string
  previewText?: string
}) {
  if (data.recipients.length === 0) return { success: true, sent: 0 }

  const BATCH_SIZE = 100
  let sent = 0

  for (let i = 0; i < data.recipients.length; i += BATCH_SIZE) {
    const batch = data.recipients.slice(i, i + BATCH_SIZE)
    await resend.batch.send(
      batch.map(({ email, id }) => ({
        from: FROM,
        to: email,
        subject: data.subject,
        html: baseTemplate(data.htmlContent, data.previewText, "newsletter")
          .replace(/\{\{SUBSCRIBER_ID\}\}/g, id),
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
    html: baseTemplate(content, `Nouveau message de ${data.name} : ${data.subject}`, "alert"),
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
    html: baseTemplate(content, "Votre message a bien été reçu. Réponse sous 48h.", "default"),
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
    html: baseTemplate(content, `Votre adhésion est approuvée ! Numéro de membre : ${data.memberNumber}`, "approved"),
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
    html: baseTemplate(content, "Réponse concernant votre demande d'adhésion à IQRA TOGO.", "rejected"),
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
    html: baseTemplate(content, "Un clic pour confirmer votre inscription. Lien valide 48h.", "newsletter"),
  })
}
