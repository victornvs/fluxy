'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { User, Camera, Phone, Smartphone, Bell, Loader2, Save, CheckCircle, AlertTriangle, Send, Lock, Eye, EyeOff } from 'lucide-react';

import { fetchWithAuth } from '@/lib/api-client';

export function PerfilContent() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    whatsappEnabled: false,
    weeklyReport: true,
    monthlyReport: true,
    deliveryReminders: true,
    paymentReminders: true,
  });

  // Notifications from API
  const [notifList, setNotifList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotif, setLoadingNotif] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setWhatsapp(user.whatsapp || '');
      if ((user as any).notifications) {
        setNotifications((user as any).notifications);
      }
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const data = await fetchWithAuth<{ notifications: any[]; unreadCount: number }>('/api/notifications');
      setNotifList(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) { console.error(e); }
    finally { setLoadingNotif(false); }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updatedUser = await fetchWithAuth<any>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone, whatsapp, notifications }),
      });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (updateUser) updateUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePassword() {
    if (newPassword !== confirmPassword) {
      setError('Senhas não conferem');
      return;
    }
    if (newPassword.length < 4) {
      setError('Senha deve ter no mínimo 4 caracteres');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await fetchWithAuth('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setSuccess('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleTestWhatsApp() {
    setSaving(true);
    setError('');
    try {
      await fetchWithAuth('/api/notifications/test-whatsapp', {
        method: 'POST',
      });
      setSuccess('📱 Mensagem de teste enviada para seu WhatsApp!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (e: any) {
      setError(e.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateReport(type: 'weekly' | 'monthly') {
    setSaving(true);
    try {
      await fetchWithAuth(`/api/notifications/${type}-report`, { method: 'POST' });
      setSuccess(`📊 Relatório ${type === 'weekly' ? 'semanal' : 'mensal'} gerado!`);
      loadNotifications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleMarkAllRead() {
    await fetchWithAuth('/api/notifications/read-all', { method: 'PUT' });
    loadNotifications();
  }

  const notifIcons: Record<string, string> = {
    weekly_report: '📊',
    monthly_report: '📈',
    delivery_reminder: '⏰',
    payment_reminder: '💳',
    payment_overdue: '⚠️',
    welcome: '👋',
    custom: '🔔',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success/Error */}
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

      {/* Profile Info */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-fluxy-600 to-violet-600 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'V'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                <Camera className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-white/70 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-white/20 px-3 py-0.5 rounded-full">
                {user?.role === 'admin' ? '👑 Administrador' : `Plano ${user?.plan || 'Free'}`}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-fluxy-500" />
            Informações Pessoais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">O e-mail não pode ser alterado</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                WhatsApp <span className="text-xs text-slate-400">(para notificações)</span>
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5511999999999" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 focus:border-fluxy-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Formato: 5511999999999 (código do país + DDD + número)</p>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-fluxy-500/25 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-fluxy-500" />
            Notificações
          </h3>
          <div className="flex items-center gap-3">
            <button onClick={() => handleGenerateReport('weekly')} disabled={saving} className="px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
              📊 Relatório Semanal
            </button>
            <button onClick={() => handleGenerateReport('monthly')} disabled={saving} className="px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
              📈 Relatório Mensal
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* WhatsApp */}
          <div className="p-5 bg-gradient-to-r from-emerald-50/50 to-white rounded-2xl border border-emerald-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Notificações por WhatsApp</p>
                  <p className="text-sm text-slate-500">
                    {whatsapp ? `Enviando para: ${whatsapp}` : 'Configure seu WhatsApp acima'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifications.whatsappEnabled} onChange={e => setNotifications({...notifications, whatsappEnabled: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fluxy-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {whatsapp && notifications.whatsappEnabled && (
              <button
                onClick={handleTestWhatsApp}
                disabled={saving}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Testar WhatsApp
              </button>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            {[
              { key: 'weeklyReport', label: 'Relatório Semanal', desc: 'Resumo do faturamento e entregas da semana' },
              { key: 'monthlyReport', label: 'Relatório Mensal', desc: 'Resumo completo do mês com metas e resultados' },
              { key: 'deliveryReminders', label: 'Lembretes de Entregas', desc: 'Alertas quando uma entrega estiver próxima do prazo' },
              { key: 'paymentReminders', label: 'Lembretes de Recebimentos', desc: 'Alertas de contas a receber próximas do vencimento' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={(notifications as any)[item.key]} onChange={e => setNotifications({...notifications, [item.key]: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fluxy-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fluxy-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-fluxy-500/25 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Preferências
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-fluxy-500" />
            Segurança
          </h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-fluxy-600 hover:text-fluxy-700 font-medium"
          >
            {showPasswordForm ? 'Cancelar' : 'Alterar Senha'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={(e) => { e.preventDefault(); handleSavePassword(); }} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha Atual</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nova Senha</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={4} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar Senha</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={4} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fluxy-500/20" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-fluxy-500 to-fluxy-600 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Atualizar Senha
            </button>
          </form>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-fluxy-500" />
            Histórico de Notificações
            {unreadCount > 0 && (
              <span className="text-xs bg-fluxy-500 text-white px-2 py-0.5 rounded-full">{unreadCount} novas</span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-sm text-fluxy-600 hover:text-fluxy-700 font-medium">
              Marcar todas como lidas
            </button>
          )}
        </div>

        {loadingNotif ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-fluxy-500 animate-spin" /></div>
        ) : notifList.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhuma notificação ainda</p>
            <p className="text-sm text-slate-400 mt-1">As notificações aparecerão aqui quando você gerar relatórios</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifList.map((n: any) => (
              <div key={n._id} className={`p-4 rounded-xl border transition-all ${n.read ? 'bg-white border-slate-100' : 'bg-fluxy-50/50 border-fluxy-200'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">{notifIcons[n.type] || '🔔'}</span>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                      <span>{new Date(n.createdAt).toLocaleDateString('pt-BR')} às {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.sentWhatsApp && <span className="text-emerald-500">✅ WhatsApp</span>}
                    </div>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-fluxy-500 rounded-full flex-shrink-0 mt-2" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}