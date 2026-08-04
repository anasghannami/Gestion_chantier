import { Facture, Fournisseur, Chantier, PaiementFacture, Devis, Societe } from '../models/index.js';

export const getAllFactures = async (req, res, next) => {
  try {
    const { statut_paiement, chantier_id, fournisseur_id } = req.query;
    const where = {};

    if (statut_paiement) where.statut_paiement = statut_paiement;
    if (chantier_id) where.chantier_id = chantier_id;
    if (fournisseur_id) where.fournisseur_id = fournisseur_id;

    const factures = await Facture.findAll({
      where,
      include: [
        { model: Fournisseur, as: 'fournisseur', attributes: ['id', 'raison_sociale', 'code_fournisseur'] },
        { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] },
        { model: PaiementFacture, as: 'paiements' }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transformer pour calculer le montant payé et le reste à payer
    const result = factures.map(f => {
      const paiements = f.paiements || [];
      const totalPaye = paiements.reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);
      const montantTtc = parseFloat(f.montant_ttc || 0);
      const resteAPayer = Math.max(0, montantTtc - totalPaye);

      return {
        ...f.toJSON(),
        total_paye: totalPaye,
        reste_a_payer: resteAPayer
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getFactureById = async (req, res, next) => {
  try {
    const facture = await Facture.findByPk(req.params.id, {
      include: [
        { model: Fournisseur, as: 'fournisseur', attributes: ['id', 'raison_sociale', 'code_fournisseur'] },
        { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] },
        { model: PaiementFacture, as: 'paiements' }
      ]
    });

    if (!facture) {
      return res.status(404).json({ message: 'Facture introuvable.' });
    }

    const paiements = facture.paiements || [];
    const totalPaye = paiements.reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);
    const montantTtc = parseFloat(facture.montant_ttc || 0);
    const resteAPayer = Math.max(0, montantTtc - totalPaye);

    res.json({
      ...facture.toJSON(),
      total_paye: totalPaye,
      reste_a_payer: resteAPayer
    });
  } catch (error) {
    next(error);
  }
};

export const createFacture = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const nullableFields = ['date_emission', 'date_echeance', 'montant_ht', 'montant_tva', 'montant_ttc', 'fournisseur_id', 'chantier_id', 'devis_id'];
    nullableFields.forEach(field => {
      if (data[field] === '') {
        data[field] = null;
      }
    });

    if (!data.num_facture) {
      const count = await Facture.count();
      const currentYear = new Date().getFullYear();
      data.num_facture = `FAC-${currentYear}-${String(count + 1).padStart(3, '0')}`;
    }

    const facture = await Facture.create(data);
    res.status(201).json(facture);
  } catch (error) {
    next(error);
  }
};

export const createFactureAcompte = async (req, res, next) => {
  try {
    const { devis_id, pourcentage_acompte } = req.body;
    const devis = await Devis.findByPk(devis_id);

    if (!devis) {
      return res.status(404).json({ message: 'Devis introuvable.' });
    }

    const pct = parseFloat(pourcentage_acompte || 30);
    const totalHtDevis = parseFloat(devis.total_ht || 0);
    const totalTtcDevis = parseFloat(devis.total_ttc || 0);

    const montantHtAcompte = Math.round((totalHtDevis * (pct / 100)) * 100) / 100;
    const montantTtcAcompte = Math.round((totalTtcDevis * (pct / 100)) * 100) / 100;
    const montantTvaAcompte = Math.round((montantTtcAcompte - montantHtAcompte) * 100) / 100;

    const count = await Facture.count();
    const currentYear = new Date().getFullYear();
    const numFacture = `FAC-ACP-${currentYear}-${String(count + 1).padStart(3, '0')}`;

    const dateEmission = new Date().toISOString().split('T')[0];
    const dateEcheance = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const factureAcompte = await Facture.create({
      num_facture: numFacture,
      devis_id: devis.id,
      chantier_id: devis.chantier_id,
      client_nom: devis.client_nom,
      type_facture: 'Acompte',
      pourcentage_acompte: pct,
      date_emission: dateEmission,
      date_echeance: dateEcheance,
      montant_ht: montantHtAcompte,
      montant_tva: montantTvaAcompte,
      montant_ttc: montantTtcAcompte,
      statut_paiement: 'En attente'
    });

    res.status(201).json(factureAcompte);
  } catch (error) {
    next(error);
  }
};

export const addPaiement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date_paiement, montant, mode_paiement, reference, notes } = req.body;

    const facture = await Facture.findByPk(id, {
      include: [{ model: PaiementFacture, as: 'paiements' }]
    });

    if (!facture) {
      return res.status(404).json({ message: 'Facture introuvable.' });
    }

    const nouveauPaiement = await PaiementFacture.create({
      facture_id: facture.id,
      date_paiement: date_paiement || new Date().toISOString().split('T')[0],
      montant: parseFloat(montant),
      mode_paiement: mode_paiement || 'Virement',
      reference: reference || null,
      notes: notes || null
    });

    // Recalculer le statut de paiement
    const tousPaiements = await PaiementFacture.findAll({ where: { facture_id: facture.id } });
    const totalPaye = tousPaiements.reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);
    const montantTtc = parseFloat(facture.montant_ttc || 0);

    let nouveauStatut = 'En attente';
    if (totalPaye >= montantTtc) {
      nouveauStatut = 'Payée';
    } else if (totalPaye > 0) {
      nouveauStatut = 'Partiellement payée';
    }

    await facture.update({ statut_paiement: nouveauStatut });

    res.status(201).json({
      paiement: nouveauPaiement,
      statut_paiement: nouveauStatut,
      total_paye: totalPaye,
      reste_a_payer: Math.max(0, montantTtc - totalPaye)
    });
  } catch (error) {
    next(error);
  }
};

export const deletePaiement = async (req, res, next) => {
  try {
    const paiement = await PaiementFacture.findByPk(req.params.paiementId);
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement introuvable.' });
    }

    const factureId = paiement.facture_id;
    await paiement.destroy();

    // Recalculer statut de la facture
    const facture = await Facture.findByPk(factureId);
    if (facture) {
      const tousPaiements = await PaiementFacture.findAll({ where: { facture_id: factureId } });
      const totalPaye = tousPaiements.reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);
      const montantTtc = parseFloat(facture.montant_ttc || 0);

      let nouveauStatut = 'En attente';
      if (totalPaye >= montantTtc) {
        nouveauStatut = 'Payée';
      } else if (totalPaye > 0) {
        nouveauStatut = 'Partiellement payée';
      }

      await facture.update({ statut_paiement: nouveauStatut });
    }

    res.json({ message: 'Paiement supprimé.' });
  } catch (error) {
    next(error);
  }
};

export const updateFacture = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

export const deleteFacture = async (req, res, next) => {
  try {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: 'Facture introuvable.' });
    }
    await facture.destroy();
    res.json({ message: 'Facture supprimée avec succès.' });
  } catch (error) {
    next(error);
  }
};
