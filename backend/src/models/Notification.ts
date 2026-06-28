import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'weekly_report' | 'monthly_report' | 'delivery_reminder' | 'payment_reminder' | 'payment_overdue' | 'welcome' | 'custom';
  title: string;
  message: string;
  read: boolean;
  sentWhatsApp: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['weekly_report', 'monthly_report', 'delivery_reminder', 'payment_reminder', 'payment_overdue', 'welcome', 'custom'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    sentWhatsApp: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);