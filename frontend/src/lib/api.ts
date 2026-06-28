import { DashboardData } from '@/types/business';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

if (!API_URL && process.env.NODE_ENV !== 'development') {
  throw new Error('NEXT_PUBLIC_API_URL must be configured in production');
}

// Server-side call: requires token to be passed explicitly
export async function fetchDashboard(token?: string): Promise<DashboardData> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // If token is provided (server-side), use it
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    // Client-side: get token from localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
  }

  const res = await fetch(`${API_URL}/api/business/dashboard`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Falha ao carregar dados do dashboard' }));
    throw new Error(error.error || 'Falha ao carregar dados do dashboard');
  }

  return res.json();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} dias atrás`;
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays <= 7) return `Em ${diffDays} dias`;
  return formatDate(dateString);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}