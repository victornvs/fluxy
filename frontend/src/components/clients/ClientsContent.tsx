'use client';

import { useState, useEffect } from 'react';
import { fetchClients, createClient, updateClient, deleteClient, getStatusLabel, getStatusColor } from '@/lib/api-clients';
import { Client } from '@/types/business';
import { Plus, Search, Mail, Phone, Building2, Trash2, Edit, X, Loader2, CheckCircle, XCircle, Clock, UserPlus } from 'lucide-react';

export function ClientsContent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', status: 'active' as string, notes: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setClients(await fetchClients());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', company: '', status: 'active', notes: '' });
    setShowModal(true);
  }

  function openEdit(c: Client) {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, status: c.status, notes: (c as any).notes || '' });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este cliente?')) return;
    await deleteClient(id);
    load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const clientData = { ...form, status: form.status as 'active' | 'inactive' | 'pending' };
      if (editing) {
        await updateClient(editing._id, clientData);
      } else {
        await createClient(clientData);
      }
      setShowModal(false);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-fluxy-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: clients.length, color: 'from-fluxy-500 to-fluxy-600' },
          { label: 'Ativos', value: clients.filter(c => c.status === 'active').length, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Inativos', value: clients.filter(c => c.status === 'inactive').length, color: 'from-slate-500 to-slate-600' },
          { label: 'Pendentes', value: clients.filter(c => c.status === 'pending').length, color: 'from-amber-500 to-amber-600' },
        ].map((s, i) => (
          <div key={i} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur transition duration-300 rounded-2xl" />
            <div className="relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">{s.label}</p>
              <p className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${s.color}">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar clientes..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400 transition-all shadow-sm"
          />
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-fluxy-500/25 transition-all duration-300">
          <UserPlus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">Nenhum cliente encontrado</h3>
          <p className="text-sm text-slate-400 mt-1">Adicione seu primeiro cliente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(c => (
            <div key={c._id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-fluxy-200 transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fluxy-400 to-fluxy-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-fluxy-500/20">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{c.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium border ${getStatusColor(c.status)}`}>
                        {c.status === 'active' ? <CheckCircle className="w-3 h-3" /> : c.status === 'inactive' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {getStatusLabel(c.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {c.email}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {c.phone}
                  </div>
                  {c.company && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {c.company}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Desde {new Date(c.joinedAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-fluxy-600 hover:bg-fluxy-50 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Nome do cliente" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="email@exemplo.com" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
                  <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="(11) 99999-9999" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Empresa</label>
                  <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Nome da empresa" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Observações</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Anotações sobre o cliente..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all text-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-fluxy-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : editing ? 'Atualizar' : 'Criar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}