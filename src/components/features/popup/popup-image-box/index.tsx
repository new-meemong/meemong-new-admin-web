"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface BannerImageBoxProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function BannerImageBox({
  src,
  alt = "image",
  width = 203,
  height = 65,
  className,
}: BannerImageBoxProps) {
  return (
    <div className={cn("banner-image-box flex justify-center")}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden",
          className,
        )}
        style={{ width, height }}
      >
        <Image
          src={src}
          alt={alt!}
          width={width}
          height={height}
          className="object-cover"
        />
      </div>
    </div>
  );
}
