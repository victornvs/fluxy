import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'website' | 'app' | 'design' | 'branding' | 'marketing' | 'other';
  url?: string;
  status: 'completed' | 'in_progress' | 'cancelled';
  clientName: string;
  clientId?: mongoose.Types.ObjectId;
  value: number;
  deliveryDate?: Date;
  image?: string;
  tags: string[];
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['website', 'app', 'design', 'branding', 'marketing', 'other'],
      required: true,
    },
    url: { type: String },
    status: {
      type: String,
      enum: ['completed', 'in_progress', 'cancelled'],
      default: 'completed',
    },
    clientName: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    value: { type: Number, default: 0 },
    deliveryDate: { type: Date },
    image: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ProjectSchema.index({ userId: 1, createdAt: -1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);