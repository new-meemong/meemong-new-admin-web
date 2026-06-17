"use client";

import React, { useCallback } from "react";
import { FieldPath, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import SalonPickProductAdSettingsFields from "@/components/features/salon-pick-products/salon-pick-product-ad-settings-fields";
import SalonPickProductImageField from "@/components/features/salon-pick-products/salon-pick-product-image-field";
import { ISalonPickProductForm } from "@/models/salonPickProducts";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  SALON_PICK_PRODUCT_HAIR_CONCERNS,
  SALON_PICK_PRODUCT_LINK_URL_PREFIX,
  SALON_PICK_PRODUCT_SEX,
  SALON_PICK_PRODUCT_TREATMENT_TYPES,
} from "@/constants/salonPickProducts";
import {
  getSalonPickProductLinkUrlErrorMessage,
  getSalonPickProductLinkUrlOrDefault,
  isSalonPickProductLinkUrl,
} from "@/utils/salonPickProducts";

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
      .superRefine((value, context) => {
        const message = getSalonPickProductLinkUrlErrorMessage(value);

        if (message) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message,
          });
        }
      }),
    originalPrice: z.string().trim().min(1, "원가를 입력해주세요."),
    discountPrice: z.string().trim().min(1, "할인가를 입력해주세요."),
    chipText: z.string().trim().min(1, "칩문구를 입력해주세요."),
    imageUrl: z.string().optional(),
    imageFile: imageFileSchema,
    bannerImageUrl: z.string().nullable().optional(),
    bannerImageFile: imageFileSchema,
    sex: z.enum([
      SALON_PICK_PRODUCT_SEX.ALL,
      SALON_PICK_PRODUCT_SEX.MALE,
      SALON_PICK_PRODUCT_SEX.FEMALE,
    ]),
    hairConcerns: z
      .array(z.enum(SALON_PICK_PRODUCT_HAIR_CONCERNS))
      .min(1, "관련 고민을 선택해주세요."),
    preferredTreatmentTypes: z
      .array(z.enum(SALON_PICK_PRODUCT_TREATMENT_TYPES))
      .min(1, "시술종류를 선택해주세요."),
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
    placeholder: SALON_PICK_PRODUCT_LINK_URL_PREFIX,
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
  const isProductLinkUrlInput = name === "productLinkUrl";

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const productLinkUrlError = isProductLinkUrlInput
          ? getSalonPickProductLinkUrlErrorMessage(field.value)
          : undefined;
        const submittedError =
          isProductLinkUrlInput && form.formState.isSubmitted
            ? fieldState.error?.message
            : undefined;
        const errorMessage = productLinkUrlError ?? submittedError;
        const hasError = Boolean(errorMessage);

        return (
          <FormItem className="mt-[10px] flex flex-col gap-0">
            <FormLabel className="mb-[5px] text-[12px] font-semibold leading-normal text-[#333340]">
              {label}
            </FormLabel>
            <FormControl>
              <input
                {...field}
                value={(field.value as string | undefined) ?? ""}
                onChange={(event) => {
                  const nextValue = isProductLinkUrlInput
                    ? getSalonPickProductLinkUrlOrDefault(event.target.value)
                    : event.target.value;

                  field.onChange(nextValue);
                }}
                inputMode={inputMode}
                placeholder={placeholder}
                className={cn(
                  "h-[36px] w-[472px] rounded-[6px] border px-[12px] text-[12px] leading-normal text-[#1a1a26] outline-none placeholder:text-[#a6a6b2]",
                  hasError
                    ? "border-[#ff4d4f] bg-[#fff7f7]"
                    : hasValue
                      ? "border-[#bfd9ff] bg-[#fafcff]"
                      : "border-[#ccccd9] bg-[#fafaff]",
                )}
              />
            </FormControl>
            {errorMessage ? (
              <p
                role="alert"
                className="mt-[4px] text-[11px] font-normal leading-normal text-[#ff4d4f]"
              >
                {errorMessage}
              </p>
            ) : null}
          </FormItem>
        );
      }}
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
  const productLinkUrl = form.watch("productLinkUrl");

  const handleSubmit = useCallback(
    (values: SalonPickProductFormValues) => {
      onSubmit(values);
    },
    [onSubmit],
  );

  const imageErrorMessage =
    form.formState.isSubmitted && form.formState.errors.imageFile?.message
      ? String(form.formState.errors.imageFile.message)
      : undefined;
  const isCreateDisabled =
    isSubmitting ||
    !isSalonPickProductLinkUrl(productLinkUrl) ||
    (form.formState.isSubmitted && !form.formState.isValid);

  return (
    <Form {...form}>
      <form
        className="flex h-full w-full flex-col"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#e0e0e5] bg-[#f7f7fc] px-[24px]">
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
        <div className="flex-1 overflow-y-auto px-[24px] py-[12px]">
          <p className="mb-[8px] text-[11px] font-normal leading-normal text-[#e55933]">
            * 제품 기본 항목과 상품 이미지는 필수입니다. 생성 시 비활성화 상태로
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
          <SalonPickProductAdSettingsFields<SalonPickProductFormValues>
            className="mt-[18px]"
            hairConcernsName="hairConcerns"
            sexName="sex"
            preferredTreatmentTypesName="preferredTreatmentTypes"
            bannerSlot={
              <SalonPickProductImageField<SalonPickProductFormValues>
                name="bannerImageUrl"
                fileName="bannerImageFile"
                label="배너 이미지 (헤어컨설팅 상세용)"
              />
            }
          />
        </div>
        <footer className="flex h-[60px] shrink-0 justify-end gap-[12px] border-t border-[#e0e0e5] pr-[8px] pt-[10px]">
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
