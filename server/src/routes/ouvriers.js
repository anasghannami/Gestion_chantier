import { Router } from 'express';
import { getAllOuvriers, getOuvrierById, createOuvrier, updateOuvrier, deleteOuvrier } from '../controllers/ouvrierController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllOuvriers);
router.get('/:id', getOuvrierById);
router.post('/', authorizeRoles('Admin', 'Conducteur'), createOuvrier);
router.put('/:id', authorizeRoles('Admin', 'Conducteur'), updateOuvrier);
router.delete('/:id', authorizeRoles('Admin'), deleteOuvrier);

export default router;
