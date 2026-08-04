import { Devis, DevisLigne, Chantier, Facture, Fournisseur } from '../models/index.js';
import { Op } from 'sequelize';

// Helper pour générer un numéro de devis auto et unique (ex: DEV-2026-001)
const generateNumDevis = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Devis.count();
  let nextNum = count + 1;
  let candidateNum = `DEV-${currentYear}-${nextNum.toString().padStart(3, '0')}`;
  
  let exists = await Devis.findOne({ where: { num_devis: candidateNum } });
  while (exists) {
    nextNum++;
    candidateNum = `DEV-${currentYear}-${nextNum.toString().padStart(3, '0')}`;
    exists = await Devis.findOne({ where: { num_devis: candidateNum } });
  }
  
  return candidateNum;
};

export const getAllDevis = async (req, res, next) => {
  try {
    const { statut, search } = req.query;
    const where = {};

    if (statut) {
      where.statut = statut;
    }

    if (search) {
      where[Op.or] = [
        { client_nom: { [Op.iLike]: `%${search}%` } },
        { num_devis: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const devisList = await Devis.findAll({
      where,
      include: [
        { model: DevisLigne, as: 'lignes' },
        { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(devisList);
  } catch (error) {
    console.error("Erreur getAllDevis:", error);
    next(error);
  }
};

export const getDevisById = async (req, res, next) => {
  try {
    const devis = await Devis.findByPk(req.params.id, {
      include: [
        { model: DevisLigne, as: 'lignes' },
        { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }
      ]
    });

    if (!devis) {
      return res.status(404).json({ message: 'Devis introuvable.' });
    }

    res.json(devis);
  } catch (error) {
    console.error("Erreur getDevisById:", error);
    next(error);
  }
};

export const createDevis = async (req, res, next) => {
  try {
    const {
      client_nom,
      client_email,
      client_telephone,
      client_adresse,
      chantier_id,
      statut,
      date_creation,
      date_validite,
      tva,
      notes,
      lignes = []
    } = req.body;

    const num_devis = req.body.num_devis || await generateNumDevis();

    // Calcul des totaux des lignes
    let montant_ht = 0;
    const preparedLignes = lignes.map(line => {
      const qty = parseFloat(line.quantite) || 0;
      const pu = parseFloat(line.prix_unitaire) || 0;
      const total = qty * pu;
      montant_ht += total;
      return {
        designation: line.designation || 'Prestation',
        quantite: qty,
        unite: line.unite || 'u',
        prix_unitaire: pu,
        total_ligne: total
      };
    });

    const tvaRate = (tva !== undefined && tva !== null && tva !== '') ? parseFloat(tva) : 0.00;
    const montant_ttc = tvaRate > 0 ? montant_ht * (1 + tvaRate / 100) : montant_ht;

    const cleanDateCreation = (date_creation && date_creation !== '')
      ? date_creation
      : new Date().toISOString().split('T')[0];

    const cleanDateValidite = (date_validite && date_validite !== '')
      ? date_validite
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newDevis = await Devis.create({
      num_devis,
      client_nom: client_nom || 'Client Sans Nom',
      client_email: client_email || null,
      client_telephone: client_telephone || null,
      client_adresse: client_adresse || null,
      chantier_id: (chantier_id && chantier_id !== '' && chantier_id !== 'null') ? parseInt(chantier_id) : null,
      statut: statut || 'Brouillon',
      date_creation: cleanDateCreation,
      date_validite: cleanDateValidite,
      montant_ht,
      tva: tvaRate,
      montant_ttc,
      notes: notes || null
    });

    if (preparedLignes.length > 0) {
      const lignesWithDevisId = preparedLignes.map(l => ({ ...l, devis_id: newDevis.id }));
      await DevisLigne.bulkCreate(lignesWithDevisId);
    }

    const createdDevis = await Devis.findByPk(newDevis.id, {
      include: [{ model: DevisLigne, as: 'lignes' }]
    });

    res.status(201).json(createdDevis);
  } catch (error) {
    console.error("Erreur création devis backend:", error);
    res.status(400).json({ message: error.message || 'Erreur lors de la création du devis.' });
  }
};

export const updateDevis = async (req, res, next) => {
  try {
    const devis = await Devis.findByPk(req.params.id);
    if (!devis) {
      return res.status(404).json({ message: 'Devis introuvable.' });
    }

    const {
      client_nom,
      client_email,
      client_telephone,
      client_adresse,
      chantier_id,
      statut,
      date_creation,
      date_validite,
      tva,
      notes,
      lignes
    } = req.body;

    let montant_ht = devis.montant_ht;
    let preparedLignes = null;

    if (Array.isArray(lignes)) {
      montant_ht = 0;
      preparedLignes = lignes.map(line => {
        const qty = parseFloat(line.quantite) || 0;
        const pu = parseFloat(line.prix_unitaire) || 0;
        const total = qty * pu;
        montant_ht += total;
        return {
          devis_id: devis.id,
          designation: line.designation || 'Prestation',
          quantite: qty,
          unite: line.unite || 'u',
          prix_unitaire: pu,
          total_ligne: total
        };
      });
    }

    const tvaRate = (tva !== undefined && tva !== null && tva !== '') ? parseFloat(tva) : parseFloat(devis.tva || 0);
    const montant_ttc = tvaRate > 0 ? montant_ht * (1 + tvaRate / 100) : montant_ht;

    const cleanDateCreation = (date_creation && date_creation !== '') ? date_creation : devis.date_creation;
    const cleanDateValidite = (date_validite && date_validite !== '') ? date_validite : devis.date_validite;

    await devis.update({
      client_nom: client_nom !== undefined ? client_nom : devis.client_nom,
      client_email: client_email !== undefined ? client_email : devis.client_email,
      client_telephone: client_telephone !== undefined ? client_telephone : devis.client_telephone,
      client_adresse: client_adresse !== undefined ? client_adresse : devis.client_adresse,
      chantier_id: chantier_id !== undefined ? (chantier_id && chantier_id !== 'null' ? parseInt(chantier_id) : null) : devis.chantier_id,
      statut: statut !== undefined ? statut : devis.statut,
      date_creation: cleanDateCreation,
      date_validite: cleanDateValidite,
      montant_ht,
      tva: tvaRate,
      montant_ttc,
      notes: notes !== undefined ? notes : devis.notes
    });

    if (preparedLignes !== null) {
      await DevisLigne.destroy({ where: { devis_id: devis.id } });
      if (preparedLignes.length > 0) {
        await DevisLigne.bulkCreate(preparedLignes);
      }
    }

    const updatedDevis = await Devis.findByPk(devis.id, {
      include: [{ model: DevisLigne, as: 'lignes' }]
    });

    res.json(updatedDevis);
  } catch (error) {
    console.error("Erreur updateDevis:", error);
    res.status(400).json({ message: error.message || 'Erreur lors de la mise à jour.' });
  }
};

export const deleteDevis = async (req, res, next) => {
  try {
    const devis = await Devis.findByPk(req.params.id);
    if (!devis) {
      return res.status(404).json({ message: 'Devis introuvable.' });
    }

    await devis.destroy();
    res.json({ message: 'Devis supprimé avec succès.' });
  } catch (error) {
    console.error("Erreur deleteDevis:", error);
    res.status(400).json({ message: error.message || 'Erreur lors de la suppression.' });
  }
};

export const convertToFacture = async (req, res, next) => {
  try {
    const devis = await Devis.findByPk(req.params.id, {
      include: [{ model: DevisLigne, as: 'lignes' }]
    });

    if (!devis) {
      return res.status(404).json({ message: 'Devis introuvable.' });
    }

    // Passer statut à Accepté si ce n'est pas déjà le cas
    if (devis.statut !== 'Accepté') {
      await devis.update({ statut: 'Accepté' });
    }

    // Récupérer un chantier valide ou par défaut
    let chantierId = devis.chantier_id;
    if (!chantierId) {
      const firstChantier = await Chantier.findOne();
      chantierId = firstChantier ? firstChantier.id : 1;
    }

    // Récupérer un fournisseur valide ou par défaut
    let fournisseurId = 1;
    const firstFournisseur = await Fournisseur.findOne();
    if (firstFournisseur) {
      fournisseurId = firstFournisseur.id;
    }

    const currentYear = new Date().getFullYear();
    let countFactures = await Facture.count();
    let nextFactureNum = countFactures + 1;
    let num_facture = `FAC-${currentYear}-${nextFactureNum.toString().padStart(3, '0')}`;

    // Garantir l'unicité de num_facture
    let existsFacture = await Facture.findOne({ where: { num_facture } });
    while (existsFacture) {
      nextFactureNum++;
      num_facture = `FAC-${currentYear}-${nextFactureNum.toString().padStart(3, '0')}`;
      existsFacture = await Facture.findOne({ where: { num_facture } });
    }

    const montant_tva = parseFloat(devis.montant_ttc || 0) - parseFloat(devis.montant_ht || 0);

    const facture = await Facture.create({
      num_facture,
      fournisseur_id: fournisseurId,
      chantier_id: chantierId,
      date_emission: new Date().toISOString().split('T')[0],
      date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      montant_ht: devis.montant_ht || 0,
      montant_tva: montant_tva > 0 ? montant_tva : 0,
      montant_ttc: devis.montant_ttc || devis.montant_ht || 0,
      statut_paiement: 'En attente'
    });

    res.status(201).json({
      message: 'Devis converti en facture avec succès !',
      facture
    });
  } catch (error) {
    console.error("Erreur convertToFacture:", error);
    res.status(400).json({ message: error.message || 'Erreur lors de la conversion en facture.' });
  }
};

export const convertToChantier = async (req, res, next) => {
  try {
    const devis = await Devis.findByPk(req.params.id);

    if (!devis) {
      return res.status(404).json({ message: 'Devis introuvable.' });
    }

    // Passer statut à Accepté si ce n'est pas déjà le cas
    if (devis.statut !== 'Accepté') {
      await devis.update({ statut: 'Accepté' });
    }

    let countChantiers = await Chantier.count();
    let nextChantierNum = countChantiers + 1;
    let code_chantier = `CHT-DEV-${nextChantierNum.toString().padStart(3, '0')}`;

    // Garantir l'unicité de code_chantier
    let existsChantier = await Chantier.findOne({ where: { code_chantier } });
    while (existsChantier) {
      nextChantierNum++;
      code_chantier = `CHT-DEV-${nextChantierNum.toString().padStart(3, '0')}`;
      existsChantier = await Chantier.findOne({ where: { code_chantier } });
    }

    const chantier = await Chantier.create({
      code_chantier,
      nom: `Chantier - ${devis.client_nom}`,
      client_nom: devis.client_nom,
      adresse: devis.client_adresse || '',
      date_debut: new Date().toISOString().split('T')[0],
      statut: 'En préparation',
      budget_previsionnel: devis.montant_ht || 0,
      devis_id: devis.id
    });

    await devis.update({ chantier_id: chantier.id });

    res.status(201).json({
      message: 'Chantier créé à partir du devis avec succès !',
      chantier
    });
  } catch (error) {
    console.error("Erreur convertToChantier:", error);
    res.status(400).json({ message: error.message || 'Erreur lors de la création du chantier.' });
  }
};
