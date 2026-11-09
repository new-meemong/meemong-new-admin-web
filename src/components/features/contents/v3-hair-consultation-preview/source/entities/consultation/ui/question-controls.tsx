'use client';

import { type ComponentProps, type ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/lib/utils';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';
import { MeemongButton } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-button';
import { SelectionIndicator } from './selection-indicator';

export function ScrollFadeGradient({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none relative h-4 w-[280px]', className)}>
      <Image
        src="/v3-hair-preview/assets/consultation/c9159.png"
        alt=""
        fill
        sizes="280px"
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

export function QuestionSubmitButton({
  active = false,
  variant = 'Gradient',
  children = '다음',
  className,
  disabled,
  ...props
}: Omit<ComponentProps<'button'>, 'style'> & {
  active?: boolean;
  variant?: 'Gradient' | 'Default';
}) {
  return (
    <div className={cn('w-[280px]', className)}>
      {variant === 'Gradient' && <ScrollFadeGradient className="w-full" />}
      <div className="bg-fill-white px-3 pt-2 pb-3">
        <MeemongButton {...props} size="medium" disabled={!active || disabled} className="w-full">
          {children}
        </MeemongButton>
      </div>
    </div>
  );
}

export function ExceptionButton({
  active = false,
  variant = 'default',
  children = '반년간 시술 이력이 없어요',
  className,
  ...props
}: ComponentProps<'button'> & { active?: boolean; variant?: 'default' | 'profile' }) {
  return (
    <button
      {...props}
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-end gap-2 rounded-10 bg-fill-weak p-3 disabled:opacity-40',
        variant === 'profile' ? T.title3SemiBold : T.title4SemiBold,
        active ? 'text-text-primary' : 'text-text-secondary',
        variant === 'profile' && [
          'rounded-12 text-text-primary',
          active ? 'bg-fill-weak' : 'bg-fill-white',
        ],
        className,
      )}
    >
      {children}
      <SelectionIndicator shape="round" selected={active} variant={variant} />
    </button>
  );
}

export function AnsweredQuestionChip({
  children,
  state = 'Default',
  showDescription = true,
  onEdit,
  onCancelEdit,
  className,
}: {
  children: ReactNode;
  state?: 'Default' | 'Editing';
  showDescription?: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-end', className)}>
      <div
        className={cn(
          'max-w-[280px] rounded-[12px_4px_12px_12px] bg-primitive-gray-800 p-3 text-text-inverse whitespace-pre-wrap break-words',
          T.body3Regular,
        )}
      >
        {children}
      </div>
      {showDescription && (
        <button
          type="button"
          className={cn(
            'px-3 py-2 text-text-tertiary underline underline-offset-2',
            T.title3SemiBold,
          )}
          onClick={state === 'Editing' ? onCancelEdit : onEdit}
        >
          {state === 'Editing' ? '수정 취소' : '수정'}
        </button>
      )}
    </div>
  );
}
