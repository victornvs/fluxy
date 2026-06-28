import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ClientsContent } from '@/components/clients/ClientsContent';

export default function ClientsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <div className="ml-64">
          <Header title="Clientes" subtitle="Gerencie seus clientes e contatos" />
          <main className="p-8 animate-fade-in">
            <ClientsContent />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}