import { Project, PortfolioSummary } from '@/types/portfolio';
import { fetchWithAuth } from '@/lib/api-client';

export async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  return fetchWithAuth<PortfolioSummary>('/api/projects/portfolio/summary');
}

export async function fetchProjects(): Promise<Project[]> {
  return fetchWithAuth<Project[]>('/api/projects');
}

export async function fetchProject(id: string): Promise<Project> {
  return fetchWithAuth<Project>(`/api/projects/${id}`);
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  return fetchWithAuth<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  return fetchWithAuth<Project>(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  return fetchWithAuth<void>(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getProjectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    website: 'Website',
    app: 'Aplicativo',
    design: 'Design',
    branding: 'Branding',
    marketing: 'Marketing',
    other: 'Outro',
  };
  return labels[type] || type;
}

export function getProjectStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: 'Concluído',
    in_progress: 'Em andamento',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
}