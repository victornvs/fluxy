import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  phone?: string;
  whatsapp?: string;
  role: 'admin' | 'client';
  plan: 'free' | 'pro' | 'enterprise';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  notifications: {
    whatsappEnabled: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
    deliveryReminders: boolean;
    paymentReminders: boolean;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String },
    phone: { type: String },
    whatsapp: { type: String },
    role: {
      type: String,
      enum: ['admin', 'client'],
      default: 'client',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notifications: {
      whatsappEnabled: { type: Boolean, default: false },
      weeklyReport: { type: Boolean, default: true },
      monthlyReport: { type: Boolean, default: true },
      deliveryReminders: { type: Boolean, default: true },
      paymentReminders: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);