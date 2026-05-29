import { Router } from 'express';
import { getSanctionedLoans, disburseLoan } from '../controllers/disbursement.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();
router.get('/loans', authenticate, authorize('disbursement', 'admin'), getSanctionedLoans);
router.patch('/loans/:id/disburse', authenticate, authorize('disbursement', 'admin'), disburseLoan);
export default router;