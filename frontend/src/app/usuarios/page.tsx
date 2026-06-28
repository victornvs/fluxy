import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { UsuariosContent } from '@/components/admin/UsuariosContent';

export default function UsuariosPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <div className="ml-64">
          <Header title="Usuários" subtitle="Gerencie os acessos dos seus clientes" />
          <main className="p-8 animate-fade-in">
            <UsuariosContent />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}