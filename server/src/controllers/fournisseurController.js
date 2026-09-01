import { Fournisseur, Commande, Chantier } from '../models/index.js';
import { iLike } from '../utils/dbOps.js';

export const getAllFournisseurs = async (req, res, next) => {
  const { search, categorie } = req.query;
  const where = {};

  if (search) {
    where.raison_sociale = { [iLike]: `%${search}%` };
  }
  if (categorie) {
    where.categorie = categorie;
  }

  const fournisseurs = await Fournisseur.findAll({ where });
  res.json(fournisseurs);
};

export const getFournisseurById = async (req, res, next) => {
  const fournisseur = await Fournisseur.findByPk(req.params.id, {
    include: [
      { 
        model: Commande, 
        as: 'commandes',
        include: [{ model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }]
      }
    ]
  });

  if (!fournisseur) {
    return res.status(404).json({ message: 'Fournisseur introuvable.' });
  }

  res.json(fournisseur);
};

export const createFournisseur = async (req, res, next) => {
  const data = { ...req.body };
  const nullableFields = ['note', 'rc_if', 'conditions_paiement'];
  nullableFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });

  const fournisseur = await Fournisseur.create(data);
  res.status(201).json(fournisseur);
};

export const updateFournisseur = async (req, res, next) => {
  const fournisseur = await Fournisseur.findByPk(req.params.id);
  if (!fournisseur) {
    return res.status(404).json({ message: 'Fournisseur introuvable.' });
  }

  const data = { ...req.body };
  const nullableFields = ['note', 'rc_if', 'conditions_paiement'];
  nullableFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });

  await fournisseur.update(data);
  res.json(fournisseur);
};

export const deleteFournisseur = async (req, res, next) => {
  const fournisseur = await Fournisseur.findByPk(req.params.id);
  if (!fournisseur) {
    return res.status(404).json({ message: 'Fournisseur introuvable.' });
  }
  await fournisseur.destroy();
  res.json({ message: 'Fournisseur supprimé avec succès.' });
};
