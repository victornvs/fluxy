import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { RelatoriosContent } from '@/components/relatorios/RelatoriosContent';

export default function RelatoriosPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <div className="ml-64">
          <Header title="Relatórios" subtitle="Análises e insights do seu negócio" />
          <main className="p-8 animate-fade-in">
            <RelatoriosContent />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}