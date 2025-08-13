"use client";

import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import ImageSwiper from "@/components/shared/image-swiper";

interface ImageBoxProps {
  src: string;
  title?: string;
  images: { src: string; title?: string }[];
  index?: number;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ImageBox({
  src,
  title,
  images = [],
  index = 0,
  alt = "image",
  width = 100,
  height = 100,
  className,
}: ImageBoxProps) {
  const [open, setOpen] = useState(false);

  const handleClick = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <div
        className={cn("image-box cursor-pointer")}
        onClick={() => {
          handleClick();
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center overflow-hidden bg-gray-300",
            className,
          )}
          style={{ width, height }}
        >
          <img
            src={src}
            alt={alt!}
            width={width}
            height={height}
            className="object-cover"
          />
        </div>
        {title && (
          <div className={cn("w-full typo-body-2-regular text-center")}>
            {title}
          </div>
        )}
      </div>
      {open && (
        <ImageSwiper
          images={images}
          initialIndex={index}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
