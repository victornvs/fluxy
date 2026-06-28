'use client';

import { Bell, Search, Calendar, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800/80 shadow-lg shadow-slate-950/20 dark:bg-slate-950/95 light:bg-white/80 light:border-slate-200 light:shadow-none">
      <div className="flex flex-col gap-4 px-8 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-fluxy-200/80">
            Visão estratégica
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white light:text-slate-950 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-300 light:text-slate-600">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-slate-900/90 px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10 light:bg-slate-100 light:text-slate-700 light:ring-slate-200">
            <Calendar className="w-4 h-4 text-fluxy-300" />
            <span className="capitalize">{today}</span>
          </div>

          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar relatórios, clientes ou entregas"
              className="pl-10 pr-4 py-2.5 w-72 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-fluxy-500/30 focus:border-fluxy-500 transition-all light:bg-slate-100 light:border-slate-200 light:text-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900/90 px-4 py-2 text-sm text-slate-200 transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-fluxy-500/30 light:bg-slate-100 light:text-slate-900"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 mr-2 text-fluxy-300" />
            ) : (
              <Moon className="w-4 h-4 mr-2 text-fluxy-500" />
            )}
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </button>

          <button className="relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-fluxy-500 to-fluxy-600 px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-fluxy-500/30 hover:brightness-110 transition-all">
            <Bell className="w-4 h-4 mr-2" />
            2 alertas
          </button>
        </div>
      </div>
    </header>
  );
}
