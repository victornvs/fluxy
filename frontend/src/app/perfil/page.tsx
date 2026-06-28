import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PerfilContent } from '@/components/perfil/PerfilContent';

export default function PerfilPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <div className="ml-64">
          <Header title="Meu Perfil" subtitle="Gerencie suas informações e notificações" />
          <main className="p-8 animate-fade-in">
            <PerfilContent />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}