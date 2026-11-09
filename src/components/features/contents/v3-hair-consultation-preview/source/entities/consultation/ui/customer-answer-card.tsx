'use client';
import type { ReactNode } from 'react';
import type { AnswerPreview } from '../api/contracts';
import { MeemongButton } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-button';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';
import Star from '@/components/features/contents/v3-hair-consultation-preview/source/assets/icons/meemong-star-fill.svg';
import { ConsultationAsset } from './consultation-assets';
import { AnswerCardDesignerHeader } from './answer-card-designer-header';
import { AnswerPhotoStrip } from './answer-photo-strip';
import { answerPriceText, textValues } from '../model/answer-state';

/** DesignerAnswerCard Quote/Recommend and DiagnosisCard Unread/Read/Rating variants. */
export function CustomerAnswerCard({
  answer,
  onView,
  onReview,
  onChat,
  chatBusy = false,
}: {
  answer: AnswerPreview;
  onView: () => void;
  onReview: () => void;
  onChat: () => void;
  chatBusy?: boolean;
}) {
  const price = answerPriceText(answer);
  const lengths = textValues(answer, 'hairLengthList').filter((value) => value.trim());
  const lengthSummary =
    lengths.length > 1 ? `${lengths[0]} 외 ${lengths.length - 1}개` : lengths[0];
  const deep = answer.answerType === 'CONSULTING';
  // Public preview fields never grant access; revoked answers return to the preview variant.
  const read = Boolean(answer.firstReadAt) && answer.canRead;
  const rating = answer.review?.rating;
  const validRating =
    typeof rating === 'number' && Number.isInteger(rating) && rating >= 1 && rating <= 5;
  return (
    <article
      aria-label="받은 답변"
      className={`relative flex w-full min-w-0 flex-col gap-2 overflow-hidden rounded-16 border ${!deep && !answer.firstReadAt ? 'border-border-regular shadow-[0_1px_8px_rgba(29,32,36,0.06)]' : 'border-border-weak'} bg-fill-white p-4`}
    >
      <button
        type="button"
        aria-label={deep ? `${answer.title} 전체 보기` : '답변 보기'}
        onClick={onView}
        className="absolute inset-0 rounded-16"
      />
      <div className="pointer-events-none flex w-full min-w-0 flex-col gap-2">
        <AnswerCardDesignerHeader
          designer={answer.designer}
          variant={deep ? 'diagnosis' : 'quick'}
          submittedAt={answer.submittedAt}
        />
        {deep ? (
          <dl className="flex w-full flex-col gap-1 px-1">
            {read ? (
              <>
                {answer.title && (
                  <SummaryRow label="추천 스타일명" wide>
                    {answer.title}
                  </SummaryRow>
                )}
                {price && (
                  <SummaryRow label="예상 가격" wide>
                    {price}
                  </SummaryRow>
                )}
                {answer.reviewed && validRating && (
                  <SummaryRow label="내 별점" wide>
                    <span className="flex items-center gap-0.5" aria-label={`별점 ${rating}점`}>
                      <Star className="size-4 text-primitive-orange-400" aria-hidden />
                      <span className={`text-text-secondary ${T.body3Regular}`}>{rating}</span>
                    </span>
                  </SummaryRow>
                )}
              </>
            ) : (
              <>
                {answer.faceShape && (
                  <SummaryRow label="진단 얼굴형">{answer.faceShape}</SummaryRow>
                )}
                {lengthSummary && <SummaryRow label="추천 기장">{lengthSummary}</SummaryRow>}
              </>
            )}
          </dl>
        ) : (
          <>
            {answer.answerType === 'QUOTE' && price && (
              <p className={`flex flex-wrap items-start gap-1 text-text-strong ${T.heading3Bold}`}>
                <span>총</span>
                <span className="inline-flex gap-0.5">
                  <span>{price.slice(0, -1)}</span>
                  <span>원</span>
                </span>
              </p>
            )}
            {!!answer.imageList?.length && (
              <div className="pointer-events-auto relative w-fit min-w-0 max-w-full">
                <AnswerPhotoStrip
                  answer={{ images: answer.imageList }}
                  size="small"
                  onBackgroundClick={onView}
                />
              </div>
            )}
            {answer.description && (
              <div className="w-full min-w-0 rounded-8 bg-fill-weak px-2 py-3">
                <p className={`truncate text-text-secondary ${T.body4Regular}`}>
                  {answer.description}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      {deep && !read && (
        <>
          <div
            className={`pointer-events-none flex items-center justify-center gap-[9px] rounded-8 bg-fill-weak p-3 text-text-tertiary ${T.body5Regular}`}
          >
            {!answer.canRead && <ConsultationAsset name="statsLock" tone="secondary" />}
            <p>{answer.canRead ? '답변을 확인할 수 있어요' : '이외 답변 내역 5가지'}</p>
          </div>
          <MeemongButton
            size="medium"
            tone="secondary"
            className="relative w-full gap-2"
            onClick={onView}
          >
            컨설팅 전체 보기 <ConsultationAsset name="chevron" />
          </MeemongButton>
        </>
      )}
      {deep && read && !answer.reviewed && (
        <button
          type="button"
          aria-label="컨설팅 평가하기"
          onClick={onReview}
          className={`relative flex w-full items-center justify-between gap-[9px] rounded-8 bg-fill-weak p-3 text-left text-text-primary ${T.body5Regular}`}
        >
          <span>이 컨설팅 어땠나요?</span>
          <span aria-hidden className="flex shrink-0 gap-0.5 text-icon-disabled">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className="size-5" />
            ))}
          </span>
        </button>
      )}
      {deep && read && answer.reviewed && answer.canChat && (
        <MeemongButton
          size="medium"
          tone="surface"
          className="relative w-full"
          disabled={chatBusy}
          onClick={onChat}
        >
          디자이너와 채팅하기
        </MeemongButton>
      )}
    </article>
  );
}

function SummaryRow({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex w-full items-center">
      <dt
        className={`${wide ? 'w-[88px]' : 'w-20'} shrink-0 text-text-tertiary ${T.title3SemiBold}`}
      >
        {label}
      </dt>
      <dd className={`min-w-0 break-words text-text-primary ${T.body4Regular}`}>{children}</dd>
    </div>
  );
}
