import Image from 'next/image';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';

export type AnswerPhotoSize = 'small' | 'medium' | 'large';
type PhotoSource = 'Direct' | 'Reference';

/** CST/PhotoTagChip 5601:39437: Direct/Reference, caption3,40% dimmed pill. */
export function PhotoTagChip({ source }: { source: PhotoSource }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-dimmed-indicator px-1.5 py-0.5 whitespace-nowrap text-text-inverse ${T.caption3SemiBold}`}
    >
      {source === 'Direct' ? '직접시술' : '참고사진'}
    </span>
  );
}

/** CST/AnswerPhotoThumbnail 5601:39427:80/100/140px,4px radius,tag centered5px above bottom. */
export function AnswerPhotoThumbnail({
  imageUrl,
  label,
  source,
  size,
  showTag = true,
}: {
  imageUrl: string;
  label: string;
  source: PhotoSource;
  size: AnswerPhotoSize;
  showTag?: boolean;
}) {
  const dimensions = { small: 'size-20', medium: 'size-[100px]', large: 'size-[140px]' }[size];
  return (
    <figure
      aria-label={label}
      className={`relative shrink-0 overflow-hidden rounded-4 ${dimensions}`}
    >
      <Image src={imageUrl} alt={label} fill unoptimized className="object-cover" />
      {showTag && (
        <figcaption className="absolute bottom-[5px] left-1/2 flex -translate-x-1/2">
          <PhotoTagChip source={source} />
        </figcaption>
      )}
    </figure>
  );
}
