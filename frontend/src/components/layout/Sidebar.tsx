'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  Globe,
  LogOut,
  ChevronRight,
  Shield,
  User,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

const mainNav = [
  { name: 'Meu Negócio', href: '/meu-negocio', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Entregas', href: '/entregas', icon: Package },
  { name: 'Financeiro', href: '/financeiro', icon: CreditCard },
  { name: 'Portfólio', href: '/portfolio', icon: Globe },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
];

const bottomNav = [
  { name: 'Meu Perfil', href: '/perfil', icon: User },
  { name: 'Ajuda', href: '#', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const navigation = isAdmin
    ? [...mainNav, { name: 'Usuários', href: '/usuarios', icon: Shield }]
    : mainNav;

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-fluxy-950 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10 min-h-[80px]">
        <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-fluxy-400 to-fluxy-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-fluxy-500/30">
          FX
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold text-white tracking-tight">Fluxy</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              Gestão moderna
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className={`px-3 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest ${collapsed && 'text-center'}`}>
          {collapsed ? '...' : 'Menu Principal'}
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'sidebar-item relative group',
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive',
                collapsed && 'justify-center px-3'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="animate-fade-in">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-white/60" />
                  )}
                </>
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={`px-3 py-4 border-t border-white/10 space-y-1 ${collapsed && 'text-center'}`}>
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-item sidebar-item-inactive ${collapsed && 'justify-center px-3'}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="animate-fade-in">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* User */}
      <div className={`px-3 py-4 border-t border-white/10 ${collapsed && 'text-center'}`}>
        <Link href="/perfil" className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2 hover:bg-white/5 rounded-xl transition-all`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fluxy-400 to-fluxy-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-fluxy-500/20 flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'V'}
            {user?.name?.split(' ')[1]?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Fluxy User'}</p>
              <p className="text-xs text-slate-400 truncate">
                {user?.role === 'admin' ? '👑 Admin' : `Plano ${user?.plan || 'Free'}`}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); router.push('/login'); }}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-50"
      >
        <ChevronRight className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
    </aside>
  );
}