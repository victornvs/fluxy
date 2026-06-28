import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FinanceiroContent } from '@/components/financeiro/FinanceiroContent';

export default function FinanceiroPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <div className="ml-64">
          <Header title="Financeiro" subtitle="Gerencie recebimentos e fluxo de caixa" />
          <main className="p-8 animate-fade-in">
            <FinanceiroContent />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}