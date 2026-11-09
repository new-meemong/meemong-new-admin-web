import type { ComponentProps } from 'react';

import { cn } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/lib/utils';
import { MeemongTypography } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';

type MeemongButtonProps = ComponentProps<'button'> & {
  tone?: 'brand' | 'brand-weak' | 'secondary' | 'surface' | 'inverse';
  size?: 'small' | 'medium' | 'large';
  appearance?: 'default' | 'profile';
};

export function MeemongButton({
  tone = 'brand',
  size = 'large',
  appearance = 'default',
  type = 'button',
  className,
  ...props
}: MeemongButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-10 transition-colors disabled:pointer-events-none',
        size === 'small' ? 'h-8 rounded-8 px-3' : size === 'medium' ? 'h-10 px-4' : 'h-[52px] px-4',
        tone === 'inverse'
          ? 'bg-text-inverse text-text-primary disabled:opacity-40'
          : tone === 'brand'
            ? 'bg-brand-core text-icon-inverse disabled:bg-primitive-gray-200 disabled:text-text-tertiary'
            : tone === 'brand-weak'
              ? 'bg-fill-brand-weak text-text-brand disabled:opacity-40'
              : tone === 'surface'
                ? 'bg-fill-regular text-text-primary disabled:opacity-40'
                : 'border border-border-regular bg-fill-white text-text-primary disabled:opacity-40',
        appearance === 'profile' && (size === 'small' ? 'h-9 rounded-4' : 'h-[53px] rounded-4'),
        appearance === 'profile'
          ? MeemongTypography.body2Medium
          : size === 'small'
            ? MeemongTypography.title4SemiBold
            : size === 'medium'
              ? MeemongTypography.title3SemiBold
              : MeemongTypography.title2SemiBold,
        className,
      )}
      {...props}
    />
  );
}
