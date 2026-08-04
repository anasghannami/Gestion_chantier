import express from 'express';
import { PhaseChantier, Chantier, Tache, Ouvrier, Commande, EnginEquipement, AffectationRessource, JalonPermis, Facture } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { Op } from 'sequelize';

const router = express.Router();

// Helper: Calculate Critical Path (CPM Algorithm)
const calculateCriticalPath = (phases) => {
  if (!phases || phases.length === 0) return phases;

  // Build ID map and duration
  const phaseMap = new Map();
  phases.forEach(p => {
    const raw = p.toJSON ? p.toJSON() : p;
    const dur = raw.duree_jours || 1;
    phaseMap.set(raw.id, {
      ...raw,
      duration: dur,
      es: 0,
      ef: dur,
      ls: Infinity,
      lf: Infinity,
      slack: 0,
      isCritical: false
    });
  });

  // Forward pass
  let maxProjectEnd = 0;
  phaseMap.forEach((node) => {
    if (node.predecesseur_id && phaseMap.has(node.predecesseur_id)) {
      const pred = phaseMap.get(node.predecesseur_id);
      node.es = Math.max(node.es, pred.ef);
      node.ef = node.es + node.duration;
    }
    maxProjectEnd = Math.max(maxProjectEnd, node.ef);
  });

  // Backward pass
  phaseMap.forEach((node) => {
    node.lf = maxProjectEnd;
    node.ls = node.lf - node.duration;
  });

  // Refine Backward Pass backwards
  const reversedNodes = Array.from(phaseMap.values()).reverse();
  reversedNodes.forEach((node) => {
    if (node.predecesseur_id && phaseMap.has(node.predecesseur_id)) {
      const pred = phaseMap.get(node.predecesseur_id);
      pred.lf = Math.min(pred.lf, node.ls);
      pred.ls = pred.lf - pred.duration;
    }
  });

  // Calculate Slack and Critical Status
  return phases.map(p => {
    const raw = p.toJSON ? p.toJSON() : p;
    const node = phaseMap.get(raw.id);
    if (node) {
      const slack = Math.max(0, node.ls - node.es);
      const isCritical = slack === 0;
      return {
        ...raw,
        es: node.es,
        ef: node.ef,
        ls: node.ls,
        lf: node.lf,
        slack,
        est_critique: isCritical
      };
    }
    return raw;
  });
};

// GET all phases (with CPM & full details)
router.get('/', authenticate, async (req, res) => {
  try {
    const { chantier_id } = req.query;
    const where = {};
    if (chantier_id && chantier_id !== 'all') {
      where.chantier_id = chantier_id;
    }

    const phases = await PhaseChantier.findAll({
      where,
      include: [
        { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier', 'statut'] },
        { model: Tache, as: 'taches' },
        { model: PhaseChantier, as: 'predecesseur', attributes: ['id', 'nom', 'date_fin'] },
        { model: Commande, as: 'commande', attributes: ['id', 'num_commande', 'statut', 'date_livraison_prevue'] },
        { model: Ouvrier, as: 'responsable', attributes: ['id', 'nom', 'prenom', 'telephone'] },
        { 
          model: AffectationRessource, 
          as: 'affectations',
          include: [
            { model: Ouvrier, as: 'ouvrier', attributes: ['id', 'nom', 'prenom', 'specialite'] },
            { model: EnginEquipement, as: 'engin', attributes: ['id', 'nom', 'code', 'type'] }
          ]
        }
      ],
      order: [['ordre', 'ASC'], ['date_debut', 'ASC']]
    });

    const enrichedPhases = calculateCriticalPath(phases);
    res.json(enrichedPhases);
  } catch (error) {
    console.error('Erreur GET /phases:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des phases.' });
  }
});

// GET critical path specifically for a chantier
router.get('/chemin-critique', authenticate, async (req, res) => {
  try {
    const { chantier_id } = req.query;
    const where = {};
    if (chantier_id && chantier_id !== 'all') where.chantier_id = chantier_id;

    const phases = await PhaseChantier.findAll({
      where,
      include: [{ model: Chantier, as: 'chantier' }],
      order: [['ordre', 'ASC']]
    });

    const calculated = calculateCriticalPath(phases);
    const criticalOnly = calculated.filter(p => p.est_critique);
    res.json({ total: phases.length, criticalCount: criticalOnly.length, phases: calculated });
  } catch (error) {
    console.error('Erreur GET /phases/chemin-critique:', error);
    res.status(500).json({ message: 'Erreur calcul du chemin critique' });
  }
});

// GET resource conflict detection across phases
router.get('/conflits', authenticate, async (req, res) => {
  try {
    const affectations = await AffectationRessource.findAll({
      include: [
        { model: PhaseChantier, as: 'phase', include: [{ model: Chantier, as: 'chantier' }] },
        { model: Ouvrier, as: 'ouvrier' },
        { model: EnginEquipement, as: 'engin' }
      ]
    });

    const conflicts = [];
    for (let i = 0; i < affectations.length; i++) {
      for (let j = i + 1; j < affectations.length; j++) {
        const a1 = affectations[i];
        const a2 = affectations[j];

        const sameOuvrier = a1.ouvrier_id && a1.ouvrier_id === a2.ouvrier_id;
        const sameEngin = a1.engin_id && a1.engin_id === a2.engin_id;

        if (sameOuvrier || sameEngin) {
          const overlap = a1.date_debut <= a2.date_fin && a2.date_debut <= a1.date_fin;
          if (overlap && a1.phase_id !== a2.phase_id) {
            conflicts.push({
              type: sameOuvrier ? 'Ouvrier' : 'Matériel',
              resourceName: sameOuvrier ? `${a1.ouvrier?.nom} ${a1.ouvrier?.prenom}` : a1.engin?.nom,
              resourceId: sameOuvrier ? a1.ouvrier_id : a1.engin_id,
              phase1: { id: a1.phase?.id, nom: a1.phase?.nom, chantier: a1.phase?.chantier?.nom, dates: `${a1.date_debut} à ${a1.date_fin}` },
              phase2: { id: a2.phase?.id, nom: a2.phase?.nom, chantier: a2.phase?.chantier?.nom, dates: `${a2.date_debut} à ${a2.date_fin}` }
            });
          }
        }
      }
    }

    res.json({ count: conflicts.length, conflicts });
  } catch (error) {
    console.error('Erreur GET /phases/conflits:', error);
    res.status(500).json({ message: 'Erreur détection de conflits' });
  }
});

// PATCH mobile real progress update (% avancement)
router.patch('/:id/avancement', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { pourcentage_avancement, notes } = req.body;

    const phase = await PhaseChantier.findByPk(id);
    if (!phase) return res.status(404).json({ message: 'Phase non trouvée' });

    let newStatus = phase.statut;
    const p = parseInt(pourcentage_avancement);

    if (p >= 100) {
      newStatus = 'Terminée';
    } else if (p > 0) {
      const today = new Date().toISOString().split('T')[0];
      if (phase.date_fin && phase.date_fin < today) {
        newStatus = 'En retard';
      } else {
        newStatus = 'En cours';
      }
    }

    await phase.update({
      pourcentage_avancement: Math.min(100, Math.max(0, p)),
      statut: newStatus,
      notes: notes || phase.notes
    });

    res.json({ message: 'Avancement mis à jour avec succès', phase });
  } catch (error) {
    console.error('Erreur PATCH /phases/:id/avancement:', error);
    res.status(500).json({ message: 'Erreur mise à jour avancement' });
  }
});

// POST situation de travaux (progress billing invoice draft)
router.post('/:id/facturer-situation', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const phase = await PhaseChantier.findByPk(id, { include: [{ model: Chantier, as: 'chantier' }] });
    if (!phase) return res.status(404).json({ message: 'Phase non trouvée' });

    const montantHT = parseFloat(phase.cout_prevu || 10000) * (parseFloat(phase.pourcentage_avancement || 100) / 100);
    const tva = montantHT * 0.20;
    const montantTTC = montantHT + tva;

    const numFacture = `SIT-${phase.chantier_id}-${Date.now().toString().slice(-4)}`;

    const facture = await Facture.create({
      num_facture: numFacture,
      chantier_id: phase.chantier_id,
      date_emission: new Date().toISOString().split('T')[0],
      date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      montant_ht: montantHT,
      montant_tva: tva,
      montant_ttc: montantTTC,
      statut_paiement: 'En attente',
      notes: `Situation de travaux sur avancement ${phase.pourcentage_avancement}% - Phase : ${phase.nom}`
    });

    res.status(201).json({ message: 'Situation de travaux créée avec succès', facture });
  } catch (error) {
    console.error('Erreur POST /phases/:id/facturer-situation:', error);
    res.status(500).json({ message: 'Erreur création situation de travaux' });
  }
});

// POST create phase
router.post('/', authenticate, async (req, res) => {
  try {
    const phase = await PhaseChantier.create(req.body);
    res.status(201).json(phase);
  } catch (error) {
    console.error('Erreur POST /phases:', error);
    res.status(500).json({ message: 'Erreur création phase' });
  }
});

// PUT update phase
router.put('/:id', authenticate, async (req, res) => {
  try {
    const phase = await PhaseChantier.findByPk(req.params.id);
    if (!phase) return res.status(404).json({ message: 'Phase non trouvée' });

    await phase.update(req.body);
    res.json(phase);
  } catch (error) {
    console.error('Erreur PUT /phases:', error);
    res.status(500).json({ message: 'Erreur modification phase' });
  }
});

// DELETE phase
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const phase = await PhaseChantier.findByPk(req.params.id);
    if (!phase) return res.status(404).json({ message: 'Phase non trouvée' });

    await phase.destroy();
    res.json({ message: 'Phase supprimée avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /phases:', error);
    res.status(500).json({ message: 'Erreur suppression phase' });
  }
});

// POST assign resource (worker or engin) to phase
router.post('/:id/affectations', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { ouvrier_id, engin_id, date_debut, date_fin, heures_prevues, taux_charge } = req.body;

    const affectation = await AffectationRessource.create({
      phase_id: id,
      ouvrier_id: ouvrier_id || null,
      engin_id: engin_id || null,
      date_debut,
      date_fin,
      heures_prevues: heures_prevues || 8,
      taux_charge: taux_charge || 100
    });

    res.status(201).json(affectation);
  } catch (error) {
    console.error('Erreur POST /phases/:id/affectations:', error);
    res.status(500).json({ message: 'Erreur affectation ressource' });
  }
});

export default router;
