import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  totalRevenue: number;
  joinedAt: Date;
  avatar?: string;
  notes?: string;
  social?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
}

const ClientSchema = new Schema<IClient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    totalRevenue: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    avatar: { type: String },
    notes: { type: String },
    social: {
      instagram: { type: String },
      linkedin: { type: String },
      website: { type: String },
    },
  },
  { timestamps: true }
);

// Composite indexes for dashboard queries
ClientSchema.index({ userId: 1, status: 1, totalRevenue: -1 });
ClientSchema.index({ userId: 1, name: 1 });

export const Client = mongoose.model<IClient>('Client', ClientSchema);