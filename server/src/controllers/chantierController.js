import { Chantier, Utilisateur, Commande, Facture, Ouvrier } from '../models/index.js';
import sequelize from '../config/database.js';

export const getAllChantiers = async (req, res, next) => {
  const chantiers = await Chantier.findAll({
    include: [
      { model: Utilisateur, as: 'chef_chantier', attributes: ['id', 'nom', 'prenom'] }
    ],
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(montant_ttc), 0)
            FROM commandes
            WHERE commandes.chantier_id = "Chantier"."id" AND commandes.statut != 'Annulée'
          )`),
          'budget_consomme'
        ]
      ]
    }
  });
  res.json(chantiers);
};

export const getChantierById = async (req, res, next) => {
  const chantier = await Chantier.findByPk(req.params.id, {
    include: [
      { model: Utilisateur, as: 'chef_chantier', attributes: ['id', 'nom', 'prenom'] },
      { model: Commande, as: 'commandes' },
      { model: Facture, as: 'factures' },
      { model: Ouvrier, as: 'ouvriers' }
    ],
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(montant_ttc), 0)
            FROM commandes
            WHERE commandes.chantier_id = "Chantier"."id" AND commandes.statut != 'Annulée'
          )`),
          'budget_consomme'
        ]
      ]
    }
  });

  if (!chantier) {
    return res.status(404).json({ message: 'Chantier introuvable.' });
  }

  res.json(chantier);
};

export const createChantier = async (req, res, next) => {
  const data = { ...req.body };
  const nullableFields = ['date_debut', 'date_fin_prevue', 'date_fin_reelle', 'budget_previsionnel', 'chef_chantier_id'];
  nullableFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });

  const chantier = await Chantier.create(data);
  res.status(201).json(chantier);
};

export const updateChantier = async (req, res, next) => {
  const chantier = await Chantier.findByPk(req.params.id);
  if (!chantier) {
    return res.status(404).json({ message: 'Chantier introuvable.' });
  }

  const data = { ...req.body };
  const nullableFields = ['date_debut', 'date_fin_prevue', 'date_fin_reelle', 'budget_previsionnel', 'chef_chantier_id'];
  nullableFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });

  await chantier.update(data);
  res.json(chantier);
};

export const deleteChantier = async (req, res, next) => {
  const chantier = await Chantier.findByPk(req.params.id);
  if (!chantier) {
    return res.status(404).json({ message: 'Chantier introuvable.' });
  }
  await chantier.destroy();
  res.json({ message: 'Chantier supprimé avec succès.' });
};
