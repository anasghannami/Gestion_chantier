import { Facture, Fournisseur, Chantier } from '../models/index.js';

export const getAllFactures = async (req, res, next) => {
  const { statut_paiement, chantier_id, fournisseur_id } = req.query;
  const where = {};

  if (statut_paiement) where.statut_paiement = statut_paiement;
  if (chantier_id) where.chantier_id = chantier_id;
  if (fournisseur_id) where.fournisseur_id = fournisseur_id;

  const factures = await Facture.findAll({
    where,
    include: [
      { model: Fournisseur, as: 'fournisseur', attributes: ['id', 'raison_sociale', 'code_fournisseur'] },
      { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }
    ]
  });
  res.json(factures);
};

export const getFactureById = async (req, res, next) => {
  const facture = await Facture.findByPk(req.params.id, {
    include: [
      { model: Fournisseur, as: 'fournisseur', attributes: ['id', 'raison_sociale', 'code_fournisseur'] },
      { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }
    ]
  });

  if (!facture) {
    return res.status(404).json({ message: 'Facture introuvable.' });
  }

  res.json(facture);
};

export const createFacture = async (req, res, next) => {
  const data = { ...req.body };
  const nullableFields = ['date_emission', 'date_echeance', 'montant_ht', 'montant_tva', 'montant_ttc', 'fournisseur_id', 'chantier_id'];
  nullableFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });

  const facture = await Facture.create(data);
  res.status(201).json(facture);
};

export const updateFacture = async (req, res, next) => {
  const facture = await Facture.findByPk(req.params.id);
  if (!facture) {
    return res.status(404).json({ message: 'Facture introuvable.' });
  }

  const data = { ...req.body };
  const nullableFields = ['date_emission', 'date_echeance', 'montant_ht', 'montant_tva', 'montant_ttc', 'fournisseur_id', 'chantier_id'];
  nullableFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });

  await facture.update(data);
  res.json(facture);
};

export const deleteFacture = async (req, res, next) => {
  const facture = await Facture.findByPk(req.params.id);
  if (!facture) {
    return res.status(404).json({ message: 'Facture introuvable.' });
  }
  await facture.destroy();
  res.json({ message: 'Facture supprimée avec succès.' });
};
