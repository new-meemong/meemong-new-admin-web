import Image from 'next/image';
import { FaceShapeScale } from './face-shape-scale';
import { AnswerSubmittedDate } from './answer-preview-meta';
import type { ReactNode } from 'react';
import type { ReadAnswer } from '../api/contracts';
import { textValue, textValues, priceLabel } from '../model/answer-state';
import {
  celebrityNames,
  referenceImage,
  resultDescription,
  type ResultCategory,
} from '../model/result-content';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';
import { MeemongDivider } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-divider';
import { MeemongTag } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-tag';
import { ResultRecommendations } from './result-recommendations';
import { ResultDescriptionList } from './result-description-card';
import { AnswerPhotoStrip } from './answer-photo-strip';

export { AnswerPhotoStrip } from './answer-photo-strip';

/** CST/AnswerDetail Quote5601:48002 and Recommend5611:54081; actual instances5601:48013/5611:54200 fill the screen. */
export function AnswerDetail({
  answer,
  designerProfile,
  designerName,
}: {
  answer: ReadAnswer;
  designerProfile?: ReactNode;
  designerName?: string;
}) {
  designerName = designerName?.trim();
  const quote = answer.answerType === 'QUOTE';
  const price = priceLabel(answer);
  const priceValue = (
    <span className="inline-flex items-center gap-0.5">
      {price.endsWith('원') ? (
        <>
          <span>{price.slice(0, -1)}</span>
          <span>원</span>
        </>
      ) : (
        price
      )}
    </span>
  );
  return (
    <section className="flex flex-col gap-3 px-4" aria-label="답변 내용">
      {designerProfile}
      <div className="flex flex-col rounded-16 border border-border-weak bg-fill-white p-4 shadow-[0_0_16px_rgba(0,0,0,0.04)]">
        <AnswerSubmittedDate value={answer.submittedAt} variant="detail" />
        <div className="flex flex-col gap-4">
          {quote && (
            <section aria-label="예상 견적" className="flex flex-col gap-3">
              <div className="flex flex-col items-start gap-2">
                <MeemongTag weight="bold">예상 견적</MeemongTag>
                <div className="w-full">
                  <p className={T.body5Regular}>
                    {designerName
                      ? `${designerName}님의 예상 견적이에요`
                      : '디자이너의 예상 견적이에요'}
                  </p>
                  <p className={`flex items-center gap-1 text-text-strong ${T.heading2Bold}`}>
                    {price.endsWith('원') && <span>총</span>}
                    {priceValue}
                  </p>
                </div>
              </div>
              <MeemongDivider />
            </section>
          )}
          <section
            aria-label={quote ? '스타일 예시' : '추천 스타일'}
            className="flex flex-col items-start gap-2"
          >
            <MeemongTag weight="bold">{quote ? '스타일 예시' : '추천 스타일'}</MeemongTag>
            <div className="w-full">
              {!quote && (
                <p className={T.body5Regular}>
                  {designerName
                    ? `${designerName}님의 추천 스타일이에요`
                    : '디자이너의 추천 스타일이에요'}
                </p>
              )}
              <h2 className={quote ? T.title2SemiBold : T.heading3Bold}>{answer.title}</h2>
            </div>
            <div className="flex w-full flex-col gap-1">
              <AnswerPhotoStrip answer={answer} size={quote ? 'small' : 'medium'} />
              <p
                className={`whitespace-pre-wrap break-words rounded-8 bg-fill-weak p-3 text-text-secondary ${T.body4Regular}`}
              >
                {answer.description}
              </p>
            </div>
          </section>
          {!quote && (
            <section aria-label="예상 견적" className="flex flex-col items-start gap-2">
              <MeemongTag weight="bold">예상 견적</MeemongTag>
              <div className="flex w-full items-center justify-between gap-2 rounded-10 border border-border-weak p-3">
                {price.endsWith('원') && (
                  <span className={`text-text-tertiary ${T.body2Regular}`}>총</span>
                )}
                <p className={`text-text-strong ${T.title2SemiBold}`}>{priceValue}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
export function DiagnosisDetail({ answer, sex }: { answer: ReadAnswer; sex: string }) {
  const face = textValue(answer, 'faceShape'),
    faceImage = referenceImage('face', face, sex);
  const groups: { key: string; category: Exclude<ResultCategory, 'face'>; title: string }[] = [
    { key: 'bangsTypes', category: 'bangs', title: '어울리는 앞머리' },
    { key: 'hairLengths', category: 'length', title: '어울리는 기장' },
    { key: 'hairCurls', category: 'curl', title: '어울리는 컬' },
    ...(sex === '여자'
      ? [{ key: 'hairLayers', category: 'layer' as const, title: '어울리는 레이어' }]
      : []),
  ];
  return (
    <div>
      <section
        className="flex flex-col gap-3 rounded-t-[24px] bg-fill-white px-5 py-6"
        aria-label="얼굴형 진단"
      >
        <div className="flex flex-col gap-1">
          <h2 className={`text-text-secondary ${T.title2SemiBold}`}>얼굴형 진단</h2>
          <h3 className={T.heading2Bold}>{face}</h3>
        </div>
        {faceImage && (
          <Image
            src={faceImage}
            alt={`${face} 일러스트`}
            width={600}
            height={453}
            className="h-auto w-full rounded-16"
            unoptimized
          />
        )}
        <FaceShapeScale shape={face} />
        <p className={T.body4Regular}>{resultDescription('face', face, sex)}</p>
        {celebrityNames(face, sex) && (
          <div className="flex items-center gap-2.5 rounded-10 bg-fill-weak p-3">
            <MeemongTag>대표 연예인</MeemongTag>
            <p className={`min-w-0 flex-1 text-text-secondary ${T.title3SemiBold}`}>
              {celebrityNames(face, sex)}
            </p>
          </div>
        )}
      </section>
      {groups.map((group) => {
        const values = textValues(answer, group.key);
        if (!values.length) return null;
        if (group.category === 'bangs' || group.category === 'length') {
          return (
            <ResultRecommendations
              key={group.key}
              title={group.title}
              values={values}
              category={group.category}
              sex={sex}
            />
          );
        }
        return (
          <ResultDescriptionList
            key={group.key}
            title={group.title}
            values={values}
            category={group.category}
            sex={sex}
          />
        );
      })}
      <MeemongDivider thickness="12px" />
      <section className="flex flex-col gap-3 px-5 py-6" aria-label="추천 시술">
        <div className="flex flex-col gap-1">
          <h2 className={`text-text-secondary ${T.title2SemiBold}`}>추천 시술</h2>
          <h3 className={T.heading2Bold}>{answer.title}</h3>
        </div>
        <AnswerPhotoStrip answer={answer} />
        <p className={`whitespace-pre-wrap ${T.body3Regular}`}>{answer.description}</p>
        <div className="flex items-center gap-2 rounded-8 bg-fill-weak p-3">
          <h3 className={`shrink-0 text-text-secondary ${T.body4Regular}`}>예상 가격</h3>
          <p className={T.title2SemiBold}>{priceLabel(answer)}</p>
        </div>
      </section>
    </div>
  );
}

/** CST-D/DeepAnswerDetail 5997:51131: the designer's compact submitted diagnosis. */
export function SentDiagnosisDetail({ answer, sex }: { answer: ReadAnswer; sex: string }) {
  const rows = [
    ['얼굴형', textValue(answer, 'faceShape')],
    ['추천 앞머리 스타일', textValues(answer, 'bangsTypes').join(', ')],
    ['추천 기장', textValues(answer, 'hairLengths').join(', ')],
    [
      '추천 컬/레이어',
      [
        ...textValues(answer, 'hairCurls'),
        ...(sex === '여자' ? textValues(answer, 'hairLayers') : []),
      ].join(', '),
    ],
  ];
  return (
    <section className="px-4" aria-label="답변 내용">
      <div className="flex flex-col rounded-16 border border-border-weak bg-fill-white p-4 shadow-[0_0_16px_rgba(0,0,0,0.04)]">
        <AnswerSubmittedDate value={answer.submittedAt} variant="detail" />
        <div className="flex flex-col gap-4">
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="flex flex-col items-start gap-1">
                <MeemongTag weight="bold">{label}</MeemongTag>
                <p className={`break-words ${T.heading3Bold}`}>{value}</p>
              </div>
            ))}
          <div className="flex flex-col items-start gap-1">
            <MeemongTag weight="bold">추천 스타일</MeemongTag>
            <h2 className={T.title2SemiBold}>{answer.title}</h2>
            <div className="w-full">
              <AnswerPhotoStrip answer={answer} size="small" />
            </div>
            <p
              className={`w-full whitespace-pre-wrap break-words rounded-8 bg-fill-weak p-3 text-text-secondary ${T.body4Regular}`}
            >
              {answer.description}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <MeemongTag weight="bold">예상 가격</MeemongTag>
            <p className={T.title2SemiBold}>{priceLabel(answer)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
