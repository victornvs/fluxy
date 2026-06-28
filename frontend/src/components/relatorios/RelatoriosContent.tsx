'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Globe, DollarSign, Loader2 } from 'lucide-react';

import { fetchWithAuth } from '@/lib/api-client';

export function RelatoriosContent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [dashboard, portfolio, clients] = await Promise.all([
          fetchWithAuth('/api/business/dashboard'),
          fetchWithAuth('/api/projects/portfolio/summary'),
          fetchWithAuth('/api/clients'),
        ]);
        setData({
          dashboard,
          portfolio,
          clients,
        });
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-fluxy-500 animate-spin" /></div>;

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (!data) return <p className="text-center text-slate-500 py-20">Erro ao carregar relatórios</p>;

  const { dashboard, portfolio, clients } = data;

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-fluxy-500 to-violet-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition duration-500" />
          <div className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fluxy-400 to-fluxy-600 flex items-center justify-center text-white"><DollarSign className="w-5 h-5" /></div>
              <p className="text-sm text-slate-500">Receita Mensal</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{dashboard ? fmt(dashboard.summary.monthlyRevenue) : '---'}</p>
            <p className="text-sm text-emerald-500 mt-1">Meta: {dashboard ? fmt(dashboard.summary.monthlyGoal) : '---'}</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition duration-500" />
          <div className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white"><TrendingUp className="w-5 h-5" /></div>
              <p className="text-sm text-slate-500">Lucro</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{dashboard ? fmt(dashboard.summary.profit) : '---'}</p>
            <p className="text-sm text-slate-500 mt-1">Margem: {dashboard?.summary.profitMargin || 0}%</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition duration-500" />
          <div className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white"><Users className="w-5 h-5" /></div>
              <p className="text-sm text-slate-500">Clientes</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{clients?.length || 0}</p>
            <p className="text-sm text-slate-500 mt-1">{clients?.filter((c: any) => c.status === 'active').length || 0} ativos</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-fluxy-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition duration-500" />
          <div className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fluxy-400 to-fluxy-600 flex items-center justify-center text-white"><Globe className="w-5 h-5" /></div>
              <p className="text-sm text-slate-500">Projetos</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{portfolio?.totalProjects || 0}</p>
            <p className="text-sm text-slate-500 mt-1">{portfolio?.websites || 0} websites</p>
          </div>
        </div>
      </div>

      {/* Growth Indicators */}
      {dashboard?.growthIndicators && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Indicadores de Crescimento</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dashboard.growthIndicators.map((ind: any, i: number) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">{ind.label}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    {ind.unit === 'currency' ? fmt(ind.value) : ind.unit === 'percentage' ? `${ind.value}%` : ind.value}
                  </span>
                  <span className={`text-sm font-medium ${ind.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {ind.growth >= 0 ? '+' : ''}{ind.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly History */}
      {dashboard?.monthlyHistory && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Histórico Mensal</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">Mês</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium">Receita</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium">Despesas</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium">Lucro</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium">Margem</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.monthlyHistory.map((m: any, i: number) => {
                  const margin = m.revenue > 0 ? Math.round((m.profit / m.revenue) * 100 * 10) / 10 : 0;
                  return (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{m.month}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900">{fmt(m.revenue)}</td>
                      <td className="py-3 px-4 text-right text-red-500">{fmt(m.expenses)}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">{fmt(m.profit)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-1 rounded-lg bg-fluxy-50 text-fluxy-600 text-xs font-medium">{margin}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Total Revenue */}
      <div className="bg-gradient-to-r from-fluxy-600 to-violet-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 mb-1">Valor Total do Portfólio</p>
            <p className="text-4xl font-bold">{fmt(portfolio?.totalValue || 0)}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <BarChart3 className="w-8 h-8" />
          </div>
        </div>
        <p className="text-white/50 text-sm mt-2">{portfolio?.completedProjects || 0} projetos concluídos de {portfolio?.totalProjects || 0}</p>
      </div>
    </div>
  );
}