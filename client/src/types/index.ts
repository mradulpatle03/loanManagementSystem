export type Role = 'borrower' | 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  pan?: string;
  dateOfBirth?: string;
  monthlySalary?: number;
  employmentMode?: 'salaried' | 'self-employed' | 'unemployed';
  isBrePassed?: boolean;
  salarySlipUrl?: string;
}

export interface Loan {
  _id: string;
  borrowerId: string | User;
  amount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed';
  salarySlipUrl: string;
  sanctionedBy?: string | User;
  sanctionedAt?: string;
  rejectionReason?: string;
  disbursedBy?: string | User;
  disbursedAt?: string;
  totalPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  loanId: string;
  borrowerId: string;
  recordedBy: string | User;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}