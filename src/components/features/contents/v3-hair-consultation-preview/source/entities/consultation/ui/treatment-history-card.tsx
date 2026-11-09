'use client';

import { cn } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/lib/utils';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';
import { MeemongButton } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-button';
import { MeemongTextField } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-text-field';
import { ConsultationAsset } from './consultation-assets';
import { ExceptionButton } from './question-controls';

export type TreatmentHistoryEntry = {
  id: string;
  date: string;
  title: string;
  description?: string;
};
// Card instances override the date to 13/20; the standalone source is 14/22 (5517:24533, 5517:25143).
export function TreatmentHistoryItem({
  date,
  title,
  description,
  divider = true,
  showDescription = true,
  compactDate = false,
  className,
}: Omit<TreatmentHistoryEntry, 'id'> & {
  divider?: boolean;
  showDescription?: boolean;
  compactDate?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex w-[245px] items-start gap-3 py-3',
        divider && 'shadow-[inset_0_-1px_0_var(--color-divider-weak)]',
        className,
      )}
    >
      <span
        className={cn(
          'shrink-0 text-text-secondary',
          compactDate ? T.title4SemiBold : T.title3SemiBold,
        )}
      >
        {date}
      </span>
      <div className="flex min-w-0 flex-col">
        <p className={cn('text-text-secondary', T.body4Regular)}>{title}</p>
        {showDescription && description && (
          <p className={cn('text-text-tertiary', T.body5Regular)}>{description}</p>
        )}
      </div>
    </div>
  );
}

export function TreatmentHistoryCard({
  entries,
  note,
  onNoteEdit,
  onEdit,
  editLabel,
  noHistory = false,
  onNoHistoryChange,
  className,
}: {
  entries: TreatmentHistoryEntry[];
  note: string;
  onNoteEdit: () => void;
  onEdit: () => void;
  editLabel?: string;
  noHistory?: boolean;
  onNoHistoryChange: (selected: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex w-64 flex-col items-end gap-2', className)}>
      <div className="flex w-full flex-col gap-1 rounded-12 border border-border-regular bg-fill-white px-4 py-3">
        {entries.length ? (
          <div>
            {entries.map((entry, index) => (
              <TreatmentHistoryItem
                {...entry}
                compactDate
                key={entry.id}
                divider={index < entries.length - 1}
                className="w-full"
              />
            ))}
          </div>
        ) : (
          <p className={cn('p-3 text-center text-text-caption', T.body5Regular)}>
            등록된 시술 이력이 없어요
          </p>
        )}
        <MeemongButton size="small" tone="surface" className="w-full gap-1" onClick={onEdit}>
          {editLabel ?? (entries.length ? '이력 수정하기' : '이력 추가하기')}
          <ConsultationAsset name="edit" />
        </MeemongButton>
      </div>
      <MeemongTextField
        label="추가 시술 이력"
        value={note}
        placeholder="작업 시 추가로 참고할 이력이 있다면 알려주세요"
        onEdit={onNoteEdit}
      />
      {entries.length === 0 && (
        <ExceptionButton active={noHistory} onClick={() => onNoHistoryChange(!noHistory)} />
      )}
    </div>
  );
}
