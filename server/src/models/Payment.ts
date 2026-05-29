import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  loanId: mongoose.Types.ObjectId;
  borrowerId: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    borrowerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    utrNumber: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paymentDate: { type: Date, required: true },
  },
  { timestamps: true },
);

PaymentSchema.index({ loanId: 1 });

export default mongoose.model<IPayment>("Payment", PaymentSchema);
