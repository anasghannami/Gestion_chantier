import express from 'express';
import { JalonPermis, Chantier, PhaseChantier } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all jalons/permits
router.get('/', authenticate, async (req, res) => {
  try {
    const { chantier_id } = req.query;
    const where = {};
    if (chantier_id && chantier_id !== 'all') where.chantier_id = chantier_id;

    const jalons = await JalonPermis.findAll({
      where,
      include: [
        { model: Chantier, as: 'chantier', attributes: ['id', 'nom', 'code_chantier'] },
        { model: PhaseChantier, as: 'phase', attributes: ['id', 'nom'] }
      ],
      order: [['date_prevue', 'ASC']]
    });
    res.json(jalons);
  } catch (error) {
    console.error('Erreur GET /jalons:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des jalons' });
  }
});

// POST create jalon
router.post('/', authenticate, async (req, res) => {
  try {
    const jalon = await JalonPermis.create(req.body);
    res.status(201).json(jalon);
  } catch (error) {
    console.error('Erreur POST /jalons:', error);
    res.status(500).json({ message: 'Erreur création jalon' });
  }
});

// PUT update jalon
router.put('/:id', authenticate, async (req, res) => {
  try {
    const jalon = await JalonPermis.findByPk(req.params.id);
    if (!jalon) return res.status(404).json({ message: 'Jalon non trouvé' });

    await jalon.update(req.body);
    res.json(jalon);
  } catch (error) {
    console.error('Erreur PUT /jalons:', error);
    res.status(500).json({ message: 'Erreur mise à jour jalon' });
  }
});

// DELETE jalon
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const jalon = await JalonPermis.findByPk(req.params.id);
    if (!jalon) return res.status(404).json({ message: 'Jalon non trouvé' });

    await jalon.destroy();
    res.json({ message: 'Jalon supprimé avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /jalons:', error);
    res.status(500).json({ message: 'Erreur suppression jalon' });
  }
});

export default router;
