import type { ComponentProps } from 'react';

import { cn } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/lib/utils';
import { Separator } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/separator';

type MeemongDividerProps = ComponentProps<'div'> & {
  padded?: boolean;
  thickness?: '1px' | '8px' | '12px';
};

export function MeemongDivider({
  thickness = '1px',
  padded = false,
  className,
  ...props
}: MeemongDividerProps) {
  if (thickness === '1px') {
    if (padded) {
      // Figma 5698:111737: zero-height LINE with centered 1px stroke in 24px.
      // Its Color=Regular binds Gray/100, the existing divider-weak token.
      return (
        <div {...props} className={cn('flex h-6 w-full shrink-0 items-center px-4', className)}>
          <Separator />
        </div>
      );
    }
    return <Separator className={cn('bg-divider-weak', className)} {...props} />;
  }

  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn(
        'w-full shrink-0 bg-background-weak',
        thickness === '12px' ? 'h-3' : 'h-2',
        padded && 'my-4',
        className,
      )}
    />
  );
}
