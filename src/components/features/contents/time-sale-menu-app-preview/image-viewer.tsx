"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ImageSwiperItem } from "@/components/shared/image-swiper";

export default function TimeSaleMenuPreviewImageViewer({
  images,
  initialIndex,
  onClose,
  returnFocusTo,
}: {
  images: ImageSwiperItem[];
  initialIndex: number;
  onClose: () => void;
  returnFocusTo: HTMLButtonElement | null;
}) {
  const [carouselRef, carousel] = useEmblaCarousel({
    startIndex: initialIndex,
    loop: false,
  });
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      if (returnFocusTo?.isConnected)
        returnFocusTo.focus({ preventScroll: true });
    };
  }, [returnFocusTo]);

  useEffect(() => {
    if (!carousel) return;
    const onSelect = () => setCurrentIndex(carousel.selectedScrollSnap());
    carousel.on("select", onSelect);
    return () => {
      carousel.off("select", onSelect);
    };
  }, [carousel]);

  return (
    <div
      role="dialog"
      aria-label="앱 미리보기 사진 확대"
      className="absolute inset-0 z-30 overflow-hidden bg-black text-white"
      onKeyDown={(event) => {
        // Keep viewer shortcuts inside the phone and away from the admin modal.
        if (event.key === "Escape") {
          event.stopPropagation();
          event.preventDefault();
          onClose();
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.stopPropagation();
          event.preventDefault();
          if (event.key === "ArrowLeft") carousel?.scrollPrev();
          else carousel?.scrollNext();
        }
        if (event.key === "Tab") {
          const buttons = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          );
          const first = buttons[0];
          const last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <div ref={carouselRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className="relative min-w-0 flex-[0_0_100%]"
            >
              <ViewerPhoto src={image.src} index={index} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 flex h-14 items-center justify-center bg-gradient-to-b from-black/60 to-transparent">
        <span className="text-sm" aria-live="polite">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          ref={closeButton}
          type="button"
          aria-label="확대 사진 닫기"
          onClick={onClose}
          className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
        >
          <X size={24} />
        </button>
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 확대 사진"
            disabled={currentIndex === 0}
            onClick={() => carousel?.scrollPrev()}
            className="absolute left-2 top-1/2 rounded-full bg-black/40 p-1 disabled:opacity-25"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            aria-label="다음 확대 사진"
            disabled={currentIndex === images.length - 1}
            onClick={() => carousel?.scrollNext()}
            className="absolute right-2 top-1/2 rounded-full bg-black/40 p-1 disabled:opacity-25"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}

function ViewerPhoto({ src, index }: { src: string; index: number }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <p className="flex h-full items-center justify-center text-sm text-white/70">
      이미지를 불러오지 못했습니다.
    </p>
  ) : (
    <Image
      src={src}
      alt={`확대 사진 ${index + 1}`}
      fill
      unoptimized
      sizes="375px"
      draggable={false}
      className="select-none object-contain"
      onError={() => setFailed(true)}
    />
  );
}
