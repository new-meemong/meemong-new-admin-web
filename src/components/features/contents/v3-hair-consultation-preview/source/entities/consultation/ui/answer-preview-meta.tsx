import type { AnswerFeedback } from '../api/contracts';
import { MeemongTag } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-tag';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';

/** AnswerStatusTag 5674:45786/45785/45975: Small Bold tags, Hug22/r6. */
export function AnswerStatusTag({
  answer,
  variant = 'default',
}: {
  answer: Pick<AnswerFeedback, 'reviewed' | 'isRead'>;
  variant?: 'default' | 'consultingDetail';
}) {
  return (
    <MeemongTag
      weight="bold"
      color={answer.reviewed ? 'green' : answer.isRead ? 'blue' : 'neutral'}
    >
      {answer.reviewed
        ? '평가함'
        : answer.isRead
          ? variant === 'consultingDetail'
            ? '열람함'
            : '읽음'
          : '안읽음'}
    </MeemongTag>
  );
}

export function AnswerSubmittedDate({
  value,
  variant = 'card',
}: {
  value: unknown;
  variant?: 'card' | 'detail';
}) {
  const date = typeof value === 'string' && value.trim() ? new Date(value) : null;
  if (!date || !Number.isFinite(date.getTime())) return null;
  return (
    <span
      className={`shrink-0 text-text-tertiary ${variant === 'detail' ? `block text-right ${T.caption2Medium}` : T.body5Regular}`}
    >
      {new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
        .format(date)
        .replace(/\s/g, '')
        .replace(/\.$/, '')}
      {variant === 'detail' && ' 답변'}
    </span>
  );
}
