import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';
import { MeemongTag } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-tag';

/** BasicInfoSummary 5664:31480; four rows, Small/Regular/Neutral tags (5611:77705). */
export function BasicInfoSummary({
  hairLength,
  skinTone,
  hairType,
  preferredRegions,
}: {
  hairLength: string;
  skinTone: string;
  hairType: string;
  preferredRegions: string;
}) {
  const rows = [
    ['머리 기장', hairLength],
    ['피부 톤', skinTone],
    ['모발 타입', hairType],
    ['관심 지역', preferredRegions],
  ].filter(([, value]) => value);
  return rows.length ? (
    <dl className="flex w-full flex-col gap-3 rounded-12 border border-border-weak p-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <dt className="flex shrink-0">
            <MeemongTag>{label}</MeemongTag>
          </dt>
          <dd className={`min-w-0 break-words text-right text-text-primary ${T.title3SemiBold}`}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  ) : null;
}
