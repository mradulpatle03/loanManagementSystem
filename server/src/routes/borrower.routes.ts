import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import {
  submitPersonalDetails,
  uploadSalarySlip,
  applyLoan,
  getMyLoan,
} from '../controllers/borrower.controller';

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF, JPG, and PNG files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.post('/personal-details', authenticate, authorize('borrower'), submitPersonalDetails);
router.post('/upload-salary-slip', authenticate, authorize('borrower'), upload.single('file'), uploadSalarySlip);
router.post('/apply', authenticate, authorize('borrower'), applyLoan);
router.get('/loan', authenticate, authorize('borrower'), getMyLoan);

export default router;