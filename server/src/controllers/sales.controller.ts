import { Response } from 'express';
import User from '../models/User';
import Loan from '../models/Loan';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /sales/leads
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortDir = req.query.sort === 'asc' ? 1 : -1;
    // Find borrowers who have NO active/applied loan
    const borrowersWithLoans = await Loan.distinct('borrowerId', {
      status: { $in: ['applied', 'sanctioned', 'disbursed', 'closed'] },
    });

    const [leads, total] = await Promise.all([
      User.find({
        role: 'borrower',
        _id: { $nin: borrowersWithLoans },
      })
        .select('-password')
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(limit),
      User.countDocuments({
        role: 'borrower',
        _id: { $nin: borrowersWithLoans },
      }),
    ]);

    res.status(200).json({ leads, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};