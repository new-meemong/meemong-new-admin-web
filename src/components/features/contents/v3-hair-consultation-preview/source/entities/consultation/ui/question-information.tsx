import { deepPhotoRole } from '../model/deep-photo-roles';
import { stylingMethodLabel } from '../model/styling-method-label';
import { ConsultationImageGallery } from './consultation-image-gallery';
import type { QuestionDetail } from '../api/contracts';
import { textValue, textValues } from '../model/answer-state';
import { treatmentHistoryDisplay } from '../model/treatment-history-display';
import { questionScheduleText, questionSnapshotText } from '../model/question-snapshot';
import { MeemongTag } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-tag';
import { ConsultationPhotoStrip, type ConsultationPhoto } from './consultation-photo-field';
import { BasicInfoSummary } from './basic-info-summary';
import { TreatmentHistoryItem } from './treatment-history-card';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';

function Info({
  title,
  children,
  filled = false,
  labelTone = 'secondary',
}: {
  title: string;
  children: React.ReactNode;
  filled?: boolean | 'information';
  labelTone?: 'secondary' | 'tertiary';
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-12 p-3 ${filled === 'information' ? 'bg-status-information-weak' : filled ? 'bg-fill-weak' : 'border border-border-weak'}`}
    >
      <h3
        className={`px-1 ${labelTone === 'tertiary' ? 'text-text-tertiary' : 'text-text-secondary'} ${T.title3SemiBold}`}
      >
        {title}
      </h3>
      <div className={`whitespace-pre-wrap px-1 ${T.body3Regular}`}>{children}</div>
    </div>
  );
}
function PhotoStrip({
  question,
  type,
  label,
}: {
  question: QuestionDetail;
  type: string;
  label: string;
}) {
  const images = question.images
    .filter(
      (i) =>
        (type === 'OTHER'
          ? !['CURRENT', 'ASPIRATION'].includes(String(i.type))
          : i.type === type) && typeof i.imageUrl === 'string',
    )
    .sort((a, b) => Number(a.displayOrder ?? Infinity) - Number(b.displayOrder ?? Infinity));
  return (
    <ConsultationImageGallery
      images={images.map((image) => String(image.imageUrl))}
      label={label}
    />
  );
}

function CurrentPhotos({
  question,
  compact = false,
  label = '고객 이미지',
}: {
  question: QuestionDetail;
  compact?: boolean;
  label?: string;
}) {
  return question.images.some(
    (image) => image.type === 'CURRENT' && typeof image.imageUrl === 'string',
  ) ? (
    <div className={`flex flex-col ${compact ? 'gap-1' : 'gap-2'}`}>
      <h3 className={`px-1 text-text-tertiary ${T.title3SemiBold}`}>{label}</h3>
      <PhotoStrip question={question} type="CURRENT" label={label} />
    </div>
  ) : null;
}
/** CST/ConsultRequestDetail 5698:108266:16padding/16gap; actual question snapshot only. */
export function ConsultRequestDetail({ question }: { question: QuestionDetail }) {
  const wanted = questionSnapshotText(question, 'wantedTreatments');
  const unwanted = questionSnapshotText(question, 'unwantedTreatments');
  const additional = questionSnapshotText(question, 'additionalTreatments');
  // Negative answers and additional-only legacy snapshots need their own visible label.
  const separateAdditional = !wanted || question.noAdditionalTreatment === true;
  const pieces = questionSnapshotText(question, 'hasExtensionPieces');
  const aspiration = textValue(question, 'aspirationDescription');
  const desiredDate = questionScheduleText(question);
  const hasAspirationPhotos = question.images.some(
    (image) => image.type === 'ASPIRATION' && typeof image.imageUrl === 'string',
  );
  return (
    <section className="flex flex-col gap-4 p-4" aria-label="상담 내용">
      <h2 className={T.title2SemiBold}>상담 내용</h2>
      <PhotoStrip question={question} type="OTHER" label="등록 사진" />
      {wanted && (
        <div className="flex items-start gap-4 px-1">
          <h3 className={`shrink-0 text-text-tertiary ${T.title3SemiBold}`}>원하는 시술</h3>
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {(question.anyTreatment === true || !Array.isArray(question.wantedTreatments)
              ? [wanted]
              : textValues(question, 'wantedTreatments')
            ).map((value, index) => (
              <MeemongTag key={`wanted-${index}`} color="blue">
                {value}
              </MeemongTag>
            ))}
            {additional && !separateAdditional && (
              <span role="group" aria-label="추가 추천 시술" className="contents">
                {(Array.isArray(question.additionalTreatments)
                  ? textValues(question, 'additionalTreatments')
                  : [additional]
                ).map((value, index) => (
                  <MeemongTag key={index}>{value}</MeemongTag>
                ))}
              </span>
            )}
          </div>
        </div>
      )}
      {(aspiration || hasAspirationPhotos) && (
        <section aria-label="원하는 스타일" className="flex flex-col gap-1">
          <h3 className={`px-1 text-text-tertiary ${T.title3SemiBold}`}>원하는 스타일</h3>
          <PhotoStrip question={question} type="ASPIRATION" label="원하는 스타일 사진" />
          {aspiration && (
            <p className={`whitespace-pre-wrap rounded-12 bg-fill-weak p-3 ${T.body3Regular}`}>
              {aspiration}
            </p>
          )}
        </section>
      )}
      <CurrentPhotos question={question} compact />
      {unwanted && <Info title="원하지 않는 시술">{unwanted}</Info>}
      {textValues(question, 'aspirationImageTypes').length > 0 && (
        <Info title="선호하는 이미지">
          {textValues(question, 'aspirationImageTypes').join(', ')}
        </Info>
      )}
      {additional && separateAdditional && (
        <div role="group" aria-label="추가 추천 시술">
          <Info title="추가 추천 시술">{additional}</Info>
        </div>
      )}
      <div role="group" aria-label="상담 요청 정보" className="flex flex-col gap-2">
        {pieces && (
          <Info title="피스 유무" labelTone="tertiary">
            {pieces}
          </Info>
        )}
        {textValues(question, 'concernedAreas').length > 0 && (
          <Info title="신경쓰이는 부위" labelTone="tertiary">
            {textValues(question, 'concernedAreas').join(', ')}
          </Info>
        )}
        {desiredDate.trim() && (
          <Info title="원하는 일정" labelTone="tertiary">
            {desiredDate}
          </Info>
        )}
        {textValue(question, 'additionalInquiry') && (
          <Info title="하고싶은 말" labelTone="tertiary" filled="information">
            {textValue(question, 'additionalInquiry')}
          </Info>
        )}
      </div>
    </section>
  );
}
/** CST/CustomerInfoDetail 5698:108265:16padding/gap, history shared items. */
export function CustomerInfoDetail({
  question,
  customer = false,
}: {
  question: QuestionDetail;
  customer?: boolean;
}) {
  const heading = customer ? '내 정보' : '고객 정보';
  return (
    <section className="flex flex-col gap-4 p-4" aria-label={heading}>
      <h2 className={T.title2SemiBold}>{heading}</h2>
      {question.customerType !== 'QUOTE_EXTENSION' && (
        <SnapshotTreatmentHistory question={question} tertiary />
      )}
      {!!question.customer?.profileImages.length && (
        <div className="flex flex-col gap-2">
          <h3 className={`px-1 text-text-tertiary ${T.title3SemiBold}`}>
            {customer ? '내 사진' : '프로필 이미지'}
          </h3>
          <ConsultationImageGallery
            images={question.customer.profileImages.map((image) => image.imageUrl)}
            label={customer ? '내 사진' : '프로필 이미지'}
          />
        </div>
      )}
      <Info title="스타일링 방법" labelTone="tertiary">
        {textValues(question, 'stylingMethods').map(stylingMethodLabel).join(', ') ||
          '입력된 정보가 없어요'}
      </Info>
      <div className="flex flex-col gap-3 rounded-12 border border-border-weak bg-fill-white p-3">
        <div className="flex flex-col gap-1">
          <h3 className={`px-1 text-text-tertiary ${T.title3SemiBold}`}>헤어 고민</h3>
          <p className={`whitespace-pre-wrap px-1 ${T.body3Regular}`}>
            {textValues(question, 'hairConcerns').join(', ') || '입력된 정보가 없어요'}
          </p>
        </div>
      </div>
      <SnapshotBasicInfo question={question} tertiary />
    </section>
  );
}

function SnapshotTreatmentHistory({
  question,
  tertiary = false,
}: {
  question: QuestionDetail;
  tertiary?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className={`px-1 ${tertiary ? 'text-text-tertiary' : ''} ${T.title3SemiBold}`}>
        시술 이력
      </h3>
      {question.treatmentHistories.length > 0 && (
        <div
          role="list"
          aria-label="시술 이력"
          className="flex flex-col gap-1 rounded-12 border border-border-weak bg-fill-white px-4 py-3"
        >
          <div>
            {question.treatmentHistories.map((h, i) => (
              <div role="listitem" key={i}>
                <TreatmentHistoryItem
                  {...treatmentHistoryDisplay(h)}
                  compactDate
                  divider={i < question.treatmentHistories.length - 1}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {textValue(question, 'treatmentHistoryDescription') && (
        <p className={`whitespace-pre-wrap rounded-12 bg-fill-weak p-3 ${T.body3Regular}`}>
          {textValue(question, 'treatmentHistoryDescription')}
        </p>
      )}
    </div>
  );
}

function SnapshotBasicInfo({
  question,
  tertiary = false,
}: {
  question: QuestionDetail;
  tertiary?: boolean;
}) {
  return (
    <section aria-label="기본 정보" className="flex flex-col gap-2">
      <h3 className={`px-1 ${tertiary ? 'text-text-tertiary' : ''} ${T.title3SemiBold}`}>
        기본 정보
      </h3>
      <BasicInfoSummary
        hairLength={textValue(question, 'hairLength')}
        skinTone={['skinBrightness', 'personalColor']
          .map((key) => textValue(question, key))
          .filter(Boolean)
          .join(' · ')}
        hairType={[
          textValue(question, 'hairTexture'),
          textValue(question, 'hairThickness') && `굵기 ${textValue(question, 'hairThickness')}`,
        ]
          .filter(Boolean)
          .join(' · ')}
        preferredRegions={textValues(question, 'preferredRegions').join(', ')}
      />
    </section>
  );
}

/** ConsultingCustomerDetail 5677:91226; customer instance 6020:68482 overrides the heading. */
export function ConsultingCustomerDetail({
  question,
  customer = false,
}: {
  question: QuestionDetail;
  customer?: boolean;
}) {
  const heading = customer ? '내 정보' : '고객 정보';
  const photos = question.images
    .filter((image) => image.type === 'CURRENT')
    .map<ConsultationPhoto>((image) => ({ ...image, label: deepPhotoRole(image.subType) }))
    .sort((a, b) => Number(a.displayOrder ?? Infinity) - Number(b.displayOrder ?? Infinity));
  return (
    <section
      aria-label={heading}
      className="flex w-full flex-col gap-4 px-4 py-5 text-text-primary"
    >
      <h2 className={T.title2SemiBold}>{heading}</h2>
      {photos.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className={`px-1 text-text-tertiary ${T.title3SemiBold}`}>고객 얼굴형 · 헤어</h3>
          <ConsultationPhotoStrip images={photos} label="고객 얼굴형 · 헤어" expandable />
        </div>
      )}
      <SnapshotBasicInfo question={question} tertiary />
    </section>
  );
}

function DeepTagRow({
  label,
  values,
  color,
}: {
  label: string;
  values: string[];
  color: 'blue' | 'orange' | 'neutral';
}) {
  if (!values.length) return null;
  return (
    <div className={`flex gap-1 px-1 ${color === 'neutral' ? 'items-start' : 'items-center'}`}>
      <h3 className={`w-[100px] shrink-0 text-text-tertiary ${T.title3SemiBold}`}>{label}</h3>
      <div className="flex min-w-0 flex-wrap gap-1">
        {values.map((value, index) => (
          <MeemongTag key={index} size="medium" color={color}>
            {value}
          </MeemongTag>
        ))}
      </div>
    </div>
  );
}
function DeepField({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className={`px-1 text-text-tertiary ${T.title3SemiBold}`}>{title}</h3>
      <p className={`whitespace-pre-wrap px-1 text-text-primary ${T.body3Regular}`}>{value}</p>
    </div>
  );
}

/** ConsultingRequestDetail 5951:86230: explicit Blue/Orange/Neutral tags, label100, group8. */
export function ConsultingRequestDetail({
  question,
  variant = 'detail',
}: {
  question: QuestionDetail;
  /** Hint instance 5997:63140 shows only treatments, image types, concerns and message. */
  variant?: 'detail' | 'hint';
}) {
  const wanted = questionSnapshotText(question, 'wantedTreatments');
  const unwanted = questionSnapshotText(question, 'unwantedTreatments');
  const desiredDate = questionScheduleText(question);
  const areas = textValues(question, 'concernedAreas').join(', ');
  const concerns = textValues(question, 'hairConcerns').join(', ');
  const message = textValue(question, 'additionalInquiry');
  const additional = questionSnapshotText(question, 'additionalTreatments');
  const pieces = questionSnapshotText(question, 'hasExtensionPieces');
  const aspiration = textValue(question, 'aspirationDescription');
  const hasAspirationPhotos = question.images.some(
    (image) => image.type === 'ASPIRATION' && typeof image.imageUrl === 'string',
  );
  return (
    <section
      aria-label="요청사항"
      className="flex w-full flex-col gap-4 px-4 py-5 text-text-primary"
    >
      <h2 className={T.title2SemiBold}>요청사항</h2>
      <DeepTagRow
        label="관심있는 시술"
        color="blue"
        values={
          wanted
            ? question.anyTreatment === true
              ? [wanted]
              : Array.isArray(question.wantedTreatments)
                ? textValues(question, 'wantedTreatments')
                : [wanted]
            : []
        }
      />
      <DeepTagRow
        label="피하고싶은 시술"
        color="orange"
        values={
          unwanted
            ? question.noUnwantedTreatment === true
              ? [unwanted]
              : Array.isArray(question.unwantedTreatments)
                ? textValues(question, 'unwantedTreatments')
                : [unwanted]
            : []
        }
      />
      <DeepTagRow
        label="추구하는 이미지"
        color="neutral"
        values={textValues(question, 'aspirationImageTypes')}
      />
      <div className="flex flex-col gap-2">
        {(areas || concerns) && (
          <div className="flex flex-col gap-3 rounded-12 border border-border-weak bg-fill-white p-3">
            {areas && <DeepField title="신경쓰이는 부위" value={areas} />}
            {concerns && <DeepField title="헤어 고민" value={concerns} />}
          </div>
        )}
        {variant === 'detail' && desiredDate.trim() && (
          <div className="rounded-12 border border-border-weak bg-fill-white p-3">
            <DeepField title="원하는 일정" value={desiredDate} />
          </div>
        )}
        {message && (
          <div className="rounded-12 bg-status-information-weak p-3">
            <DeepField title="하고싶은 말" value={message} />
          </div>
        )}
      </div>
      {variant === 'detail' && (
        <>
          <PhotoStrip question={question} type="OTHER" label="등록 사진" />
          {/* Saved legacy/additional fields have no slot in the sampled DEEP component. Preserve their existing Info/Style slots instead of dropping accepted answers. */}
          {additional && <Info title="추가 추천 시술">{additional}</Info>}
          {pieces && (
            <Info title="피스 유무" labelTone="tertiary">
              {pieces}
            </Info>
          )}
          {(aspiration || hasAspirationPhotos) && (
            <section aria-label="원하는 스타일" className="flex flex-col gap-1">
              <h3 className={`px-1 ${T.title3SemiBold}`}>원하는 스타일</h3>
              <PhotoStrip question={question} type="ASPIRATION" label="원하는 스타일 사진" />
              {aspiration && (
                <p className={`whitespace-pre-wrap rounded-12 bg-fill-weak p-3 ${T.body3Regular}`}>
                  {aspiration}
                </p>
              )}
            </section>
          )}
        </>
      )}
    </section>
  );
}

/** ConsultingDiagnosisDetail 5677:91227: shared history, note, then StylingSkill gap4. */
export function ConsultingDiagnosisDetail({ question }: { question: QuestionDetail }) {
  const styling = textValues(question, 'stylingMethods').map(stylingMethodLabel).join(', ');
  return (
    <section
      aria-label="진단 정보"
      className="flex w-full flex-col gap-4 px-4 py-5 text-text-primary"
    >
      <h2 className={T.title2SemiBold}>진단 정보</h2>
      <SnapshotTreatmentHistory question={question} tertiary />
      {styling && (
        <div className="flex flex-col gap-1">
          <h3 className={`px-1 text-text-tertiary ${T.title3SemiBold}`}>가능한 스타일링 방법</h3>
          <p
            className={`whitespace-pre-wrap rounded-12 border border-border-weak bg-fill-white p-3 ${T.body3Regular}`}
          >
            {styling}
          </p>
        </div>
      )}
    </section>
  );
}
