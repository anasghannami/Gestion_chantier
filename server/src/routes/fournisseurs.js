import { Router } from 'express';
import { getAllFournisseurs, getFournisseurById, createFournisseur, updateFournisseur, deleteFournisseur } from '../controllers/fournisseurController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllFournisseurs);
router.get('/:id', getFournisseurById);
router.post('/', authorizeRoles('Admin', 'Achats'), createFournisseur);
router.put('/:id', authorizeRoles('Admin', 'Achats'), updateFournisseur);
router.delete('/:id', authorizeRoles('Admin', 'Achats'), deleteFournisseur);

export default router;
