import clsx from 'clsx';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-slate-100 text-slate-600',
    card: '',
  },
  primary: {
    icon: 'bg-fluxy-100 text-fluxy-600',
    card: '',
  },
  success: {
    icon: 'bg-emerald-100 text-emerald-600',
    card: '',
  },
  warning: {
    icon: 'bg-amber-100 text-amber-600',
    card: '',
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default',
  className,
}: MetricCardProps) {
  const styles = variantStyles[variant];
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <Card hover className={clsx('p-6 animate-slide-up', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl', styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-50">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span
            className={clsx(
              'text-sm font-semibold',
              isPositive ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {isPositive ? '+' : ''}{trend}%
          </span>
          {trendLabel && (
            <span className="text-xs text-slate-400">{trendLabel}</span>
          )}
        </div>
      )}
    </Card>
  );
}
