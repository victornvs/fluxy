'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/business/MetricCard';
import { GoalProgress } from '@/components/business/GoalProgress';
import { RevenueChart } from '@/components/business/RevenueChart';
import { GrowthIndicators } from '@/components/business/GrowthIndicators';
import { UpcomingPayments } from '@/components/business/UpcomingPayments';
import { UpcomingDeliveries } from '@/components/business/UpcomingDeliveries';
import { ActiveClients } from '@/components/business/ActiveClients';
import { formatCurrency } from '@/lib/api';
import { businessApi } from '@/lib/api-client';
import { useData } from '@/lib/use-data';
import {
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  Loader2,
} from 'lucide-react';

export default function MeuNegocioPage() {
  const { data, loading, error } = useData(
    'dashboard',
    () => businessApi.dashboard(),
    { ttl: 30000 } // 30 second client cache
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="glass-card p-8 text-center max-w-sm">
          <Loader2 className="w-10 h-10 animate-spin text-fluxy-500 mx-auto mb-4" />
          <p className="text-slate-200 text-lg font-medium">Carregando dashboard Fluxy...</p>
          <p className="mt-2 text-sm text-slate-400">Seu painel será exibido em instantes.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="glass-card p-8 max-w-lg">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-500 mx-auto mb-5">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-100 mb-3">Erro ao carregar dados</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 text-sm text-slate-300 space-y-2">
            <p>• Verifique se o backend está rodando</p>
            <p>• Verifique se o MongoDB está conectado</p>
            <p>• Execute: npm run seed</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, growthIndicators, monthlyHistory, upcomingPayments, upcomingDeliveries, activeClients } = data;

  const revenueGrowth = growthIndicators.find((g) => g.label === 'Receita')?.growth ?? 0;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <div className="ml-64">
          <Header
            title="Meu Negócio"
            subtitle={`Visão geral de ${summary.month} de ${summary.year}`}
          />

          <main className="p-8 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <MetricCard
                title="Receita do Mês"
                value={formatCurrency(summary.monthlyRevenue)}
                icon={DollarSign}
                trend={revenueGrowth}
                trendLabel="vs mês anterior"
                variant="primary"
              />
              <MetricCard
                title="Lucro"
                value={formatCurrency(summary.profit)}
                subtitle={`Margem: ${summary.profitMargin}%`}
                icon={TrendingUp}
                variant="success"
              />
              <MetricCard
                title="Clientes Ativos"
                value={summary.activeClients.toString()}
                icon={Users}
                variant="default"
              />
              <MetricCard
                title="Despesas"
                value={formatCurrency(summary.expenses)}
                icon={Wallet}
                variant="warning"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1">
                <GoalProgress
                  monthlyRevenue={summary.monthlyRevenue}
                  monthlyGoal={summary.monthlyGoal}
                  goalProgress={summary.goalProgress}
                  month={summary.month}
                  year={summary.year}
                />
              </div>
              <div className="xl:col-span-2">
                <RevenueChart data={monthlyHistory} />
              </div>
            </div>

            <GrowthIndicators indicators={growthIndicators} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UpcomingPayments payments={upcomingPayments} />
              <UpcomingDeliveries deliveries={upcomingDeliveries} />
            </div>

            <ActiveClients clients={activeClients} total={summary.activeClients} />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}