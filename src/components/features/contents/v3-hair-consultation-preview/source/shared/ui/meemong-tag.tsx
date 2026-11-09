import type { ReactNode } from 'react';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';

/** Tag: Small Regular Blue 773:166; Small Bold Neutral/Blue/Green 5611:77698/77700/77702; Medium Regular 5611:77728/77727/77726. */
export function MeemongTag({
  children,
  size = 'small',
  weight = 'regular',
  color = 'neutral',
}: {
  children: ReactNode;
} & (
  | { size?: 'small'; weight?: 'regular' | 'bold'; color?: 'neutral' | 'blue' }
  | { size?: 'small'; weight: 'bold'; color: 'green' }
  | { size: 'tiny'; weight?: 'regular'; color?: 'neutral' }
  | {
      size: 'medium';
      weight?: 'regular';
      color?: 'neutral' | 'blue' | 'orange';
    }
)) {
  const colors = {
    neutral: 'bg-fill-regular text-text-secondary',
    blue: 'bg-status-information-weak text-status-information-regular',
    orange: 'bg-primitive-orange-50 text-primitive-red-orange-500',
    green: 'bg-status-positive-weak text-status-positive-strong',
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-6 ${colors[color]} py-0.5 ${size === 'tiny' ? `gap-0.5 px-1 ${T.caption3SemiBold}` : `gap-1 px-1.5 ${size === 'medium' ? T.body4Regular : weight === 'bold' ? T.caption1SemiBold : T.caption2Medium}`}`}
    >
      {children}
    </span>
  );
}
