import { Response } from 'express';
import Loan from '../models/Loan';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /sanction/loans
export const getAppliedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowedStatuses = ['applied', 'sanctioned', 'rejected'] as const;
    const status = (req.query.status as string) || 'applied';
    const filterStatus = (allowedStatuses.includes(status as typeof allowedStatuses[number])
      ? status
      : 'applied') as typeof allowedStatuses[number];

    const loans = await Loan.find({ status: filterStatus })
      .populate('borrowerId', '-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ loans });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /sanction/loans/:id/approve
export const approveLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }
    if (loan.status !== 'applied') {
      res.status(400).json({ message: `Cannot approve a loan with status: ${loan.status}` });
      return;
    }

    loan.status = 'sanctioned';
    loan.sanctionedBy = req.user?._id as unknown as import('mongoose').Types.ObjectId;
    loan.sanctionedAt = new Date();
    await loan.save();

    res.status(200).json({ loan });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /sanction/loans/:id/reject
export const rejectLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      res.status(400).json({ message: 'Rejection reason is required' });
      return;
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }
    if (loan.status !== 'applied') {
      res.status(400).json({ message: `Cannot reject a loan with status: ${loan.status}` });
      return;
    }

    loan.status = 'rejected';
    loan.rejectionReason = reason.trim();
    await loan.save();

    res.status(200).json({ loan });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};