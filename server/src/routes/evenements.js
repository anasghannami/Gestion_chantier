import express from 'express';
import { EvenementCalendrier, Chantier } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET evenements
router.get('/', authenticate, async (req, res) => {
  try {
    const { chantier_id, type } = req.query;
    const where = {};
    if (chantier_id) where.chantier_id = chantier_id;
    if (type) where.type = type;

    const evenements = await EvenementCalendrier.findAll({
      where,
      include: [
        { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] }
      ],
      order: [['date_evenement', 'ASC']]
    });

    res.json(evenements);
  } catch (error) {
    console.error('Erreur GET /evenements:', error);
    res.status(500).json({ message: 'Erreur chargement des événements' });
  }
});

// POST evenement
router.post('/', authenticate, async (req, res) => {
  try {
    const evenement = await EvenementCalendrier.create(req.body);
    const full = await EvenementCalendrier.findByPk(evenement.id, {
      include: [{ model: Chantier, as: 'chantier' }]
    });
    res.status(201).json(full);
  } catch (error) {
    console.error('Erreur POST /evenements:', error);
    res.status(500).json({ message: 'Erreur création événement' });
  }
});

// DELETE evenement
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const evenement = await EvenementCalendrier.findByPk(req.params.id);
    if (!evenement) return res.status(404).json({ message: 'Événement non trouvé' });

    await evenement.destroy();
    res.json({ message: 'Événement supprimé' });
  } catch (error) {
    console.error('Erreur DELETE /evenements:', error);
    res.status(500).json({ message: 'Erreur suppression événement' });
  }
});

export default router;
