import { Ouvrier, Chantier } from '../models/index.js';

export const getAllOuvriers = async (req, res, next) => {
  const { specialite, statut, chantier_id } = req.query;
  const where = {};

  if (specialite) where.specialite = specialite;
  if (statut) where.statut = statut;
  if (chantier_id) where.chantier_id = chantier_id;

  const ouvriers = await Ouvrier.findAll({
    where,
    include: [
      { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }
    ]
  });
  res.json(ouvriers);
};

export const getOuvrierById = async (req, res, next) => {
  const ouvrier = await Ouvrier.findByPk(req.params.id, {
    include: [
      { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }
    ]
  });

  if (!ouvrier) {
    return res.status(404).json({ message: 'Ouvrier introuvable.' });
  }

  res.json(ouvrier);
};

export const createOuvrier = async (req, res, next) => {
  const data = { ...req.body };
  const nullableFields = ['chantier_id', 'tarif_journalier'];
  nullableFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });

  const ouvrier = await Ouvrier.create(data);
  res.status(201).json(ouvrier);
};

export const updateOuvrier = async (req, res, next) => {
  const ouvrier = await Ouvrier.findByPk(req.params.id);
  if (!ouvrier) {
    return res.status(404).json({ message: 'Ouvrier introuvable.' });
  }

  const data = { ...req.body };
  const nullableFields = ['chantier_id', 'tarif_journalier'];
  nullableFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });

  await ouvrier.update(data);
  res.json(ouvrier);
};

export const deleteOuvrier = async (req, res, next) => {
  const ouvrier = await Ouvrier.findByPk(req.params.id);
  if (!ouvrier) {
    return res.status(404).json({ message: 'Ouvrier introuvable.' });
  }
  await ouvrier.destroy();
  res.json({ message: 'Ouvrier supprimé avec succès.' });
};
