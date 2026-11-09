'use client';

import { useState } from 'react';
import { ConsultationPhotoViewer } from './consultation-photo-viewer';
import Image from 'next/image';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';

export type ConsultationPhoto = { imageUrl?: unknown; displayOrder?: unknown; label?: string };

/** CST/PhotoField Empty 5567:34730; fills the same square slot as Filled. */
export function ConsultationEmptyPhotoField({ label }: { label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className="flex aspect-square min-w-0 flex-1 items-center justify-center rounded-8 border border-dashed border-border-regular bg-fill-white shadow-[0_0_20px_rgba(29,32,36,0.06)]"
    >
      <Image src="/v3-hair-preview/assets/consultation/photo-guide/field-plus.svg" alt="" width={16} height={16} />
    </span>
  );
}

/** PhotoField Filled 5567:34731 / PhotoTag 5567:34237: Fill square, r8, centered bottom4 pill. */
export function ConsultationPhotoField({ imageUrl, label }: { imageUrl: string; label: string }) {
  return (
    <figure className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-8 bg-fill-weak">
      <Image src={imageUrl} alt={label} fill unoptimized className="object-cover" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-border-regular"
      />
      <figcaption
        className={`absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-dimmed-indicator px-2 text-text-inverse ${T.caption1SemiBold}`}
      >
        {label}
      </figcaption>
    </figure>
  );
}

export function ConsultationPhotoStrip({
  images,
  label,
  inset = true,
  expandable = false,
}: {
  images: ConsultationPhoto[];
  label: string;
  inset?: boolean;
  expandable?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const photos = images.filter(
    (image): image is ConsultationPhoto & { imageUrl: string } =>
      typeof image.imageUrl === 'string' && image.imageUrl.length > 0,
  );
  if (!photos.length) return null;
  return (
    <>
      <div role="group" aria-label={label} className={`flex gap-1 ${inset ? 'px-1' : ''}`}>
        {photos.map((image, index) =>
          // Role labels are supplied only by readers with an established photo-slot contract.
          expandable ? (
            <button
              key={index}
              type="button"
              aria-label={`${image.label ?? `사진 ${index + 1}`} 크게 보기`}
              className="flex min-w-0 flex-1 rounded-8"
              onClick={() => setSelected(index)}
            >
              <ConsultationPhotoField
                imageUrl={image.imageUrl}
                label={image.label ?? `사진 ${index + 1}`}
              />
            </button>
          ) : (
            <ConsultationPhotoField
              key={index}
              imageUrl={image.imageUrl}
              label={image.label ?? `사진 ${index + 1}`}
            />
          ),
        )}
      </div>
      {expandable && selected !== null && selected < photos.length && (
        <ConsultationPhotoViewer
          key={JSON.stringify(photos.map((photo) => photo.imageUrl))}
          images={photos.map((photo) => photo.imageUrl)}
          initialIndex={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
