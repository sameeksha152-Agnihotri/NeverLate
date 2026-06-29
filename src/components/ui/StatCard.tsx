import { type ElementType } from 'react';
import { cn } from '../../utils/helpers';

interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: ElementType;
  iconClassName?: string;
  className?: string;
}

export function StatCard({ label, value, unit, icon: Icon, iconClassName, className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="stat-card__header">
        <div className="flex-1 min-w-0">
          <p className="stat-card__label">{label}</p>
          <div className="stat-card__value-row">
            <span className="stat-card__value">{value}</span>
            {unit && <span className="stat-card__unit">{unit}</span>}
          </div>
        </div>
        <div className="stat-card__icon">
          <Icon className={cn('w-5 h-5', iconClassName)} />
        </div>
      </div>
    </div>
  );
}
