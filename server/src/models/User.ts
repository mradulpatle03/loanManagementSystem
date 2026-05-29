import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'borrower' | 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection';
  pan?: string;
  dateOfBirth?: Date;
  monthlySalary?: number;
  employmentMode?: 'salaried' | 'self-employed' | 'unemployed';
  isBrePassed?: boolean;
  salarySlipUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['borrower', 'admin', 'sales', 'sanction', 'disbursement', 'collection'],
      default: 'borrower',
    },
    pan: { type: String, uppercase: true, trim: true },
    dateOfBirth: { type: Date },
    monthlySalary: { type: Number },
    employmentMode: { type: String, enum: ['salaried', 'self-employed', 'unemployed'] },
    isBrePassed: { type: Boolean, default: false },
    salarySlipUrl: { type: String },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);