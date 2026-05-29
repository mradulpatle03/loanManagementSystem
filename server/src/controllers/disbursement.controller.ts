import { Response } from 'express';
import Loan from '../models/Loan';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /disbursement/loans
export const getSanctionedLoans = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: 'sanctioned' })
      .populate('borrowerId', '-password')
      .populate('sanctionedBy', 'name email')
      .sort({ sanctionedAt: -1 });

    res.status(200).json({ loans });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /disbursement/loans/:id/disburse
export const disburseLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }
    if (loan.status !== 'sanctioned') {
      res.status(400).json({ message: `Cannot disburse a loan with status: ${loan.status}` });
      return;
    }

    loan.status = 'disbursed';
    loan.disbursedBy = req.user?._id as unknown as import('mongoose').Types.ObjectId;
    loan.disbursedAt = new Date();
    await loan.save();

    res.status(200).json({ loan });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};