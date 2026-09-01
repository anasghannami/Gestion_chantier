import nodemailer from 'nodemailer';

/**
 * Configuration du transporteur Nodemailer pour l'envoi d'e-mails (Gmail)
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('[MAILER] ATTENTION: EMAIL_USER ou EMAIL_PASS n\'est pas renseigné dans server/.env');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass
    }
  });
};

/**
 * Envoie un e-mail avec le code de réinitialisation de mot de passe à 6 chiffres
 * 
 * @param {string} toEmail - Adresse du destinataire
 * @param {string} code - Code à 6 chiffres
 */
export const sendResetCodeEmail = async (toEmail, code) => {
  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
        .header { background: linear-[#0284C7], #0369A1; background-color: #0284C7; padding: 25px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 30px 25px; text-align: center; }
        .code-box { background: #f0f9ff; border: 2px dashed #0284C7; border-radius: 10px; padding: 20px; margin: 25px 0; display: inline-block; width: 80%; }
        .code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284C7; margin: 0; }
        .notice { font-size: 13px; color: #6b7280; margin-top: 15px; }
        .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏗️ Gestion de Chantier BTP</h1>
        </div>
        <div class="content">
          <h2>Demande de réinitialisation</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour accéder à votre espace.</p>
          <p>Voici votre code de vérification :</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>

          <p class="notice">⏰ Ce code est valide pendant <strong>15 minutes</strong>.<br>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Gestion de Chantier BTP. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[MAILER SIMULÉ] Code pour ${toEmail} : ${code}`);
    return { success: false, simulated: true, reason: 'Variables EMAIL_USER / EMAIL_PASS non configurées' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Gestion Chantier BTP" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `🔑 Code de réinitialisation : ${code} - Gestion de Chantier BTP`,
      html: htmlContent
    });

    console.log(`[MAILER] E-mail envoyé avec succès à ${toEmail} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[MAILER ERREUR] Échec de l'envoi d'e-mail à ${toEmail} :`, error.message);
    return { success: false, error: error.message };
  }
};
