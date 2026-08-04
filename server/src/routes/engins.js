import express from 'express';
import { EnginEquipement, AffectationRessource, PhaseChantier, Chantier } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all engins
router.get('/', authenticate, async (req, res) => {
  try {
    const engins = await EnginEquipement.findAll({
      include: [
        {
          model: AffectationRessource,
          as: 'affectations',
          include: [{ model: PhaseChantier, as: 'phase', include: [{ model: Chantier, as: 'chantier' }] }]
        }
      ],
      order: [['nom', 'ASC']]
    });
    res.json(engins);
  } catch (error) {
    console.error('Erreur GET /engins:', error);
    res.status(500).json({ message: 'Erreur chargement des engins' });
  }
});

// POST create engin
router.post('/', authenticate, async (req, res) => {
  try {
    const engin = await EnginEquipement.create(req.body);
    res.status(201).json(engin);
  } catch (error) {
    console.error('Erreur POST /engins:', error);
    res.status(500).json({ message: 'Erreur lors de la création du matériel' });
  }
});

// PUT update engin
router.put('/:id', authenticate, async (req, res) => {
  try {
    const engin = await EnginEquipement.findByPk(req.params.id);
    if (!engin) return res.status(404).json({ message: 'Matériel non trouvé' });

    await engin.update(req.body);
    res.json(engin);
  } catch (error) {
    console.error('Erreur PUT /engins:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// DELETE engin
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const engin = await EnginEquipement.findByPk(req.params.id);
    if (!engin) return res.status(404).json({ message: 'Matériel non trouvé' });

    await engin.destroy();
    res.json({ message: 'Matériel supprimé avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /engins:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

export default router;
