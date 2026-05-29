"use client";

import React, { useCallback } from "react";
import {
  FieldPath,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import SalonPickProductImageField from "@/components/features/salon-pick-products/salon-pick-product-image-field";
import { ISalonPickProductForm } from "@/models/salonPickProducts";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const imageFileSchema = z
  .custom<File>((value) => value instanceof File, "이미지를 등록해주세요.")
  .refine((file) => file.size > 0, "파일이 비어있습니다.")
  .optional();

const salonPickProductFormSchema = z
  .object({
    productName: z.string().trim().min(1, "제품명을 입력해주세요."),
    productLinkUrl: z
      .string()
      .trim()
      .min(1, "링크를 입력해주세요.")
      .url("올바른 URL을 입력해주세요."),
    originalPrice: z.string().trim().min(1, "원가를 입력해주세요."),
    discountPrice: z.string().trim().min(1, "할인가를 입력해주세요."),
    chipText: z.string().trim().min(1, "칩문구를 입력해주세요."),
    imageUrl: z.string().optional(),
    imageFile: imageFileSchema,
  })
  .refine((value) => Boolean(value.imageUrl || value.imageFile), {
    path: ["imageFile"],
    message: "이미지는 필수 항목입니다.",
  });

export type SalonPickProductFormValues = z.infer<
  typeof salonPickProductFormSchema
>;

interface SalonPickProductFormProps {
  formData: ISalonPickProductForm;
  onSubmit: (form: SalonPickProductFormValues) => void;
  onClose: () => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
}

const inputFields: {
  name: FieldPath<SalonPickProductFormValues>;
  label: string;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}[] = [
  {
    name: "productName",
    label: "제품명 *",
    placeholder: "제품명을 입력하세요",
  },
  {
    name: "productLinkUrl",
    label: "링크 (URL) *",
    placeholder: "https://salonpick.co.kr/...",
  },
  {
    name: "originalPrice",
    label: "원가 (원) *",
    placeholder: "예: 222000",
    inputMode: "numeric",
  },
  {
    name: "discountPrice",
    label: "할인가 (원) *",
    placeholder: "예: 99000",
    inputMode: "numeric",
  },
  {
    name: "chipText",
    label: "칩문구 *",
    placeholder: "예: BEST",
  },
];

function SalonPickProductCreateInput({
  form,
  name,
  label,
  placeholder,
  inputMode,
}: {
  form: UseFormReturn<SalonPickProductFormValues>;
  name: FieldPath<SalonPickProductFormValues>;
  label: string;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const value = form.watch(name);
  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="mt-[10px] flex flex-col gap-0">
          <FormLabel className="mb-[5px] text-[12px] font-semibold leading-normal text-[#333340]">
            {label}
          </FormLabel>
          <FormControl>
            <input
              {...field}
              value={(field.value as string | undefined) ?? ""}
              inputMode={inputMode}
              placeholder={placeholder}
              className={cn(
                "h-[36px] w-[472px] rounded-[6px] border px-[12px] text-[12px] leading-normal text-[#1a1a26] outline-none placeholder:text-[#a6a6b2]",
                hasValue
                  ? "border-[#bfd9ff] bg-[#fafcff]"
                  : "border-[#ccccd9] bg-[#fafaff]",
              )}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export default function SalonPickProductForm({
  formData,
  onSubmit,
  onClose,
  submitButtonText = "생성하기",
  isSubmitting = false,
}: SalonPickProductFormProps) {
  const form = useForm<SalonPickProductFormValues>({
    resolver: zodResolver(salonPickProductFormSchema),
    values: formData as SalonPickProductFormValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const handleSubmit = useCallback(() => {
    onSubmit({
      productName: form.getValues("productName"),
      productLinkUrl: form.getValues("productLinkUrl"),
      originalPrice: form.getValues("originalPrice"),
      discountPrice: form.getValues("discountPrice"),
      chipText: form.getValues("chipText"),
      imageUrl: form.getValues("imageUrl"),
      imageFile: form.getValues("imageFile"),
    });
  }, [form, onSubmit]);

  const imageErrorMessage =
    form.formState.isSubmitted && form.formState.errors.imageFile?.message
      ? String(form.formState.errors.imageFile.message)
      : undefined;
  const isCreateDisabled =
    isSubmitting || (form.formState.isSubmitted && !form.formState.isValid);

  return (
    <Form {...form}>
      <form
        className="relative h-[680px] w-[520px]"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <header className="flex h-[60px] items-center justify-between border-b border-[#e0e0e5] bg-[#f7f7fc] px-[24px]">
          <h2 className="text-[18px] font-semibold leading-normal text-[#1a1a1a]">
            신규 슬롯 생성
          </h2>
          <button
            type="button"
            className="flex h-[24px] w-[24px] items-center justify-center text-[#808080]"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="px-[24px] pt-[12px]">
          <p className="mb-[8px] text-[11px] font-normal leading-normal text-[#e55933]">
            * 모든 항목은 필수 입력입니다. 생성 시 비활성화 상태로
            등록됩니다.
          </p>
          {inputFields.map((field) => (
            <SalonPickProductCreateInput
              key={field.name}
              form={form}
              {...field}
            />
          ))}
          <SalonPickProductImageField<SalonPickProductFormValues>
            name="imageUrl"
            fileName="imageFile"
            label="이미지 *"
            className="mt-[10px]"
            errorMessage={imageErrorMessage}
          />
        </div>
        <footer className="absolute bottom-0 left-0 flex h-[60px] w-full justify-end gap-[12px] border-t border-[#e0e0e5] pr-[8px] pt-[10px]">
          <button
            onClick={onClose}
            type="button"
            className="h-[40px] w-[120px] rounded-[6px] border border-[#ccccd9] bg-[#f2f2f7] text-[14px] font-normal leading-normal text-[#4d4d59]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isCreateDisabled}
            className={cn(
              "h-[40px] w-[120px] rounded-[6px] text-[14px] font-semibold leading-normal text-white",
              isCreateDisabled ? "bg-[#cbcbcb]" : "bg-[#3171ff]",
            )}
          >
            {submitButtonText}
          </button>
        </footer>
      </form>
    </Form>
  );
}
