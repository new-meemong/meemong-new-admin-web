"use client";

import {
  FieldPath,
  FieldValues,
  PathValue,
  useFormContext
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import React, { useEffect, useRef, useState } from "react";

import { CommonForm } from "@/components/shared/common-form";
import IcImgPlus from "@/assets/icons/ic_img_plus.svg";
import Image from "next/image";
import ImageSwiper from "@/components/shared/image-swiper";
import { cn } from "@/lib/utils";

interface CommonFormImageProps<TFieldValues extends FieldValues> {
  /** 미리보기 및(선택적으로) URL을 담는 필드 */
  name: FieldPath<TFieldValues>;
  /** 업로드용 File을 담는 필드(선택). 제공 시 여기에 File 저장 */
  fileName?: FieldPath<TFieldValues>;
  label: string;
  className?: string;
  placeholderImage?: string; // 초기 이미지 없을 때 기본값
  readOnly?: boolean;
  /** 파일 선택 시 name(URL) 필드를 objectURL로 업데이트할지 여부 (기본 true) */
  updateUrlOnSelect?: boolean;
  /** input accept 옵션 (기본 "image/*") */
  accept?: string;
}

export function CommonFormImage<TFieldValues extends FieldValues>({
  name,
  fileName,
  label,
  className,
  placeholderImage,
  readOnly = false,
  updateUrlOnSelect = true,
  accept = "image/*"
}: CommonFormImageProps<TFieldValues>) {
  const { setValue, watch } = useFormContext<TFieldValues>();

  // URL(string) 필드
  const imageUrl = watch(name) as unknown as string | null | undefined;
  // File 필드(선택)
  const fileValue = fileName
    ? (watch(fileName) as unknown as File | null | undefined)
    : undefined;

  const [preview, setPreview] = useState<string | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 미리보기 업데이트: fileValue가 있으면 objectURL, 아니면 imageUrl
  useEffect(() => {
    let revoke: string | undefined;

    if (fileValue instanceof File) {
      const url = URL.createObjectURL(fileValue);
      setPreview(url);
      revoke = url;
    } else {
      setPreview(imageUrl ?? null);
    }

    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [imageUrl, fileValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // 업로드용 File을 fileName 필드에 저장(있을 때만)
    if (fileName) {
      setValue(fileName, file as PathValue<TFieldValues, typeof fileName>, {
        shouldDirty: true,
        shouldTouch: true
      });
    }

    // 선택 즉시 미리보기 반영
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // 필요 시 name(URL) 필드도 즉시 업데이트(미리보기/UX용)
    if (updateUrlOnSelect) {
      setValue(name, objectUrl as PathValue<TFieldValues, typeof name>, {
        shouldDirty: true,
        shouldTouch: true
      });
    }
  };

  const triggerFileSelect = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview || placeholderImage) {
      setIsImageViewerOpen(true);
    }
  };

  return (
    <FormField
      name={name}
      render={() => (
        <FormItem className={cn("flex flex-col gap-0 mt-[20px]", className)}>
          <FormLabel className={cn("text-foreground-strong mb-2")}>
            {label}
          </FormLabel>
          <FormControl>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
              />
              <div
                className={cn(
                  "min-w-[350px] h-[120px] bg-border border rounded-[6px] overflow-hidden relative",
                  { "cursor-pointer": !readOnly }
                )}
                onClick={
                  preview || placeholderImage
                    ? handleImageClick
                    : triggerFileSelect
                }
              >
                {preview || placeholderImage ? (
                  <Image
                    src={(preview || placeholderImage)!}
                    alt="이미지 미리보기"
                    width={200}
                    height={100}
                    className={cn(
                      "object-contain w-full h-full cursor-pointer"
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full flex justify-center items-center"
                    )}
                  >
                    <IcImgPlus />
                  </div>
                )}
              </div>
            </div>
          </FormControl>
          <CommonForm.ErrorMessage name={fileName} />
          {(preview || placeholderImage) && (
            <ImageSwiper
              images={[{ src: preview || placeholderImage || "" }]}
              initialIndex={0}
              open={isImageViewerOpen}
              onClose={() => setIsImageViewerOpen(false)}
            />
          )}
        </FormItem>
      )}
    />
  );
}
