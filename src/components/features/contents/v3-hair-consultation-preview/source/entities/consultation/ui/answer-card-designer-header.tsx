import Image from 'next/image';
import type { ConsultationDesigner } from '../api/contracts';
import { consultationLocationParts } from '../model/consultation-location';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';
import { AnswerSubmittedDate } from './answer-preview-meta';

/** DesignerAnswerCard Header / DiagnosisCard Header: display only, never a profile link. */
export function AnswerCardDesignerHeader({
  designer,
  variant,
  submittedAt,
}: {
  designer?: ConsultationDesigner | null;
  variant: 'quick' | 'diagnosis';
  submittedAt?: unknown;
}) {
  const quick = variant === 'quick';
  const { region, distance } = consultationLocationParts(designer);
  const photo = designer?.userProfilePictureURL?.trim();
  return (
    <div className="flex w-full items-start justify-between gap-2">
      <section aria-label="답변 디자이너" className="flex min-w-0 flex-1 items-center gap-2">
        {photo && (
          <span className={`shrink-0 ${quick ? 'py-1' : ''}`}>
            <Image
              src={photo}
              alt="디자이너 프로필"
              width={quick ? 44 : 40}
              height={quick ? 44 : 40}
              unoptimized
              className={`object-cover ${quick ? 'size-11 rounded-12' : 'size-10 rounded-full'}`}
            />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className={`truncate text-text-primary ${T.title2SemiBold}`}>
            {designer?.userDisplayName?.trim() || '디자이너'}
          </p>
          {(region || distance) && (
            <p className={`truncate text-text-tertiary ${T.caption2Medium}`}>
              {[region, distance].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </section>
      {!quick && <AnswerSubmittedDate value={submittedAt} />}
    </div>
  );
}
