import { Client } from '@/types/business';
import { fetchWithAuth } from '@/lib/api-client';

export async function fetchClients(): Promise<Client[]> {
  return fetchWithAuth<Client[]>('/api/clients');
}

export async function createClient(data: Partial<Client>): Promise<Client> {
  return fetchWithAuth<Client>('/api/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  return fetchWithAuth<Client>(`/api/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string): Promise<void> {
  return fetchWithAuth<void>(`/api/clients/${id}`, {
    method: 'DELETE',
  });
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return colors[status] || colors.pending;
}