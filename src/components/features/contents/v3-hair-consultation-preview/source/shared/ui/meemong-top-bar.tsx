'use client';

import type { ReactNode } from 'react';

import ChevronRightStrokeIcon from '@/components/features/contents/v3-hair-consultation-preview/source/assets/icons/meemong-chevron-right-stroke.svg';
import { cn } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/lib/utils';
import { MeemongTypography } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';

type MeemongTopBarProps = {
  title?: string;
  titleSize?: 'default' | 'large';
  alignment?: 'center' | 'left';
  showBackButton?: boolean;
  reverse?: boolean;
  background?: boolean;
  onBackClick?: () => void;
  backIcon?: ReactNode;
  onTitleClick?: () => void;
  rightComponent?: ReactNode;
  rightSizing?: 'fixed' | 'content';
  closeAction?: { onClick: () => void; label?: string; disabled?: boolean };
  className?: string;
};

export function MeemongTopBar({
  title,
  titleSize = 'default',
  alignment = 'center',
  showBackButton = true,
  reverse = false,
  background = true,
  onBackClick,
  backIcon,
  onTitleClick,
  rightComponent,
  rightSizing = 'fixed',
  closeAction,
  className,
}: MeemongTopBarProps) {


  return (
    <header
      className={cn(
        'flex h-[50px] shrink-0 items-center justify-between px-0.5',
        showBackButton && 'sticky top-0 z-20',
        reverse ? 'text-icon-inverse' : 'text-text-primary',
        background && (reverse ? 'bg-brand-core' : 'bg-background-white'),
        className,
      )}
    >
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center',
          alignment === 'left' && !showBackButton && 'hidden',
        )}
      >
        {showBackButton && (
          <button
            type="button"
            onClick={onBackClick}
            className="flex size-11 items-center justify-center"
            aria-label="뒤로 가기"
          >
            {backIcon ?? <ChevronRightStrokeIcon className="h-[18px] w-[11px] rotate-180" />}
          </button>
        )}
      </div>

      {title ? (
        <h1
          className={cn(
            'min-w-0 flex-1 truncate',
            alignment === 'left'
              ? 'pl-3.5 text-left ' + MeemongTypography.heading3Bold
              : 'text-center ' +
                  (titleSize === 'large'
                    ? MeemongTypography.heading3SemiBold
                    : MeemongTypography.title1SemiBold),
          )}
        >
          {onTitleClick ? (
            <button
              type="button"
              className="max-w-full truncate"
              onClick={onTitleClick}
              aria-label={`${title} 프로필`}
            >
              {title}
            </button>
          ) : (
            title
          )}
        </h1>
      ) : (
        <div className="min-w-0 flex-1" />
      )}

      <div
        className={cn(
          'flex h-11 shrink-0 items-center justify-center',
          rightSizing === 'fixed' ? 'w-11' : 'min-w-11',
        )}
      >
        {rightComponent ??
          (closeAction && (
            <button
              type="button"
              className="flex size-11 items-center justify-center"
              aria-label={closeAction.label ?? '닫기'}
              disabled={closeAction.disabled}
              onClick={closeAction.onClick}
            >
              <span
                aria-hidden
                className={cn('size-6', reverse ? 'bg-icon-inverse' : 'bg-icon-primary')}
                style={{
                  mask: 'url(/v3-hair-preview/assets/consultation/close-line.svg) center / contain no-repeat',
                  WebkitMask: 'url(/v3-hair-preview/assets/consultation/close-line.svg) center / contain no-repeat',
                }}
              />
            </button>
          ))}
      </div>
    </header>
  );
}
