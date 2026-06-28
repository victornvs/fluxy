'use client';

import { useState, FormEvent } from 'react';
import { Project } from '@/types/portfolio';
import { createProject, updateProject } from '@/lib/api-portfolio';
import { X, Loader2 } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  title: string;
  description: string;
  type: 'website' | 'app' | 'design' | 'branding' | 'marketing' | 'other';
  url: string;
  status: 'completed' | 'in_progress' | 'cancelled';
  clientName: string;
  value: number;
  tags: string;
}

export function ProjectModal({ project, onClose, onSave }: ProjectModalProps) {
  const isEditing = !!project;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    title: project?.title || '',
    description: project?.description || '',
    type: project?.type || 'website',
    url: project?.url || '',
    status: project?.status || 'completed',
    clientName: project?.clientName || '',
    value: project?.value || 0,
    tags: project?.tags?.join(', ') || '',
  });

  function handleChange(field: keyof FormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        title: form.title,
        description: form.description,
        type: form.type,
        url: form.url,
        status: form.status,
        clientName: form.clientName,
        value: Number(form.value),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (isEditing) {
        await updateProject(project!._id, data);
      } else {
        await createProject(data);
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar projeto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Título do Projeto
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Site Corporativo TechCorp"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva o projeto, tecnologias usadas, etc."
              required
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tipo
              </label>
              <select
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
              >
                <option value="website">Website</option>
                <option value="app">Aplicativo</option>
                <option value="design">Design</option>
                <option value="branding">Branding</option>
                <option value="marketing">Marketing</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
              >
                <option value="completed">Concluído</option>
                <option value="in_progress">Em andamento</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              URL do Site (se aplicável)
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://seusite.com.br"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cliente
              </label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                placeholder="Nome do cliente"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Valor (R$)
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => handleChange('value', Number(e.target.value))}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="React, Next.js, Tailwind CSS"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-xl hover:from-fluxy-600 hover:to-fluxy-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                isEditing ? 'Atualizar' : 'Criar Projeto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}