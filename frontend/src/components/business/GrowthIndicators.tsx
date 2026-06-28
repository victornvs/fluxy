'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { GrowthIndicator } from '@/types/business';
import { formatCurrency } from '@/lib/api';

interface GrowthIndicatorsProps {
  indicators: GrowthIndicator[];
}

function formatValue(value: number, unit: string): string {
  switch (unit) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return `${value}%`;
    default:
      return value.toString();
  }
}

export function GrowthIndicators({ indicators }: GrowthIndicatorsProps) {
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Indicadores de Crescimento</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Comparativo com o mês anterior</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {indicators.map((indicator) => {
            const isPositive = indicator.growth > 0;
            const isNeutral = indicator.growth === 0;

            return (
              <div
                key={indicator.label}
                className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors"
              >
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {indicator.label}
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {formatValue(indicator.value, indicator.unit)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {isNeutral ? (
                    <Minus className="w-3.5 h-3.5 text-slate-400" />
                  ) : isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span
                    className={clsx(
                      'text-xs font-semibold',
                      isNeutral
                        ? 'text-slate-400'
                        : isPositive
                          ? 'text-emerald-600'
                          : 'text-red-600'
                    )}
                  >
                    {isPositive ? '+' : ''}{indicator.growth}%
                  </span>
                  <span className="text-xs text-slate-400">vs anterior</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
