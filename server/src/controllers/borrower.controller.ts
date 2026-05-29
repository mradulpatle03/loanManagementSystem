import { Response } from 'express';
import path from 'path';
import User from '../models/User';
import Loan from '../models/Loan';
import { AuthRequest } from '../middleware/auth.middleware';
import { runBRE } from '../services/bre.service';
import { calculateLoan } from '../services/loan.service';

// POST /borrower/personal-details
export const submitPersonalDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } = req.body;

    if (!fullName || !pan || !dateOfBirth || !monthlySalary || !employmentMode) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const bre = runBRE({
      dateOfBirth: new Date(dateOfBirth),
      monthlySalary: Number(monthlySalary),
      pan: pan.toUpperCase(),
      employmentMode,
    });

    if (!bre.passed) {
      res.status(422).json({ message: 'You are not eligible', reason: bre.reason });
      return;
    }

    await User.findByIdAndUpdate(req.user?._id, {
      name: fullName,
      pan: pan.toUpperCase(),
      dateOfBirth: new Date(dateOfBirth),
      monthlySalary: Number(monthlySalary),
      employmentMode,
      isBrePassed: true,
    });

    res.status(200).json({ message: 'Eligibility check passed', breStatus: 'passed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// POST /borrower/upload-salary-slip
export const uploadSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user?._id, { salarySlipUrl: fileUrl });

    res.status(200).json({ fileUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// POST /borrower/apply
export const applyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, tenureDays } = req.body;

    if (!amount || !tenureDays) {
      res.status(400).json({ message: 'Amount and tenure are required' });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.isBrePassed) {
      res.status(403).json({ message: 'BRE check must be passed before applying' });
      return;
    }

    if (!user.salarySlipUrl) {
      res.status(403).json({ message: 'Salary slip must be uploaded before applying' });
      return;
    }

    // Guard: no active loan
    const existingLoan = await Loan.findOne({
      borrowerId: user._id,
      status: { $in: ['applied', 'sanctioned', 'disbursed'] },
    });
    if (existingLoan) {
      res.status(409).json({ message: 'You already have an active loan application' });
      return;
    }

    const parsedAmount = Number(amount);
    const parsedTenure = Number(tenureDays);

    if (parsedAmount < 50000 || parsedAmount > 500000) {
      res.status(400).json({ message: 'Amount must be between ₹50,000 and ₹5,00,000' });
      return;
    }
    if (parsedTenure < 30 || parsedTenure > 365) {
      res.status(400).json({ message: 'Tenure must be between 30 and 365 days' });
      return;
    }

    const { interestRate, simpleInterest, totalRepayment } = calculateLoan(parsedAmount, parsedTenure);

    const loan = await Loan.create({
      borrowerId: user._id,
      amount: parsedAmount,
      tenureDays: parsedTenure,
      interestRate,
      simpleInterest,
      totalRepayment,
      salarySlipUrl: user.salarySlipUrl,
      status: 'applied',
      totalPaid: 0,
    });

    res.status(201).json({ loan });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// GET /borrower/loan
export const getMyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findOne({ borrowerId: req.user?._id }).sort({ createdAt: -1 });
    if (!loan) {
      res.status(404).json({ message: 'No loan found' });
      return;
    }
    res.status(200).json({ loan });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};