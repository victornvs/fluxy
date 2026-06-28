export interface Project {
  _id: string;
  title: string;
  description: string;
  type: 'website' | 'app' | 'design' | 'branding' | 'marketing' | 'other';
  url?: string;
  status: 'completed' | 'in_progress' | 'cancelled';
  clientName: string;
  clientId?: string;
  value: number;
  deliveryDate?: string;
  image?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  totalProjects: number;
  completedProjects: number;
  totalValue: number;
  websites: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  plan: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ManagedUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  plan: string;
  createdAt: string;
}