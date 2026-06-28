import mongoose, { Document, Schema } from 'mongoose';

export interface IGrowthIndicator {
  label: string;
  value: number;
  previousValue: number;
  unit: 'currency' | 'percentage' | 'number';
}

export interface IMonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface IBusinessMetrics extends Document {
  userId: mongoose.Types.ObjectId;
  month: string;
  year: number;
  monthlyRevenue: number;
  monthlyGoal: number;
  profit: number;
  expenses: number;
  activeClients: number;
  growthIndicators: IGrowthIndicator[];
  monthlyHistory: IMonthlyData[];
}

const GrowthIndicatorSchema = new Schema({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  previousValue: { type: Number, required: true },
  unit: {
    type: String,
    enum: ['currency', 'percentage', 'number'],
    default: 'number',
  },
});

const MonthlyDataSchema = new Schema({
  month: { type: String, required: true },
  revenue: { type: Number, required: true },
  expenses: { type: Number, required: true },
  profit: { type: Number, required: true },
});

const BusinessMetricsSchema = new Schema<IBusinessMetrics>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    monthlyRevenue: { type: Number, required: true },
    monthlyGoal: { type: Number, required: true },
    profit: { type: Number, required: true },
    expenses: { type: Number, required: true },
    activeClients: { type: Number, required: true },
    growthIndicators: [GrowthIndicatorSchema],
    monthlyHistory: [MonthlyDataSchema],
  },
  { timestamps: true }
);

// Optimized indexes: userId + createdAt for dashboard queries (most recent first)
BusinessMetricsSchema.index({ userId: 1, createdAt: -1 });

export const BusinessMetrics = mongoose.model<IBusinessMetrics>(
  'BusinessMetrics',
  BusinessMetricsSchema
);