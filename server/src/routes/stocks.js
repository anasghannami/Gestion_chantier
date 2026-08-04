import express from 'express';
import { 
  getMateriaux, 
  createMateriau, 
  updateMateriau, 
  deleteMateriau, 
  getMouvements, 
  createMouvement 
} from '../controllers/stockController.js';

const router = express.Router();

router.get('/', getMateriaux);
router.post('/', createMateriau);
router.put('/:id', updateMateriau);
router.delete('/:id', deleteMateriau);

router.get('/mouvements', getMouvements);
router.post('/mouvements', createMouvement);

export default router;
