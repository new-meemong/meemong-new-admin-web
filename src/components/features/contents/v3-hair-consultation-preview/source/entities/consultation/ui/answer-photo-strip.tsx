'use client';

import { useState } from 'react';
import type { ReadAnswer } from '../api/contracts';
import { AnswerPhotoThumbnail, type AnswerPhotoSize } from './answer-photo-thumbnail';
import { ConsultationPhotoViewer } from './consultation-photo-viewer';

/** PhotoRow 5611:54033/54099 and6216:61175:4px gap, with per-answer thumbnail variants. */
export function AnswerPhotoStrip({
  answer,
  size = 'large',
  onBackgroundClick,
}: {
  answer: Pick<ReadAnswer, 'images'>;
  size?: AnswerPhotoSize;
  onBackgroundClick?: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const images = answer.images.filter((v) => typeof v.imageUrl === 'string' && v.imageUrl.trim());
  if (!images.length) return null;
  return (
    <>
      <div
        role="group"
        tabIndex={0}
        className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="추천 스타일 사진"
        onClick={(event) => {
          if (event.target === event.currentTarget) onBackgroundClick?.();
        }}
      >
        {images.map((image, i) => (
          <button
            type="button"
            key={i}
            className="shrink-0 rounded-4"
            aria-label={`추천 스타일 ${i + 1} 크게 보기`}
            onClick={() => setSelected(i)}
          >
            <AnswerPhotoThumbnail
              imageUrl={String(image.imageUrl)}
              label={`추천 스타일 ${i + 1}`}
              source={image.source === 'PORTFOLIO' ? 'Direct' : 'Reference'}
              size={size}
            />
          </button>
        ))}
      </div>
      {selected !== null && selected < images.length && (
        <ConsultationPhotoViewer
          key={JSON.stringify(images)}
          images={images.map((image) => String(image.imageUrl))}
          initialIndex={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
