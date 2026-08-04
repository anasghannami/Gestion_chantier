import { Router } from 'express';
import {
  getAllDevis,
  getDevisById,
  createDevis,
  updateDevis,
  deleteDevis,
  convertToFacture,
  convertToChantier
} from '../controllers/devisController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllDevis);
router.get('/:id', getDevisById);
router.post('/', createDevis);
router.put('/:id', updateDevis);
router.delete('/:id', authorizeRoles('Admin'), deleteDevis);

router.post('/:id/convert-facture', convertToFacture);
router.post('/:id/convert-chantier', convertToChantier);

export default router;
