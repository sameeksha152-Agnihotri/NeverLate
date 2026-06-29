import { type ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  variant?: 'default' | 'achievement-unlocked' | 'achievement-locked';
}

export function Card({
  children,
  className,
  onClick,
  hoverable = true,
  variant = 'default',
}: CardProps) {
  return (
    <div
      className={cn(
        'app-card',
        hoverable && 'app-card--hoverable',
        variant === 'achievement-unlocked' && 'app-card--achievement-unlocked',
        variant === 'achievement-locked' && 'app-card--achievement-locked',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('card-header', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card-body', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('card-footer', className)}>
      {children}
    </div>
  );
}
