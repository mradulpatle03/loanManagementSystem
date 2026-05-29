import { Response } from 'express';
import Loan from '../models/Loan';
import Payment from '../models/Payment';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /collection/loans
export const getDisbursedLoans = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: { $in: ['disbursed', 'closed'] } })
      .populate('borrowerId', '-password')
      .sort({ disbursedAt: -1 });

    const loansWithOutstanding = loans.map((loan) => ({
      ...loan.toObject(),
      outstanding: parseFloat((loan.totalRepayment - loan.totalPaid).toFixed(2)),
    }));

    res.status(200).json({ loans: loansWithOutstanding });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// POST /collection/loans/:id/payment
export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { utrNumber, amount, paymentDate } = req.body;

    if (!utrNumber || !amount || !paymentDate) {
      res.status(400).json({ message: 'UTR number, amount, and payment date are required' });
      return;
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }
    if (loan.status !== 'disbursed') {
      res.status(400).json({ message: `Cannot record payment for a loan with status: ${loan.status}` });
      return;
    }

    // Check duplicate UTR
    const existingUTR = await Payment.findOne({ utrNumber: utrNumber.trim() });
    if (existingUTR) {
      res.status(409).json({ message: 'UTR number already exists' });
      return;
    }

    const outstanding = parseFloat((loan.totalRepayment - loan.totalPaid).toFixed(2));
    const parsedAmount = Number(amount);

    if (parsedAmount <= 0) {
      res.status(400).json({ message: 'Payment amount must be greater than 0' });
      return;
    }
    if (parsedAmount > outstanding) {
      res.status(400).json({
        message: `Payment exceeds outstanding balance of ₹${outstanding.toLocaleString('en-IN')}`,
      });
      return;
    }

    // Create payment
    const payment = await Payment.create({
      loanId: loan._id,
      borrowerId: loan.borrowerId,
      recordedBy: req.user?._id,
      utrNumber: utrNumber.trim(),
      amount: parsedAmount,
      paymentDate: new Date(paymentDate),
    });

    // Update loan totalPaid
    loan.totalPaid = parseFloat((loan.totalPaid + parsedAmount).toFixed(2));

    // Auto-close if fully paid
    if (loan.totalPaid >= loan.totalRepayment) {
      loan.status = 'closed';
    }
    await loan.save();

    const newOutstanding = parseFloat((loan.totalRepayment - loan.totalPaid).toFixed(2));

    res.status(201).json({
      payment,
      loan: {
        totalPaid: loan.totalPaid,
        totalRepayment: loan.totalRepayment,
        outstanding: newOutstanding,
        status: loan.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// GET /collection/loans/:id/payments
export const getLoanPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find({ loanId: req.params.id })
      .populate('recordedBy', 'name email')
      .sort({ paymentDate: -1 });

    res.status(200).json({ payments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};