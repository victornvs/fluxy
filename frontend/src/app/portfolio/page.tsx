import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PortfolioContent } from '@/components/portfolio/PortfolioContent';

export default function PortfolioPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <div className="ml-64">
          <Header
            title="Portfólio"
            subtitle="Projetos e serviços digitais realizados"
          />
          <main className="p-8 animate-fade-in">
            <PortfolioContent />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}