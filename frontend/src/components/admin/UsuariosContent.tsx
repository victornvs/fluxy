'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ManagedUser } from '@/types/portfolio';
import { useRouter } from 'next/navigation';
import { Shield, Plus, Trash2, X, Loader2, Mail, Calendar, Copy, CheckCircle, AlertTriangle, UserPlus, RefreshCw } from 'lucide-react';

import { fetchWithAuth } from '@/lib/api-client';

export function UsuariosContent() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedEmail, setCopiedEmail] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/meu-negocio');
    }
  }, [authLoading, isAdmin, router]);

  async function loadUsers() {
    try {
      setUsers(await fetchWithAuth<ManagedUser[]>('/api/admin/users'));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { if (isAdmin) loadUsers(); }, [isAdmin]);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem');
      return;
    }
    if (form.password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    setSaving(true);
    try {
      await fetchWithAuth<ManagedUser>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      setSuccess(`Usuário "${form.name}" criado com sucesso!`);
      setForm({ name: '', email: '', password: '', confirmPassword: '' });
      setShowModal(false);
      loadUsers();

      // Limpar mensagem após 3s
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`Tem certeza que deseja remover "${userName}"?\n\nTodos os dados deste usuário (clientes, entregas, financeiro, projetos) serão PERMANENTEMENTE EXCLUÍDOS.`)) return;

    try {
      await fetchWithAuth<{ message: string }>(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      setSuccess(`Usuário "${userName}" removido com sucesso!`);
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message);
      setTimeout(() => setError(''), 3000);
    }
  }

  async function handleResetUser(userId: string, userName: string) {
    if (!confirm(`Resetar todos os dados de "${userName}"?\n\nClientes, entregas, recebimentos e projetos serão apagados, mas o usuário continuará existindo.`)) return;

    try {
      await fetchWithAuth<{ message: string }>(`/api/admin/users/${userId}/reset`, {
        method: 'POST',
      });

      setSuccess(`Dados de "${userName}" resetados com sucesso!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message);
      setTimeout(() => setError(''), 3000);
    }
  }

  function copyToClipboard(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(''), 2000);
  }

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-fluxy-500 animate-spin" /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-fluxy-600 to-violet-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Painel de Administração</h2>
                <p className="text-white/70 text-sm">Gerencie os acessos dos seus clientes</p>
              </div>
            </div>
            <p className="text-white/50 text-sm">
              Crie contas para seus clientes. Cada um terá seu próprio dashboard, começando do zero.
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-emerald-600 font-medium">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Create User Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => { setError(''); setSuccess(''); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-fluxy-500/25 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">Nenhum cliente cadastrado</h3>
            <p className="text-sm text-slate-400 mt-1">Crie o primeiro acesso para seu cliente</p>
          </div>
        )}

        {users.map((u) => {
          const isOwn = u._id === user?.id;
          return (
            <div key={u._id} className={`bg-white rounded-2xl border shadow-sm p-6 transition-all hover:shadow-md ${isOwn ? 'border-fluxy-200 bg-gradient-to-r from-fluxy-50/50 to-white' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${isOwn ? 'bg-gradient-to-br from-fluxy-400 to-fluxy-600' : 'bg-gradient-to-br from-slate-400 to-slate-600'}`}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900 text-lg">{u.name}</h3>
                      {isOwn && (
                        <span className="text-[10px] font-bold bg-fluxy-500/10 text-fluxy-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Você</span>
                      )}
                      <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {u.role === 'admin' ? 'Admin' : 'Cliente'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {u.email}
                      </span>
                      <button
                        onClick={() => copyToClipboard(u.email)}
                        className="p-1 text-slate-400 hover:text-fluxy-600 transition-colors"
                        title="Copiar e-mail"
                      >
                        {copiedEmail === u.email ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {!isOwn && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResetUser(u._id, u.name)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="Resetar dados do usuário"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id, u.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Remover usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {!isOwn && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Credenciais para o cliente acessar o sistema
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <code className="px-3 py-1.5 bg-slate-50 rounded-lg text-slate-700 text-xs font-mono border border-slate-200">
                      {u.email}
                    </code>
                    <button
                      onClick={() => copyToClipboard(u.email)}
                      className="text-xs text-fluxy-600 hover:text-fluxy-700 font-medium"
                    >
                      {copiedEmail === u.email ? 'Copiado!' : 'Copiar e-mail'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Novo Usuário</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do Cliente</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Ex: Barbearia do João"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
                />
                <p className="text-xs text-slate-400 mt-1.5">Nome da empresa ou do cliente que terá acesso</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail de Acesso</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="cliente@email.com"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
                />
                <p className="text-xs text-slate-400 mt-1.5">Será usado para login</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="Mín. 4 caracteres"
                    required
                    minLength={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar Senha</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm({...form, confirmPassword: e.target.value})}
                    placeholder="Repita a senha"
                    required
                    minLength={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400"
                  />
                </div>
              </div>

              <div className="bg-fluxy-50 rounded-xl p-4">
                <p className="text-xs text-fluxy-700 flex items-start gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  O cliente terá acesso apenas aos próprios dados. O dashboard dele começará vazio, sem nenhum cliente, venda ou entrega pré-cadastrada.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all text-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-fluxy-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h4 className="font-semibold text-slate-900 mb-3">📋 Como funciona?</h4>
        <div className="space-y-3 text-sm text-slate-600">
          <p>1️⃣ <strong>Crie um usuário</strong> para cada cliente (ex: Barbearia, Salão, Restaurante)</p>
          <p>2️⃣ <strong>Compartilhe o e-mail e senha</strong> com seu cliente</p>
          <p>3️⃣ Cada cliente <strong>só vê os próprios dados</strong> - clientes, vendas e entregas deles</p>
          <p>4️⃣ O dashboard deles começa <strong>100% vazio</strong> - eles adicionam seus próprios dados</p>
          <p className="text-xs text-slate-400">💡 Você pode resetar os dados de um cliente a qualquer momento com o botão de refresh</p>
        </div>
      </div>
    </div>
  );
}