import express from 'express';
import { Tache, Chantier, PhaseChantier, Ouvrier } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to sanitize payload for DB insert/update
const sanitizePayload = (body) => {
  const payload = { ...body };

  // Remove frontend temporary timestamp ID if auto-increment is expected
  if (payload.id && (typeof payload.id !== 'number' || payload.id > 2147483647)) {
    delete payload.id;
  }

  // Ensure avancement / pourcentage_avancement are in sync
  const av = payload.avancement !== undefined ? payload.avancement : payload.pourcentage_avancement;
  if (av !== undefined) {
    payload.avancement = parseInt(av) || 0;
    payload.pourcentage_avancement = parseInt(av) || 0;
  }

  // Ensure duree is set
  if (payload.duree !== undefined) {
    payload.duree = parseInt(payload.duree) || 1;
  }

  return payload;
};

// GET all taches (with optional filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const { chantier_id, phase_id, statut, priorite } = req.query;
    const where = {};
    if (chantier_id) where.chantier_id = chantier_id;
    if (phase_id) where.phase_id = phase_id;
    if (statut) where.statut = statut;
    if (priorite) where.priorite = priorite;

    const taches = await Tache.findAll({
      where,
      include: [
        { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] },
        { model: PhaseChantier, as: 'phase', attributes: ['id', 'nom'] },
        { model: Ouvrier, as: 'responsable', attributes: ['id', 'nom', 'prenom', 'specialite'] }
      ],
      order: [['date_debut', 'ASC']]
    });

    res.json(taches);
  } catch (error) {
    console.error('Erreur GET /taches:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tâches' });
  }
});

// POST create tache
router.post('/', authenticate, async (req, res) => {
  try {
    const payload = sanitizePayload(req.body);
    const tache = await Tache.create(payload);
    const fullTache = await Tache.findByPk(tache.id, {
      include: [
        { model: Chantier, as: 'chantier' },
        { model: PhaseChantier, as: 'phase' },
        { model: Ouvrier, as: 'responsable' }
      ]
    });
    res.status(201).json(fullTache);
  } catch (error) {
    console.error('Erreur POST /taches:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la tâche', error: error.message });
  }
});

// PUT update tache
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const tache = await Tache.findByPk(id);
    if (!tache) return res.status(404).json({ message: 'Tâche non trouvée' });

    const payload = sanitizePayload(req.body);
    await tache.update(payload);

    const updated = await Tache.findByPk(id, {
      include: [
        { model: Chantier, as: 'chantier' },
        { model: PhaseChantier, as: 'phase' },
        { model: Ouvrier, as: 'responsable' }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur PUT /taches:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la tâche', error: error.message });
  }
});

// DELETE tache
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const tache = await Tache.findByPk(id);
    if (!tache) return res.status(404).json({ message: 'Tâche non trouvée' });

    await tache.destroy();
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /taches:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

export default router;
