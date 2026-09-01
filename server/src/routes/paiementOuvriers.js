import { Router } from 'express';
import {
  getSemaineCourante,
  updateJoursTravailles,
  createAvance,
  deleteAvance,
  validerPaiement,
  getHistorique,
  listTaches,
  createTache,
  updateTache,
  deleteTache
} from '../controllers/paiementOuvrierController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/:ouvrierId/semaine-courante', getSemaineCourante);
router.get('/:ouvrierId/historique', getHistorique);
router.put('/:ouvrierId/jours', authorizeRoles('Admin', 'Conducteur'), updateJoursTravailles);
router.post('/:ouvrierId/avances', authorizeRoles('Admin', 'Conducteur'), createAvance);
router.delete('/avances/:avanceId', authorizeRoles('Admin', 'Conducteur'), deleteAvance);
router.post('/:ouvrierId/payer', authorizeRoles('Admin', 'Conducteur'), validerPaiement);

// Tâches des intervenants "à la tâche"
router.get('/:ouvrierId/taches', listTaches);
router.post('/:ouvrierId/taches', authorizeRoles('Admin', 'Conducteur'), createTache);
router.put('/taches/:tacheId', authorizeRoles('Admin', 'Conducteur'), updateTache);
router.delete('/taches/:tacheId', authorizeRoles('Admin', 'Conducteur'), deleteTache);

export default router;
