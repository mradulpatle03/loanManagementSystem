import { Router } from 'express';
import { getDisbursedLoans, recordPayment, getLoanPayments } from '../controllers/collection.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();
router.get('/loans', authenticate, authorize('collection', 'admin'), getDisbursedLoans);
router.post('/loans/:id/payment', authenticate, authorize('collection', 'admin'), recordPayment);
router.get('/loans/:id/payments', authenticate, authorize('collection', 'admin'), getLoanPayments);
export default router;