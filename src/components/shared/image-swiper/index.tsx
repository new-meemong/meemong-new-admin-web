import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";

export interface ImageSwiperItem {
  src: string;
  title?: string;
  id?: number;
  deletable?: boolean;
}

interface ImageSwiperProps {
  images: ImageSwiperItem[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  onDeleteImage?: (
    image: ImageSwiperItem,
    index: number,
  ) => Promise<boolean> | boolean;
  onIndexChange?: (i: number) => void;
  className?: string;
}

export default function ImageSwiper({
  images,
  initialIndex,
  open,
  onClose,
  onDeleteImage,
  className,
}: ImageSwiperProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(initialIndex, true);
  }, [emblaApi, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const original = {
      overflow: document.body.style.overflow,
      pointerEvents: document.body.style.pointerEvents,
    };
    document.body.style.overflow = "hidden";
    document.body.style.pointerEvents = "auto";
    return () => {
      document.body.style.overflow = original.overflow;
      document.body.style.pointerEvents = original.pointerEvents;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, emblaApi, onClose]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (!open || typeof window === "undefined") return null;

  const currentImage = images[currentIndex];
  const canDeleteCurrent =
    Boolean(onDeleteImage) &&
    Boolean(currentImage?.id) &&
    currentImage?.deletable !== false;

  const handleDeleteCurrent = async () => {
    if (!onDeleteImage || !currentImage || !canDeleteCurrent) return;

    try {
      setIsDeleting(true);
      const isDeleted = await onDeleteImage(currentImage, currentIndex);
      if (isDeleted) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const overlay = (
    <div
      className={cn(
        "fixed inset-0 z-[1000] flex flex-col bg-black/90 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {canDeleteCurrent && (
            <button
              onClick={handleDeleteCurrent}
              aria-label="삭제"
              disabled={isDeleting}
              className={cn(
                "rounded-2xl px-3 py-2 text-sm font-medium text-white hover:bg-white/10 cursor-pointer",
                isDeleting && "opacity-60 cursor-not-allowed",
              )}
            >
              <span className="inline-flex items-center gap-1">
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "삭제 중..." : "삭제"}
              </span>
            </button>
          )}
          <div className="text-white text-sm/6 opacity-80">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="rounded-2xl p-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative isolate flex-1">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {images.map((image, i) => (
              <div
                key={i}
                className="embla__slide min-w-0 flex-[0_0_100%] flex-col items-center justify-center"
              >
                <div className="flex h-full w-full items-center justify-center">
                  <div className="flex flex-col items-center">
                    <img
                      src={image.src}
                      alt={`image-${i}`}
                      className="max-h-[70vh] w-auto select-none object-contain"
                      draggable={false}
                    />
                    {image.title && (
                      <div className="mt-3 text-center text-white text-base font-medium opacity-90">
                        {image.title}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <>
            <NavButton side="left" onClick={() => emblaApi?.scrollPrev()} />
            <NavButton side="right" onClick={() => emblaApi?.scrollNext()} />
          </>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  const position = side === "left" ? "left-2" : "right-2";
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "이전" : "다음"}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 rounded-full p-2 text-white/90 hover:text-white hover:bg-white/10 cursor-pointer",
        position,
      )}
    >
      <Icon className="h-7 w-7" />
    </button>
  );
}
