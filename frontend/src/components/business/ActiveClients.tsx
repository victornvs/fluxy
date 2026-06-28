'use client';

import { Users } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Client } from '@/types/business';
import { formatCurrency, getInitials } from '@/lib/api';

interface ActiveClientsProps {
  clients: Client[];
  total: number;
}

const avatarColors = [
  'from-fluxy-400 to-fluxy-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-cyan-600',
  'from-violet-400 to-violet-600',
];

export function ActiveClients({ clients, total }: ActiveClientsProps) {
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Clientes Ativos</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              {total} clientes ativos no momento
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clients.map((client, index) => (
            <div
              key={client._id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}
              >
                {getInitials(client.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {client.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{client.company}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(client.totalRevenue)}
                </p>
                <p className="text-[10px] text-slate-400">receita total</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
