'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ZoomablePhoto } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/zoomable-photo';
import { MeemongTopBar } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-top-bar';
import { MeemongButton } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/ui/meemong-button';

/** Native horizontal scrolling keeps touch swipes inside the photo dialog. */
export function ConsultationPhotoViewer({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const dialog = useRef<HTMLDialogElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const currentIndex = useRef(initialIndex);

  useEffect(() => {
    const modal = dialog.current;
    const viewport = strip.current;
    if (!modal || !viewport) return;
    const document = modal.ownerDocument;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    modal.showModal();
    // Avoid highlighting the close button on entry; Tab can still focus each control.
    content.current?.focus({ preventScroll: true });
    document.body.style.overflow = 'hidden';
    const align = () => {
      viewport.scrollLeft = currentIndex.current * viewport.clientWidth;
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(viewport);
    return () => {
      observer.disconnect();
      modal.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof modal.ownerDocument.defaultView!.HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  function move(next: number) {
    const target = Math.max(0, Math.min(images.length - 1, next));
    currentIndex.current = target;
    setIndex(target);
    if (strip.current) strip.current.scrollLeft = target * strip.current.clientWidth;
  }

  return (
    <dialog
      ref={dialog}
      aria-label="사진 전체화면"
      data-meemong-native-surface="textStrong"
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-text-strong p-0 text-text-inverse backdrop:bg-text-strong"
      onCancel={(event) => {
        event.preventDefault();
        // A photo opened from the answer sheet must not dismiss its parent dialog.
        event.stopPropagation();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(index + (event.key === 'ArrowLeft' ? -1 : 1));
        }
      }}
    >
      <div
        ref={content}
        tabIndex={-1}
        className="flex h-full flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] outline-none"
      >
        <MeemongTopBar
          title={`${index + 1}/${images.length}`}
          reverse
          background={false}
          showBackButton={false}
          closeAction={{ onClick: onClose, label: '사진 전체화면 닫기' }}
        />
        <span role="status" className="sr-only">
          사진 {index + 1}/{images.length}
        </span>
        <div
          ref={strip}
          role="group"
          aria-label="전체화면 사진 목록"
          className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ touchAction: 'pan-x pinch-zoom' }}
          onScroll={(event) => {
            const viewport = event.currentTarget;
            if (!viewport.clientWidth) return;
            const next = Math.max(
              0,
              Math.min(images.length - 1, Math.round(viewport.scrollLeft / viewport.clientWidth)),
            );
            currentIndex.current = next;
            setIndex(next);
          }}
        >
          {images.map((url, photoIndex) => (
            <div
              key={`${photoIndex}:${url}`}
              aria-hidden={photoIndex !== index}
              inert={photoIndex !== index}
              className="relative h-full w-full shrink-0 snap-center snap-always"
            >
              <ZoomablePhoto
                key={`${photoIndex}:${index === photoIndex}`}
                onSwipe={(direction) => move(index + direction)}
              >
                <Image
                  src={url}
                  alt={`사진 ${photoIndex + 1}`}
                  fill
                  sizes="100vw"
                  unoptimized
                  draggable={false}
                  className="pointer-events-none select-none object-contain"
                />
              </ZoomablePhoto>
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="flex shrink-0 justify-between gap-4 p-4">
            <MeemongButton
              tone="surface"
              size="medium"
              disabled={index === 0}
              onClick={() => move(index - 1)}
            >
              이전 사진
            </MeemongButton>
            <MeemongButton
              tone="surface"
              size="medium"
              disabled={index === images.length - 1}
              onClick={() => move(index + 1)}
            >
              다음 사진
            </MeemongButton>
          </div>
        )}
      </div>
    </dialog>
  );
}
