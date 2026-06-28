import mongoose, { Document, Schema } from 'mongoose';

export interface IDelivery extends Document {
  userId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  clientName: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'scheduled' | 'in_progress' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  value: number;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    clientName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'delivered', 'cancelled'],
      default: 'scheduled',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Composite indexes for dashboard queries
DeliverySchema.index({ userId: 1, status: 1, dueDate: 1 });

export const Delivery = mongoose.model<IDelivery>('Delivery', DeliverySchema);