import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DeliveriesContent } from '@/components/deliveries/DeliveriesContent';

export default function DeliveriesPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <div className="ml-64">
          <Header title="Entregas" subtitle="Gerencie entregas e prazos dos projetos" />
          <main className="p-8 animate-fade-in">
            <DeliveriesContent />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}