import mongoose, { Document, Schema } from "mongoose";

export interface ILoan extends Document {
  borrowerId: mongoose.Types.ObjectId;
  amount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: "applied" | "sanctioned" | "rejected" | "disbursed" | "closed";
  salarySlipUrl: string;
  salarySlipPublicId?: string;
  sanctionedBy?: mongoose.Types.ObjectId;
  sanctionedAt?: Date;
  rejectionReason?: string;
  disbursedBy?: mongoose.Types.ObjectId;
  disbursedAt?: Date;
  totalPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, required: true },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    status: {
      type: String,
      enum: ["applied", "sanctioned", "rejected", "disbursed", "closed"],
      default: "applied",
    },
    salarySlipUrl: { type: String, required: true },
    salarySlipPublicId: { type: String },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: "User" },
    sanctionedAt: { type: Date },
    rejectionReason: { type: String },
    disbursedBy: { type: Schema.Types.ObjectId, ref: "User" },
    disbursedAt: { type: Date },
    totalPaid: { type: Number, default: 0 },
  },
  { timestamps: true },
);

LoanSchema.index({ borrowerId: 1 });
LoanSchema.index({ status: 1 });

export default mongoose.model<ILoan>("Loan", LoanSchema);
