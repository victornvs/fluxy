'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, CheckCircle, Clock, AlertTriangle, Trash2, Edit, X, Loader2 } from 'lucide-react';

import { fetchWithAuth } from '@/lib/api-client';

interface Payment {
  _id: string;
  clientName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
}

export function FinanceiroContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState({ clientName: '', description: '', amount: 0, dueDate: '', status: 'pending' as string, paymentMethod: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setPayments(await fetchWithAuth<Payment[]>('/api/business/payments/upcoming'));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const totalPending = payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((a, p) => a + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0);
  const filtered = payments.filter(p => p.clientName.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  const statusConfig: Record<string, { label: string; icon: any; class: string }> = {
    pending: { label: 'Pendente', icon: Clock, class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    paid: { label: 'Pago', icon: CheckCircle, class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    overdue: { label: 'Vencido', icon: AlertTriangle, class: 'bg-red-500/10 text-red-400 border-red-500/20' },
    cancelled: { label: 'Cancelado', icon: X, class: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  };

  async function handleDelete(id: string) {
    if (!confirm('Remover este recebimento?')) return;
    try { await fetchWithAuth<void>(`/api/payments/${id}`, { method: 'DELETE' }); load(); }
    catch (e) { console.error(e); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const path = editing ? `/api/payments/${editing._id}` : '/api/payments';
      await fetchWithAuth<Payment>(path, {
        method,
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      setShowModal(false);
      load();
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-fluxy-500 animate-spin" /></div>;

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2"><p className="text-sm text-slate-500">Total a Receber</p><DollarSign className="w-5 h-5 text-fluxy-500" /></div>
          <p className="text-2xl font-bold text-slate-900">{fmt(totalPending)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2"><p className="text-sm text-slate-500">Recebido</p><TrendingUp className="w-5 h-5 text-emerald-500" /></div>
          <p className="text-2xl font-bold text-emerald-600">{fmt(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2"><p className="text-sm text-slate-500">Pendentes</p><Clock className="w-5 h-5 text-amber-500" /></div>
          <p className="text-2xl font-bold text-amber-600">{payments.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2"><p className="text-sm text-slate-500">Vencidos</p><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <p className="text-2xl font-bold text-red-600">{payments.filter(p => p.status === 'overdue').length}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar recebimentos..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400 shadow-sm" />
        </div>
        <button onClick={() => { setEditing(null); setForm({ clientName: '', description: '', amount: 0, dueDate: '', status: 'pending', paymentMethod: '' }); setShowModal(true); }} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-fluxy-500/25 transition-all">
          <Plus className="w-5 h-5" /> Novo Recebimento
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(p => {
          const st = statusConfig[p.status] || statusConfig.pending;
          const StIcon = st.icon;
          const daysDiff = Math.ceil((new Date(p.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={p._id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-fluxy-200 transition-all p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${st.class}`}>
                      <StIcon className="w-3.5 h-3.5" />{st.label}
                    </span>
                    {p.paymentMethod && <span className="text-xs text-slate-400">{p.paymentMethod}</span>}
                    {daysDiff <= 3 && p.status !== 'paid' && daysDiff > 0 && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">Vence em {daysDiff}d</span>}
                    {daysDiff <= 0 && p.status !== 'paid' && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg font-medium">⚠️ Vencido</span>}
                  </div>
                  <p className="font-semibold text-slate-900">{p.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span>👤 {p.clientName}</span>
                    <span>📅 {new Date(p.dueDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-lg font-bold text-slate-900">{fmt(p.amount)}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(p._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">Nenhum recebimento encontrado</h3>
            <p className="text-sm text-slate-400 mt-1">Adicione seu primeiro recebimento</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Editar Recebimento' : 'Novo Recebimento'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label><input type="text" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Valor (R$)</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} required min="0" step="0.01" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="Ex: Site - Parcela 2/3" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Data Vencimento</label><input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400">
                  <option value="pending">Pendente</option><option value="paid">Pago</option><option value="overdue">Vencido</option><option value="cancelled">Cancelado</option>
                </select></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Método de Pagamento</label>
                <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400">
                  <option value="">Selecione</option><option value="PIX">PIX</option><option value="Boleto">Boleto</option><option value="Transferência">Transferência</option><option value="Cartão">Cartão</option><option value="Dinheiro">Dinheiro</option>
                </select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 text-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-fluxy-500/25 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : editing ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}