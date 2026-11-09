import { resultDescription } from '../model/result-content';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';

/** Source 6268:98249 and layer override 6268:98273: Fill/Hug,12px inset,2px gap. */
export function ResultDescriptionCard({
  value,
  category,
  sex,
}: {
  value: string;
  category: 'curl' | 'layer';
  sex: string;
}) {
  return (
    <article
      aria-label={value}
      className="flex w-full flex-col gap-0.5 rounded-12 border border-border-weak p-3"
      style={{
        // The Figma source uses unbound illustration colors rather than a Semantic fill.
        backgroundImage: `linear-gradient(180deg, ${category === 'curl' ? '#f5fcff' : '#f7f5ff'}, var(--color-fill-white))`,
      }}
    >
      <h3 className={`text-primitive-black ${T.title2SemiBold}`}>{value}</h3>
      <p className={`text-text-secondary ${T.body4Regular}`}>
        {resultDescription(category, value, sex)}
      </p>
    </article>
  );
}

/** CurlLayerSection 5981:100085/6268:98270:24/20px padding,12px title gap,8px card gap. */
export function ResultDescriptionList({
  title,
  values,
  category,
  sex,
}: {
  title: string;
  values: string[];
  category: 'curl' | 'layer';
  sex: string;
}) {
  return (
    <section className="flex flex-col gap-3 px-5 py-6" aria-label={title}>
      <h2 className={`text-text-secondary ${T.title2SemiBold}`}>{title}</h2>
      <div className="flex flex-col gap-2">
        {values.map((value, index) => (
          <ResultDescriptionCard
            key={`${value}:${index}`}
            value={value}
            category={category}
            sex={sex}
          />
        ))}
      </div>
    </section>
  );
}
