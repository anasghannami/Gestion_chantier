import jwt from 'jsonwebtoken';
import Utilisateur from '../models/Utilisateur.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await Utilisateur.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré.', error: error.message });
  }
};
