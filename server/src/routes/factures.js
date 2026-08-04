import { Router } from 'express';
import {
  getAllFactures,
  getFactureById,
  createFacture,
  createFactureAcompte,
  addPaiement,
  deletePaiement,
  updateFacture,
  deleteFacture
} from '../controllers/factureController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllFactures);
router.get('/:id', getFactureById);
router.post('/', authorizeRoles('Admin', 'Achats'), createFacture);
router.post('/acompte', authorizeRoles('Admin', 'Achats'), createFactureAcompte);
router.post('/:id/paiements', authorizeRoles('Admin', 'Achats'), addPaiement);
router.delete('/paiements/:paiementId', authorizeRoles('Admin'), deletePaiement);
router.put('/:id', authorizeRoles('Admin', 'Achats'), updateFacture);
router.delete('/:id', authorizeRoles('Admin'), deleteFacture);

export default router;
