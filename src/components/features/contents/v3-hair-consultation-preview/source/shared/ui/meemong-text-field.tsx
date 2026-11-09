'use client';
import { useId } from 'react';
import { cn } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/lib/utils';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';

/** Readable trigger for CST/TextFieldBottomSheet; Figma 5517:82133 Slot/Text Field. */
export function MeemongTextField({
  label,
  value,
  placeholder,
  onEdit,
  maxLength,
  error,
  size = 'large',
  disabled = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onEdit: () => void;
  maxLength?: number;
  error?: string;
  size?: 'medium' | 'large';
  disabled?: boolean;
}) {
  const errorId = useId();
  return (
    <div className="flex w-full flex-col gap-1">
      <button
        type="button"
        aria-label={label}
        aria-describedby={error ? errorId : undefined}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onEdit();
        }}
        className={cn(
          'flex w-full overflow-y-auto rounded-10 border bg-fill-white px-3 py-[14px] text-left whitespace-pre-wrap break-words',
          error ? 'border-status-negative-regular' : 'border-border-regular',
          size === 'large' ? 'h-[100px] items-start' : 'h-[52px] items-center',
          T.body2Regular,
          value ? 'text-text-primary' : 'text-text-tertiary',
        )}
      >
        {value || placeholder}
      </button>
      {(error || maxLength) && (
        <div
          className={cn(
            'flex min-h-[18px] items-center justify-end gap-4 px-2',
            T.caption2Medium,
            error ? 'text-status-negative-regular' : 'text-text-tertiary',
          )}
        >
          {error && (
            <span id={errorId} role="alert" className="min-w-0 flex-1">
              {error}
            </span>
          )}
          {maxLength && (
            <span className="shrink-0 text-right">
              {value.length.toLocaleString('ko-KR')}/{maxLength.toLocaleString('ko-KR')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
