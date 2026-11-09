'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AnswerPhotoThumbnail } from './answer-photo-thumbnail';
import { ConsultationPhotoViewer } from './consultation-photo-viewer';

/** Keeps request thumbnails and chat attachments at their existing display sizes. */
export function ConsultationImageGallery({
  images,
  label,
  layout = 'thumbnails',
}: {
  images: string[];
  label: string;
  layout?: 'thumbnails' | 'chat' | 'portfolio' | 'store' | 'portfolio-grid';
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const photos = images.filter((url) => url.trim().length > 0);
  if (!photos.length) return null;
  const chat = layout === 'chat';
  return (
    <>
      <div
        role="group"
        aria-label={label}
        className={
          chat
            ? 'flex flex-col gap-2'
            : layout === 'portfolio-grid'
              ? 'grid grid-cols-3 gap-0.5'
              : layout === 'store'
                ? 'grid grid-cols-3 gap-1'
                : layout === 'thumbnails'
                  ? 'flex gap-1 overflow-x-auto px-1'
                  : 'flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        }
      >
        {photos.map((url, index) => (
          <button
            key={`${index}:${url}`}
            type="button"
            aria-label={`${label} ${index + 1} 크게 보기`}
            className={
              chat
                ? 'max-w-full self-start rounded-8'
                : layout === 'portfolio'
                  ? 'size-[100px] shrink-0 rounded-4'
                  : layout === 'portfolio-grid'
                    ? 'relative aspect-square overflow-hidden'
                    : layout === 'store'
                      ? 'relative aspect-square overflow-hidden rounded-4'
                      : 'size-20 shrink-0 rounded-4'
            }
            onClick={() => setSelected(index)}
          >
            {layout === 'portfolio' ? (
              <AnswerPhotoThumbnail
                imageUrl={url}
                label={`${label} ${index + 1}`}
                source="Reference"
                size="medium"
                showTag={false}
              />
            ) : (
              <Image
                src={url}
                alt={`${label} ${index + 1}`}
                width={chat ? 200 : 80}
                height={chat ? 200 : 80}
                unoptimized
                className={
                  chat
                    ? 'max-w-full rounded-8'
                    : layout === 'store' || layout === 'portfolio-grid'
                      ? 'absolute inset-0 size-full object-cover'
                      : 'size-20 rounded-4 object-cover'
                }
              />
            )}
          </button>
        ))}
      </div>
      {selected !== null && selected < photos.length && (
        <ConsultationPhotoViewer
          key={JSON.stringify(photos)}
          images={photos}
          initialIndex={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
