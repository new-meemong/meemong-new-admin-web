import Image from 'next/image';
import { rankSummary, referenceImage, resultDescription } from '../model/result-content';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';
import { ConsultationAsset } from './consultation-assets';

/** CST-C/RankSummary 6208:61012: gradient border,12px padding,12px radius, floating SummaryBadge. */
export function RankSummary({
  values,
  category,
}: {
  values: string[];
  category: 'bangs' | 'length';
}) {
  return (
    <div
      className="relative rounded-12 border border-transparent p-3 text-text-strong shadow-[0_1px_8px_rgba(29,32,36,0.06)]"
      style={{
        background:
          'linear-gradient(var(--color-fill-white), var(--color-fill-white)) padding-box, linear-gradient(90deg, var(--color-brand-accent-strong), var(--color-accent-purple)) border-box',
      }}
    >
      <p className={T.title3SemiBold}>{rankSummary(values, category)}</p>
      <span
        className={`absolute -top-2.5 right-[18px] flex items-center gap-0.5 rounded-full bg-gradient-to-b from-brand-accent-strong to-accent-purple px-2 text-text-inverse ${T.title4SemiBold}`}
      >
        <ConsultationAsset name="rankSparkle" />
        요약
      </span>
    </div>
  );
}
/** CST-C/RankValueTitle 5981:99989, RankBadge First/Second/Third; source instances scale badges to32px. */
function RankValueTitle({ value, rank }: { value: string; rank?: number }) {
  return (
    <div className="absolute inset-x-0 top-0 flex h-[63px] items-start gap-2 bg-gradient-to-b from-black/38 to-black/0 px-4 pt-4">
      {rank && rank <= 3 ? (
        <span aria-label={`${rank}순위`}>
          <ConsultationAsset
            name={rank === 1 ? 'rankFirst' : rank === 2 ? 'rankSecond' : 'rankThird'}
          />
        </span>
      ) : rank ? (
        <span className={`text-text-inverse ${T.title4SemiBold}`}>{rank}순위</span>
      ) : null}
      <h3
        className={`min-w-0 text-text-inverse [text-shadow:0_2px_10px_rgba(29,32,36,0.08)] ${T.heading3Bold}`}
      >
        {value}
      </h3>
    </div>
  );
}
function RecommendationValue({
  value,
  category,
  sex,
  rank,
}: {
  value: string;
  category: 'bangs' | 'length';
  sex: string;
  rank?: number;
}) {
  const image = referenceImage(category, value, sex);
  return (
    <article
      className={`flex flex-col gap-3 ${rank ? 'w-[318px] max-w-full shrink-0' : 'w-full'}`}
      aria-label={rank ? `${rank}순위 ${value}` : value}
    >
      {image ? (
        <div
          className={`relative overflow-hidden rounded-16 border border-border-weak ${rank ? 'aspect-[318/239]' : 'aspect-[335/251.75]'}`}
        >
          <Image
            src={image}
            alt={`${value} 예시`}
            width={400}
            height={300}
            sizes="(max-width: 375px) calc(100vw - 40px), 500px"
            quality={90}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <RankValueTitle value={value} rank={rank} />
        </div>
      ) : (
        <h3 className={T.heading3Bold}>
          {rank ? `${rank}순위 ` : ''}
          {value}
        </h3>
      )}
      <p className={category === 'bangs' ? T.body4Regular : T.body3Regular}>
        {resultDescription(category, value, sex)}
      </p>
    </article>
  );
}
/** 5976:310 ranked ValueLists (6208:60983/61025) are horizontal;6216:91389 single values fill335px. */
export function ResultRecommendations({
  title,
  values,
  category,
  sex,
}: {
  title: string;
  values: string[];
  category: 'bangs' | 'length';
  sex: string;
}) {
  const ranked = values.length > 1;
  return (
    <section aria-label={title} className="flex min-w-0 flex-col gap-3 px-5 py-6">
      <h2 className={`text-text-secondary ${T.title2SemiBold}`}>{title}</h2>
      {ranked && <RankSummary values={values} category={category} />}
      <div
        role={ranked ? 'group' : undefined}
        aria-label={ranked ? `${title} 순위별 추천` : undefined}
        tabIndex={ranked ? 0 : undefined}
        className={
          ranked
            ? 'flex w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : undefined
        }
      >
        {/* Older clients can have more than3 values; preserve their order/content rather than clipping data to current input limits. */}
        {values.map((value, i) => (
          <RecommendationValue
            key={`${value}:${i}`}
            value={value}
            category={category}
            sex={sex}
            rank={ranked ? i + 1 : undefined}
          />
        ))}
      </div>
    </section>
  );
}
