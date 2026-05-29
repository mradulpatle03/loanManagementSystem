import { Router } from 'express';
import { getAppliedLoans, approveLoan, rejectLoan } from '../controllers/sanction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();
router.get('/loans', authenticate, authorize('sanction', 'admin'), getAppliedLoans);
router.patch('/loans/:id/approve', authenticate, authorize('sanction', 'admin'), approveLoan);
router.patch('/loans/:id/reject', authenticate, authorize('sanction', 'admin'), rejectLoan);
export default router;