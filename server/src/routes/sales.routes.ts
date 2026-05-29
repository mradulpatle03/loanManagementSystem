import { Router } from 'express';
import { getLeads } from '../controllers/sales.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();
router.get('/leads', authenticate, authorize('sales', 'admin'), getLeads);
export default router;