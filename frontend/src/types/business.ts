export interface DashboardSummary {
  monthlyRevenue: number;
  monthlyGoal: number;
  goalProgress: number;
  profit: number;
  expenses: number;
  activeClients: number;
  profitMargin: number;
  month: string;
  year: number;
}

export interface GrowthIndicator {
  label: string;
  value: number;
  previousValue: number;
  unit: 'currency' | 'percentage' | 'number';
  growth: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface Payment {
  _id: string;
  clientId: string;
  clientName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
}

export interface Delivery {
  _id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'scheduled' | 'in_progress' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  value: number;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  totalRevenue: number;
  joinedAt: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  growthIndicators: GrowthIndicator[];
  monthlyHistory: MonthlyData[];
  upcomingPayments: Payment[];
  upcomingDeliveries: Delivery[];
  activeClients: Client[];
}
