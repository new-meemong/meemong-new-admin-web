"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {FieldPath, FieldValues, PathValue, useFormContext} from "react-hook-form";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface CommonFormImageProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  className?: string;
  placeholderImage?: string; // 초기 이미지 없을 때 기본값
}

export function CommonFormImage<TFieldValues extends FieldValues>({
  name,
  label,
  className,
  placeholderImage = "/placeholder.png", // 기본값 설정
}: CommonFormImageProps<TFieldValues>) {
  const { setValue, watch } = useFormContext<TFieldValues>();
  const imageUrl = watch(name) as string;

  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(imageUrl ?? null);
  }, [imageUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setValue(name, objectUrl as PathValue<TFieldValues, typeof name>); // 실제 사용 시 서버 업로드 후 URL로 교체
  };

  const triggerFileSelect = () => {
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
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
              <div
                className="w-[350px] h-[120px] bg-border border cursor-pointer overflow-hidden"
                onClick={triggerFileSelect}
              >
                <Image
                  src={preview ?? placeholderImage}
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
