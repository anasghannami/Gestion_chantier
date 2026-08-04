import { Societe } from '../models/index.js';

export const getSociete = async (req, res, next) => {
  try {
    let societe = await Societe.findOne();
    if (!societe) {
      societe = await Societe.create({
        nom: 'BTP MANAGER SARL',
        adresse: '123 Boulevard Mohammed V, Casablanca, Maroc',
        telephone: '+212 5 22 00 00 00',
        email: 'contact@btpmanager.ma',
        ice: '001234567000089',
        if_fiscal: '45678901',
        patente: '12345678',
        rc: '234567',
        capital: '100 000 MAD',
        banque: 'Attijariwafa Bank',
        rib: '007 780 0001234567890123 45'
      });
    }
    res.json(societe);
  } catch (error) {
    next(error);
  }
};

export const updateSociete = async (req, res, next) => {
  try {
    let societe = await Societe.findOne();
    if (!societe) {
      societe = await Societe.create(req.body);
    } else {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.logo = `/uploads/${req.file.filename}`;
      }
      await societe.update(updateData);
    }
    res.json({ message: 'Coordonnées de la société mises à jour avec succès.', societe });
  } catch (error) {
    next(error);
  }
};
