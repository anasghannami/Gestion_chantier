import { Router } from 'express';
import { getAllCommandes, createCommande, updateCommande, deleteCommande } from '../controllers/commandeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllCommandes);
router.post('/', authorizeRoles('Admin', 'Achats', 'Conducteur'), createCommande);
router.put('/:id', authorizeRoles('Admin', 'Achats'), updateCommande);
router.delete('/:id', authorizeRoles('Admin', 'Achats'), deleteCommande);

export default router;
