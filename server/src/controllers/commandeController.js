import { Commande, Fournisseur, Chantier } from '../models/index.js';

export const getAllCommandes = async (req, res, next) => {
  const { statut, chantier_id, fournisseur_id } = req.query;
  const where = {};

  if (statut) where.statut = statut;
  if (chantier_id) where.chantier_id = chantier_id;
  if (fournisseur_id) where.fournisseur_id = fournisseur_id;

  const commandes = await Commande.findAll({
    where,
    include: [
      { model: Fournisseur, as: 'fournisseur', attributes: ['id', 'raison_sociale', 'code_fournisseur'] },
      { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }
    ]
  });
  res.json(commandes);
};

export const createCommande = async (req, res, next) => {
  const data = { ...req.body };
  const nullableFields = ['date_commande', 'date_livraison_prevue', 'montant_ht', 'montant_ttc', 'fournisseur_id', 'chantier_id'];
  nullableFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });

  const commande = await Commande.create(data);
  res.status(201).json(commande);
};

export const updateCommande = async (req, res, next) => {
  const commande = await Commande.findByPk(req.params.id);
  if (!commande) {
    return res.status(404).json({ message: 'Commande introuvable.' });
  }

  const data = { ...req.body };
  const nullableFields = ['date_commande', 'date_livraison_prevue', 'montant_ht', 'montant_ttc', 'fournisseur_id', 'chantier_id'];
  nullableFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });

  await commande.update(data);
  res.json(commande);
};

export const deleteCommande = async (req, res, next) => {
  const commande = await Commande.findByPk(req.params.id);
  if (!commande) {
    return res.status(404).json({ message: 'Commande introuvable.' });
  }
  await commande.destroy();
  res.json({ message: 'Commande supprimée avec succès.' });
};
