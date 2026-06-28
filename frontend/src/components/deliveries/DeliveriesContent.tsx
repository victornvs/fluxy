'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, Trash2, Edit, X, Loader2, ArrowUp, ArrowDown, Minus, Package } from 'lucide-react';

import { fetchWithAuth } from '@/lib/api-client';

interface Delivery {
  _id: string;
  clientName: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'scheduled' | 'in_progress' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  value: number;
}

const statusConfig: Record<string, { label: string; icon: any; class: string }> = {
  scheduled: { label: 'Agendado', icon: Calendar, class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  in_progress: { label: 'Em andamento', icon: Clock, class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  delivered: { label: 'Entregue', icon: CheckCircle, class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelled: { label: 'Cancelado', icon: XCircle, class: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const priorityConfig: Record<string, { icon: any; class: string }> = {
  high: { icon: ArrowUp, class: 'text-red-500' },
  medium: { icon: Minus, class: 'text-amber-500' },
  low: { icon: ArrowDown, class: 'text-emerald-500' },
};

export function DeliveriesContent() {
  const [items, setItems] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Delivery | null>(null);
  const [form, setForm] = useState({ title: '', description: '', clientName: '', dueDate: '', status: 'scheduled' as string, priority: 'medium' as string, value: 0 });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setItems(await fetchWithAuth<Delivery[]>('/api/deliveries'));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = items.filter(i => i.status === 'in_progress').length;
  const overdueCount = items.filter(i => i.status === 'scheduled' && new Date(i.dueDate) < new Date()).length;

  async function handleDelete(id: string) {
    if (!confirm('Remover esta entrega?')) return;
    try {
      await fetchWithAuth<void>(`/api/deliveries/${id}`, { method: 'DELETE' });
      load();
    } catch (e) { console.error(e); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const path = editing ? `/api/deliveries/${editing._id}` : '/api/deliveries';
      await fetchWithAuth<Delivery>(path, { method, body: JSON.stringify(form) });
      setShowModal(false);
      load();
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-fluxy-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Total</p>
          <p className="text-3xl font-bold text-slate-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Em Andamento</p>
          <p className="text-3xl font-bold text-amber-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Entregues</p>
          <p className="text-3xl font-bold text-emerald-600">{items.filter(i => i.status === 'delivered').length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Atrasados</p>
          <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar entregas..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400 shadow-sm" />
        </div>
        <button onClick={() => { setEditing(null); setForm({ title: '', description: '', clientName: '', dueDate: '', status: 'scheduled', priority: 'medium', value: 0 }); setShowModal(true); }} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-fluxy-500/25 transition-all">
          <Plus className="w-5 h-5" /> Nova Entrega
        </button>
      </div>

      <div className="grid gap-4">
        {filtered.map(item => {
          const st = statusConfig[item.status] || statusConfig.scheduled;
          const pr = priorityConfig[item.priority] || priorityConfig.medium;
          const PrIcon = pr.icon;
          const StIcon = st.icon;
          const daysLeft = Math.ceil((new Date(item.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={item._id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-fluxy-200 transition-all p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${st.class}`}>
                      <StIcon className="w-3.5 h-3.5" />
                      {st.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${pr.class} bg-slate-50`}>
                      <PrIcon className="w-3.5 h-3.5" />
                      {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                    {daysLeft <= 3 && item.status !== 'delivered' && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {daysLeft <= 0 ? 'Atrasado' : `${daysLeft} dias`}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span>👤 {item.clientName}</span>
                    <span>📅 {new Date(item.dueDate).toLocaleDateString('pt-BR')}</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditing(item); setForm({ title: item.title, description: item.description, clientName: item.clientName, dueDate: item.dueDate.split('T')[0], status: item.status, priority: item.priority, value: item.value }); setShowModal(true); }} className="p-2 text-slate-400 hover:text-fluxy-600 hover:bg-fluxy-50 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">Nenhuma entrega encontrada</h3>
            <p className="text-sm text-slate-400 mt-1">Adicione sua primeira entrega</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Editar Entrega' : 'Nova Entrega'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Título</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Título da entrega" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={2} placeholder="Descrição..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400 resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label><input type="text" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} required placeholder="Cliente" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Data</label><input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400">
                  <option value="scheduled">Agendado</option><option value="in_progress">Em andamento</option><option value="delivered">Entregue</option><option value="cancelled">Cancelado</option>
                </select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Prioridade</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400">
                  <option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option>
                </select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Valor (R$)</label><input type="number" value={form.value} onChange={e => setForm({...form, value: Number(e.target.value)})} min="0" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" /></div>
              </div>
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