"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserImageBoxProps {
  src: string;
  title?: string;
  alt?: string;
  size?: number; // 기본 사이즈는 64px
  className?: string;
}

export default function UserImageBox({
  src,
  title,
  alt = "image",
  size = 100,
  className,
}: UserImageBoxProps) {
  return (
    <div className={cn("user-image-box")}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden bg-gray-300",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={alt!}
          width={size}
          height={size}
          className="object-cover"
        />
      </div>
      {title && (
        <div className={cn("w-full typo-body-2-regular text-center")}>
          {title}
        </div>
      )}
    </div>
  );
}
