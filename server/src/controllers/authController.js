import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Utilisateur from '../models/Utilisateur.js';

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
