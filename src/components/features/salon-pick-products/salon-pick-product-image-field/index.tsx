"use client";

/* eslint-disable @next/next/no-img-element */

import {
  FieldPath,
  FieldValues,
  PathValue,
  useFormContext,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import React, { useEffect, useRef, useState } from "react";
import ImageSwiper from "@/components/shared/image-swiper";
import { FolderUp } from "lucide-react";
import { CommonForm } from "@/components/shared/common-form";
import { cn } from "@/lib/utils";
import { parseImageUrl, stripImageVariantParams } from "@/utils/image";

interface SalonPickProductImageFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  fileName: FieldPath<TFieldValues>;
  label?: string;
  variant?: "dropzone" | "preview";
  className?: string;
  readOnly?: boolean;
  errorMessage?: string;
}

function getPreviewUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  return parseImageUrl(stripImageVariantParams(imageUrl));
}

export default function SalonPickProductImageField<
  TFieldValues extends FieldValues,
>({
  name,
  fileName,
  label,
  variant = "dropzone",
  className,
  readOnly = false,
  errorMessage,
}: SalonPickProductImageFieldProps<TFieldValues>) {
  const { setValue, watch } = useFormContext<TFieldValues>();
  const imageUrl = watch(name) as string | null | undefined;
  const fileValue = watch(fileName) as File | null | undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  useEffect(() => {
    let revoke: string | undefined;

    if (fileValue instanceof File) {
      const objectUrl = URL.createObjectURL(fileValue);
      setPreview(objectUrl);
      setOriginalPreview(objectUrl);
      revoke = objectUrl;
    } else {
      const previewUrl = getPreviewUrl(imageUrl);
      setPreview(previewUrl);
      setOriginalPreview(previewUrl);
    }

    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [fileValue, imageUrl]);

  const updateFile = (file?: File) => {
    if (readOnly || !file) return;

    const objectUrl = URL.createObjectURL(file);
    setValue(fileName, file as PathValue<TFieldValues, typeof fileName>, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue(name, objectUrl as PathValue<TFieldValues, typeof name>, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const triggerFileSelect = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  const openImageViewer = () => {
    if (preview || originalPreview) {
      setIsImageViewerOpen(true);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    updateFile(event.dataTransfer.files?.[0]);
  };

  return (
    <FormField
      name={name}
      render={() => (
        <FormItem className={cn("flex flex-col gap-0", className)}>
          {label && (
            <FormLabel className="mb-2 text-foreground-strong">
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => updateFile(event.target.files?.[0])}
              />
              {variant === "preview" ? (
                <div className="flex flex-col gap-[12px]">
                  <button
                    type="button"
                    className={cn(
                      "flex h-[220px] w-[260px] items-center justify-center overflow-hidden rounded-6 bg-[#d7ddeb] text-[#7d8599] typo-body-2-regular",
                      (preview || originalPreview) && "cursor-pointer",
                    )}
                    onClick={openImageViewer}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="상품 이미지"
                        className="h-full w-full object-cover"
                        onError={() => {
                          if (originalPreview && preview !== originalPreview) {
                            setPreview(originalPreview);
                          }
                        }}
                      />
                    ) : (
                      "이미지 썸네일"
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={readOnly}
                    className={cn(
                      "h-[36px] w-[260px] rounded-6 border border-border bg-white typo-body-2-regular text-foreground-strong",
                      readOnly
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:bg-[#f7f8fb]",
                    )}
                    onClick={triggerFileSelect}
                  >
                    이미지 변경하기
                  </button>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex h-[72px] w-[472px] items-center px-[24px] text-[12px] font-normal leading-normal text-[#808099]",
                    errorMessage
                      ? "rounded-[6px] border-2 border-dashed border-[#e54d4d] bg-[#fff5f5]"
                      : "rounded-[6px] border border-dashed border-[#bfbfd1] bg-[#f7f7fc]",
                    !readOnly && "cursor-pointer",
                  )}
                  onClick={triggerFileSelect}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="상품 이미지 미리보기"
                      className="max-h-[140px] w-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-[7px] whitespace-nowrap">
                      <FolderUp className="h-[12px] w-[12px]" />
                      <span>
                        이미지 파일 업로드 (클릭 또는 드래그 앤 드롭) — JPG,
                        PNG, WebP
                      </span>
                    </div>
                  )}
                </div>
              )}
              <ImageSwiper
                images={
                  originalPreview
                    ? [
                        {
                          src: originalPreview,
                          title: "상품 이미지",
                          deletable: false,
                        },
                      ]
                    : []
                }
                initialIndex={0}
                open={isImageViewerOpen && Boolean(originalPreview)}
                onClose={() => setIsImageViewerOpen(false)}
              />
            </div>
          </FormControl>
          {errorMessage ? (
            <p className="mt-[4px] text-[11px] font-normal leading-normal text-[#e54d4d]">
              {errorMessage}
            </p>
          ) : (
            <CommonForm.ErrorMessage name={fileName} />
          )}
        </FormItem>
      )}
    />
  );
}
