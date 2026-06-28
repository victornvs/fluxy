/**
 * Centralized API client for frontend.
 * Automatically injects auth token from localStorage.
 * Provides typed methods for all API endpoints.
 */

import { DashboardData } from '@/types/business';
import { Client } from '@/types/business';
import { Project, PortfolioSummary, AuthUser, ManagedUser } from '@/types/portfolio';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

if (!API_URL && process.env.NODE_ENV !== 'development') {
  throw new Error('NEXT_PUBLIC_API_URL must be configured in production');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchWithAuth<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro na requisição' }));
    throw new Error(error.error || `Erro ${res.status}`);
  }

  return res.json();
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  return fetchWithAuth<T>(path, options);
}

// ─── Auth ───────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    fetchWithAuth<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    fetchWithAuth<{ token: string; user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  profile: () => fetchWithAuth<AuthUser>('/api/auth/profile'),

  updateProfile: (data: Partial<AuthUser>) =>
    fetchWithAuth<AuthUser>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    fetchWithAuth<{ message: string }>('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ─── Business / Dashboard ──────────────────────────────
export const businessApi = {
  dashboard: () => request<DashboardData>('/api/business/dashboard'),
  summary: () => request<any>('/api/business/summary'),
};

// ─── Clients ────────────────────────────────────────────
export const clientsApi = {
  list: () => request<Client[]>('/api/clients'),
  get: (id: string) => request<Client>(`/api/clients/${id}`),
  create: (data: Partial<Client>) =>
    request<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Client>) =>
    request<Client>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/clients/${id}`, { method: 'DELETE' }),
};

// ─── Projects / Portfolio ──────────────────────────────
export const projectsApi = {
  portfolioSummary: () => request<PortfolioSummary>('/api/projects/portfolio/summary'),
  list: () => request<Project[]>('/api/projects'),
  get: (id: string) => request<Project>(`/api/projects/${id}`),
  create: (data: Partial<Project>) =>
    request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Project>) =>
    request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/projects/${id}`, { method: 'DELETE' }),
};

// ─── Admin ──────────────────────────────────────────────
export const adminApi = {
  listUsers: () => request<ManagedUser[]>('/api/admin/users'),
  createUser: (data: { name: string; email: string; password: string; plan?: string }) =>
    request<ManagedUser>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    request<{ message: string }>(`/api/admin/users/${id}`, { method: 'DELETE' }),
  resetUserData: (id: string) =>
    request<{ message: string }>(`/api/admin/users/${id}/reset`, { method: 'POST' }),
};