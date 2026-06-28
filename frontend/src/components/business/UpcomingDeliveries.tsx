'use client';

import { Package, Clock, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Delivery } from '@/types/business';
import { formatCurrency, formatRelativeDate } from '@/lib/api';

interface UpcomingDeliveriesProps {
  deliveries: Delivery[];
}

const statusConfig = {
  scheduled: { label: 'Agendada', variant: 'info' as const },
  in_progress: { label: 'Em andamento', variant: 'purple' as const },
  delivered: { label: 'Entregue', variant: 'success' as const },
  cancelled: { label: 'Cancelada', variant: 'default' as const },
};

const priorityConfig = {
  low: { label: 'Baixa', color: 'text-slate-400' },
  medium: { label: 'Média', color: 'text-amber-500' },
  high: { label: 'Alta', color: 'text-red-500' },
};

export function UpcomingDeliveries({ deliveries }: UpcomingDeliveriesProps) {
  const inProgress = deliveries.filter((d) => d.status === 'in_progress').length;

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Próximas Entregas</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              {inProgress} em andamento · {deliveries.length} total
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-fluxy-50">
            <Package className="w-5 h-5 text-fluxy-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deliveries.map((delivery) => {
            const status = statusConfig[delivery.status];
            const priority = priorityConfig[delivery.priority];

            return (
              <div
                key={delivery._id}
                className="p-4 rounded-xl border border-slate-100 hover:border-fluxy-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {delivery.title}
                      </h4>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {delivery.clientName} · {delivery.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-fluxy-500 transition-colors shrink-0 mt-1" />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelativeDate(delivery.dueDate)}
                    </div>
                    <span className={clsx('text-xs font-medium', priority.color)}>
                      ● {priority.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(delivery.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
