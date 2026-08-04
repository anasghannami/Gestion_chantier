import express from 'express';
import {
  getAllSousTraitants,
  getSousTraitantById,
  createSousTraitant,
  updateSousTraitant,
  deleteSousTraitant,
  createContrat,
  deleteContrat
} from '../controllers/sousTraitantController.js';

const router = express.Router();

router.get('/', getAllSousTraitants);
router.get('/:id', getSousTraitantById);
router.post('/', createSousTraitant);
router.put('/:id', updateSousTraitant);
router.delete('/:id', deleteSousTraitant);

router.post('/contrats', createContrat);
router.delete('/contrats/:id', deleteContrat);

export default router;
