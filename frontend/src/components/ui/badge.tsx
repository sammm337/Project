import * as React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'brand' | 'neutral' | 'accent';
}

export function Badge({
  className,
  color = 'neutral',
  ...props
}: BadgeProps) {
  const palette =
    color === 'brand'
      ? 'bg-brand-500/20 text-brand-200 border-brand-400/30'
      : color === 'accent'
        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
        : 'bg-white/10 text-slate-200 border-white/20';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        palette,
        className
      )}
      {...props}
    />
  );
}

