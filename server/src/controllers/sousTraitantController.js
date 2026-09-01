import { SousTraitant, ContratSousTraitance, Chantier } from '../models/index.js';
import { Op } from 'sequelize';
import { iLike } from '../utils/dbOps.js';

export const getAllSousTraitants = async (req, res, next) => {
  try {
    const { search, corps_etat, statut } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { nom_entreprise: { [iLike]: `%${search}%` } },
        { corps_etat: { [iLike]: `%${search}%` } },
        { nom_contact: { [iLike]: `%${search}%` } }
      ];
    }

    if (corps_etat) {
      where.corps_etat = corps_etat;
    }

    if (statut) {
      where.statut = statut;
    }

    const sousTraitants = await SousTraitant.findAll({
      where,
      include: [
        {
          model: ContratSousTraitance,
          as: 'contrats',
          include: [{ model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }]
        }
      ],
      order: [['nom_entreprise', 'ASC']]
    });

    res.json(sousTraitants);
  } catch (error) {
    next(error);
  }
};

export const getSousTraitantById = async (req, res, next) => {
  try {
    const sousTraitant = await SousTraitant.findByPk(req.params.id, {
      include: [
        {
          model: ContratSousTraitance,
          as: 'contrats',
          include: [{ model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }]
        }
      ]
    });

    if (!sousTraitant) {
      return res.status(404).json({ message: 'Sous-traitant introuvable.' });
    }

    res.json(sousTraitant);
  } catch (error) {
    next(error);
  }
};

export const createSousTraitant = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const nullableFields = ['nom_contact', 'telephone', 'email', 'adresse', 'siret_rc', 'assurance_decennale_numero', 'assurance_decennale_expiration', 'notes'];
    nullableFields.forEach(f => {
      if (data[f] === '') data[f] = null;
    });

    const sousTraitant = await SousTraitant.create(data);
    res.status(201).json(sousTraitant);
  } catch (error) {
    next(error);
  }
};

export const updateSousTraitant = async (req, res, next) => {
  try {
    const sousTraitant = await SousTraitant.findByPk(req.params.id);
    if (!sousTraitant) {
      return res.status(404).json({ message: 'Sous-traitant introuvable.' });
    }

    const data = { ...req.body };
    const nullableFields = ['nom_contact', 'telephone', 'email', 'adresse', 'siret_rc', 'assurance_decennale_numero', 'assurance_decennale_expiration', 'notes'];
    nullableFields.forEach(f => {
      if (data[f] === '') data[f] = null;
    });

    await sousTraitant.update(data);
    res.json(sousTraitant);
  } catch (error) {
    next(error);
  }
};

export const deleteSousTraitant = async (req, res, next) => {
  try {
    const sousTraitant = await SousTraitant.findByPk(req.params.id);
    if (!sousTraitant) {
      return res.status(404).json({ message: 'Sous-traitant introuvable.' });
    }
    await sousTraitant.destroy();
    res.json({ message: 'Sous-traitant supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};

export const createContrat = async (req, res, next) => {
  try {
    const { sous_traitant_id, chantier_id, objet_travaux, montant_ht, montant_ttc, date_debut, date_fin_prevue } = req.body;
    const contrat = await ContratSousTraitance.create({
      sous_traitant_id,
      chantier_id,
      objet_travaux,
      montant_ht: montant_ht || 0,
      montant_ttc: montant_ttc || 0,
      date_debut: date_debut || null,
      date_fin_prevue: date_fin_prevue || null,
      statut: 'En cours'
    });
    res.status(201).json(contrat);
  } catch (error) {
    next(error);
  }
};

export const deleteContrat = async (req, res, next) => {
  try {
    const contrat = await ContratSousTraitance.findByPk(req.params.id);
    if (!contrat) {
      return res.status(404).json({ message: 'Contrat introuvable.' });
    }
    await contrat.destroy();
    res.json({ message: 'Contrat supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};
