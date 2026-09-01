import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Utilisateur from '../models/Utilisateur.js';
import { sendResetCodeEmail } from '../utils/mailer.js';

export const login = async (req, res, next) => {
  const { email, mot_de_passe } = req.body;
  
  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  const user = await Utilisateur.findOne({ where: { email } });
  if (!user || user.statut !== 'Actif') {
    return res.status(401).json({ message: 'Identifiants invalides ou compte inactif.' });
  }

  const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Identifiants invalides.' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  user.last_login = new Date();
  await user.save();

  const { mot_de_passe_hash, ...userWithoutPassword } = user.toJSON();

  res.json({
    token,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role
    }
  });
};

export const getMe = async (req, res, next) => {
  const { mot_de_passe_hash, ...user } = req.user.toJSON();
  res.json({ user });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Veuillez saisir votre adresse email.' });
    }

    const user = await Utilisateur.findOne({ where: { email } });
    if (!user || user.statut !== 'Actif') {
      return res.json({ 
        message: 'Si cette adresse email correspond à un compte actif, vous allez recevoir les instructions de réinitialisation.' 
      });
    }

    // Générer un code à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes d'expiration

    user.reset_token = resetCode;
    user.reset_token_expires = expires;
    await user.save();

    console.log(`[AUTH] Code de réinitialisation pour ${email}: ${resetCode}`);

    // Tentative d'envoi par e-mail direct (Gmail)
    const emailResult = await sendResetCodeEmail(email, resetCode);

    let responseMessage = 'Un e-mail contenant le code de réinitialisation à 6 chiffres vous a été envoyé.';
    if (emailResult.simulated) {
      responseMessage = 'Un code de réinitialisation à 6 chiffres a été généré.';
    }

    return res.json({
      message: responseMessage
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'L\'email et le code de vérification sont requis.' });
    }

    const user = await Utilisateur.findOne({ where: { email } });
    if (!user || !user.reset_token || user.reset_token !== code) {
      return res.status(400).json({ message: 'Code de vérification invalide ou incorrect.' });
    }

    if (new Date() > new Date(user.reset_token_expires)) {
      return res.status(400).json({ message: 'Le code a expiré. Veuillez en demander un nouveau.' });
    }

    return res.json({ message: 'Code de vérification validé avec succès.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Tous les champs (email, code, nouveau mot de passe) sont requis.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
    }

    const user = await Utilisateur.findOne({ where: { email } });
    if (!user || !user.reset_token || user.reset_token !== code) {
      return res.status(400).json({ message: 'Code de réinitialisation invalide ou incorrect.' });
    }

    if (new Date() > new Date(user.reset_token_expires)) {
      return res.status(400).json({ message: 'Le code de réinitialisation a expiré. Veuillez en demander un nouveau.' });
    }

    // Mise à jour du mot de passe
    const hash = await bcrypt.hash(newPassword, 10);
    user.mot_de_passe_hash = hash;
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    return res.json({ message: 'Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.' });
  } catch (error) {
    next(error);
  }
};
