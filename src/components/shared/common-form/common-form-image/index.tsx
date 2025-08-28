"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  FieldPath,
  FieldValues,
  PathValue,
  useFormContext,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  placeholderImage = "/placeholder.png",
  readOnly = false,
  updateUrlOnSelect = true,
  accept = "image/*",
}: CommonFormImageProps<TFieldValues>) {
  const { setValue, watch } = useFormContext<TFieldValues>();

  // URL(string) 필드
  const imageUrl = watch(name) as unknown as string | null | undefined;
  // File 필드(선택)
  const fileValue = fileName
    ? (watch(fileName) as unknown as File | null | undefined)
    : undefined;

  const [preview, setPreview] = useState<string | null>(null);
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
        shouldTouch: true,
      });
    }

    // 선택 즉시 미리보기 반영
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // 필요 시 name(URL) 필드도 즉시 업데이트(미리보기/UX용)
    if (updateUrlOnSelect) {
      setValue(name, objectUrl as PathValue<TFieldValues, typeof name>, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  const triggerFileSelect = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  return (
    <FormField
      name={name}
      render={() => (
        <FormItem className={cn("flex flex-col gap-2 mt-[20px]", className)}>
          <FormLabel>{label}</FormLabel>
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
                  "w-[350px] h-[120px] bg-border border overflow-hidden",
                  { "cursor-pointer": !readOnly },
                )}
                onClick={triggerFileSelect}
              >
                <Image
                  src={preview || placeholderImage}
                  alt="이미지 미리보기"
                  width={200}
                  height={100}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
