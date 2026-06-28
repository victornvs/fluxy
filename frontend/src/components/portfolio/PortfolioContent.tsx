'use client';

import { useState, useEffect } from 'react';
import { fetchProjects, fetchPortfolioSummary, formatCurrency, getProjectTypeLabel, getProjectStatusLabel, deleteProject } from '@/lib/api-portfolio';
import { Project, PortfolioSummary } from '@/types/portfolio';
import { Globe, Smartphone, Palette, Target, Sparkles, ExternalLink, Plus, Trash2, Edit, FolderOpen, Loader2, Clock, CheckCircle, XCircle, Tags } from 'lucide-react';
import { ProjectModal } from './ProjectModal';

export function PortfolioContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('all');

  async function loadData() {
    try {
      const [projectsData, summaryData] = await Promise.all([
        fetchProjects(),
        fetchPortfolioSummary(),
      ]);
      setProjects(projectsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Erro ao carregar portfólio:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const typeIcons: Record<string, React.ReactNode> = {
    website: <Globe className="w-5 h-5" />,
    app: <Smartphone className="w-5 h-5" />,
    design: <Palette className="w-5 h-5" />,
    branding: <Sparkles className="w-5 h-5" />,
    marketing: <Target className="w-5 h-5" />,
    other: <FolderOpen className="w-5 h-5" />,
  };

  const statusConfig: Record<string, { icon: React.ReactNode; label: string; class: string }> = {
    completed: { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Concluído', class: 'bg-emerald-500/10 text-emerald-400' },
    in_progress: { icon: <Clock className="w-3.5 h-3.5" />, label: 'Em andamento', class: 'bg-amber-500/10 text-amber-400' },
    cancelled: { icon: <XCircle className="w-3.5 h-3.5" />, label: 'Cancelado', class: 'bg-red-500/10 text-red-400' },
  };

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.type === filter);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja remover este projeto?')) return;
    try {
      await deleteProject(id);
      loadData();
    } catch (err) {
      console.error('Erro ao remover projeto:', err);
    }
  }

  function handleEdit(project: Project) {
    setEditingProject(project);
    setShowModal(true);
  }

  function handleCreate() {
    setEditingProject(null);
    setShowModal(true);
  }

  function handleModalClose() {
    setShowModal(false);
    setEditingProject(null);
  }

  function handleSave() {
    handleModalClose();
    loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-fluxy-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Total de Projetos</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalProjects}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Concluídos</p>
            <p className="text-2xl font-bold text-emerald-600">{summary.completedProjects}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Websites</p>
            <p className="text-2xl font-bold text-fluxy-600">{summary.websites}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Valor Total Gerado</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.totalValue)}</p>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-fluxy-600 text-white shadow-lg shadow-fluxy-600/25' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-fluxy-300'
            }`}
          >
            Todos
          </button>
          {['website', 'app', 'design', 'branding', 'marketing'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === type 
                  ? 'bg-fluxy-600 text-white shadow-lg shadow-fluxy-600/25' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-fluxy-300'
              }`}
            >
              {getProjectTypeLabel(type)}
            </button>
          ))}
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-xl hover:from-fluxy-600 hover:to-fluxy-700 transition-all shadow-lg shadow-fluxy-600/25"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">Nenhum projeto encontrado</h3>
          <p className="text-sm text-slate-400 mt-1">Clique em "Novo Projeto" para adicionar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const status = statusConfig[project.status] || statusConfig.completed;
            return (
              <div
                key={project._id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-fluxy-200 transition-all duration-200 overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fluxy-400 to-fluxy-600 flex items-center justify-center text-white">
                      {typeIcons[project.type] || typeIcons.other}
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium ${status.class}`}>
                      {status.icon}
                      {status.label}
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="px-5 pb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {project.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="text-[11px] text-slate-400">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="px-5 py-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{project.clientName}</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(project.value)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-t border-slate-100">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-fluxy-600 hover:text-fluxy-700 hover:bg-fluxy-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Acessar Site
                    </a>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-1.5 text-slate-400 hover:text-fluxy-600 hover:bg-fluxy-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}