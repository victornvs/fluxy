'use client';

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/lib/api';
import { Target } from 'lucide-react';

interface GoalProgressProps {
  monthlyRevenue: number;
  monthlyGoal: number;
  goalProgress: number;
  month: string;
  year: number;
}

export function GoalProgress({
  monthlyRevenue,
  monthlyGoal,
  goalProgress,
  month,
  year,
}: GoalProgressProps) {
  const remaining = monthlyGoal - monthlyRevenue;

  return (
    <Card className="animate-slide-up overflow-hidden">
      <div className="metric-gradient p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-90">
            Meta de {month} {year}
          </span>
        </div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-3xl font-bold tracking-tight">
              {formatCurrency(monthlyRevenue)}
            </p>
            <p className="text-sm opacity-75 mt-1">
              de {formatCurrency(monthlyGoal)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{goalProgress}%</p>
            <p className="text-xs opacity-75">atingido</p>
          </div>
        </div>
        <ProgressBar value={goalProgress} size="lg" color="success" />
      </div>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Faltam para a meta</span>
          <span className="font-semibold text-slate-900">
            {remaining > 0 ? formatCurrency(remaining) : '🎉 Meta atingida!'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
