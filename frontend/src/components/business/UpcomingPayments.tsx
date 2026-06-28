'use client';

import { CreditCard, Clock, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Payment } from '@/types/business';
import { formatCurrency, formatRelativeDate } from '@/lib/api';

interface UpcomingPaymentsProps {
  payments: Payment[];
}

const statusConfig = {
  pending: { label: 'Pendente', variant: 'warning' as const },
  paid: { label: 'Pago', variant: 'success' as const },
  overdue: { label: 'Atrasado', variant: 'danger' as const },
  cancelled: { label: 'Cancelado', variant: 'default' as const },
};

export function UpcomingPayments({ payments }: UpcomingPaymentsProps) {
  const totalPending = payments
    .filter((p) => p.status !== 'paid' && p.status !== 'cancelled')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Próximos Recebimentos</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Total a receber: <span className="font-semibold text-slate-700">{formatCurrency(totalPending)}</span>
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map((payment) => {
            const config = statusConfig[payment.status];
            const isOverdue = payment.status === 'overdue';

            return (
              <div
                key={payment._id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-slate-100'}`}>
                  {isOverdue ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {payment.clientName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {payment.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(payment.amount)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 justify-end">
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatRelativeDate(payment.dueDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
