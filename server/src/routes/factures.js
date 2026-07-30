import { Router } from 'express';
import { getAllFactures, getFactureById, createFacture, updateFacture, deleteFacture } from '../controllers/factureController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllFactures);
router.get('/:id', getFactureById);
router.post('/', authorizeRoles('Admin', 'Achats'), createFacture);
router.put('/:id', authorizeRoles('Admin', 'Achats'), updateFacture);
router.delete('/:id', authorizeRoles('Admin'), deleteFacture);

export default router;
