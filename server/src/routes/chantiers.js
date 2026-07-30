import { Router } from 'express';
import { getAllChantiers, getChantierById, createChantier, updateChantier, deleteChantier } from '../controllers/chantierController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllChantiers);
router.get('/:id', getChantierById);
router.post('/', authorizeRoles('Admin', 'Conducteur'), createChantier);
router.put('/:id', authorizeRoles('Admin', 'Conducteur'), updateChantier);
router.delete('/:id', authorizeRoles('Admin'), deleteChantier);

export default router;
