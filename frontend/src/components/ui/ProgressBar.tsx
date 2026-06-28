import clsx from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
  color = 'primary',
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    primary: 'bg-gradient-to-r from-fluxy-600 to-fluxy-400',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-400',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">Progresso</span>
          <span className="text-xs font-semibold text-slate-700">{percentage}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-slate-100 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={clsx('h-full rounded-full transition-all duration-700 ease-out', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
