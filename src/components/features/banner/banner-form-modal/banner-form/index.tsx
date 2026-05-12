"use client";

import {
  ALL_BANNER_TYPE_VALUES,
  BANNER_TYPE_OPTIONS,
  BANNER_USER_TYPE,
  BannerType,
  BannerUserType,
  DEFAULT_BANNER_TYPE_BY_USER_TYPE,
  USER_TYPE_OPTIONS
} from "@/constants/banner";
import React, { useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { Form } from "@/components/ui/form";
import { FormGroup } from "@/components/ui/form-group";
import { IBannerForm } from "@/models/banner";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface BannerFormProps {
  formData: IBannerForm;
  onSubmit: (form: Partial<IBannerForm & { imageFile: File }>) => void;
  onClose: () => void;
  readOnly?: boolean;
  submitButtonText?: string;
}

export default function BannerForm({
  formData,
  onSubmit,
  onClose,
  readOnly: readOnlyProp,
  submitButtonText = "배너추가"
}: BannerFormProps) {
  const readOnly = readOnlyProp ?? Boolean(formData.id);

  const formSchema = z.object({
    userType: z.nativeEnum(BANNER_USER_TYPE),
    bannerType: z.custom<BannerType>(
      (value) => ALL_BANNER_TYPE_VALUES.includes(value as BannerType),
      "배너위치를 선택해주세요."
    ),
    imageUrl: z.string().optional(),
    imageFile: z
      .union([
        z
          .custom<File>((v) => v instanceof File, "유효한 파일이 아닙니다.")
          .refine((f) => f.size > 0, "파일이 비어있습니다."),
        z.undefined()
      ])
      .optional(),
    redirectUrl: z.string().optional(),
    endAt: z
      .union([z.string(), z.date(), z.null()])
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // optional이므로 없어도 됨
          // 문자열 또는 Date 객체를 Date로 변환
          const date = val instanceof Date ? val : new Date(val as string);
          const now = new Date();
          // 버튼 클릭 시점과 validation 시점 사이의 시간 차이를 고려하여 1분 여유를 둠
          const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

          // 현재 시간 이후 또는 1분 전까지 허용 (버튼 클릭 시점과 validation 시점 차이 고려)
          // "지금 종료하기" 버튼 사용 시 현재 시간 허용
          // 수동 선택 시에도 현재 시간 이후면 허용 (내일부터 선택하도록 UI에서 안내)
          return date >= oneMinuteAgo;
        },
        {
          message: "노출 종료일은 현재 시간 이후로 설정해주세요."
        }
      )
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      ...formData,
      endAt: formData.endAt || undefined // 문자열로 유지
    } as z.infer<typeof formSchema>,
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  });

  const handleSubmit = useCallback(() => {
    const endAtValue = form.getValues("endAt");
    // endAt은 문자열로 유지 (Date 객체가 아닌 경우만 ISO 문자열로 변환)
    let endAtString: string | undefined = undefined;
    if (endAtValue) {
      if (endAtValue instanceof Date) {
        endAtString = endAtValue.toISOString();
      } else if (typeof endAtValue === "string") {
        endAtString = endAtValue;
      }
    }

    const formValues = {
      userType: form.getValues("userType"),
      bannerType: form.getValues("bannerType"),
      imageUrl: form.getValues("imageUrl"),
      imageFile: form.getValues("imageFile"),
      redirectUrl: form.getValues("redirectUrl") || undefined,
      endAt: endAtString
    };
    onSubmit(formValues);
  }, [onSubmit, form]);

  useEffect(() => {
    if (formData.id && formData) {
      const resetData = {
        ...formData,
        endAt: formData.endAt || undefined // 문자열로 유지
      };
      form.reset(resetData);
    }
  }, [formData, form]);

  if (!formData) {
    return "...loading";
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col justify-between h-full")}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormGroup className={"flex-1 overflow-y-auto"}>
          <CommonForm.DoubleSelectBox
            label={"위치"}
            left={{
              name: "userType",
              options: USER_TYPE_OPTIONS,
              value: form.watch("userType"),
              onChange: ({ value }) => {
                const userType = value as BannerUserType;
                form.setValue("userType", userType);
                form.setValue(
                  "bannerType",
                  DEFAULT_BANNER_TYPE_BY_USER_TYPE[userType] as BannerType
                );
              },
              size: "sm",
              placeholder: "유저타입을 선택해주세요.",
              width: 100,
              readOnly
            }}
            right={{
              name: "bannerType",
              options:
                BANNER_TYPE_OPTIONS[form.watch("userType") as BannerUserType] ||
                [],
              value: form.watch("bannerType"),
              onChange: ({ value }) =>
                form.setValue("bannerType", value as BannerType),
              size: "sm",
              placeholder: "배너위치를 선택해주세요.",
              className: "flex-1",
              readOnly
            }}
          />
          <CommonForm.Image
            name={"imageUrl"}
            fileName={"imageFile"}
            label={"이미지"}
            readOnly={readOnly}
          />
          <CommonForm.Textarea
            name={"redirectUrl"}
            label={"링크"}
            value={form.watch("redirectUrl")}
            placeholder={"링크를 입력해주세요."}
            readOnly={readOnly}
          />
          <div className={cn("flex flex-col gap-1 mt-[20px]")}>
            <CommonForm.Date
              name={"endAt"}
              label={"노출 종료일"}
              showTime={true}
              minDate={new Date()}
            />
            {!readOnly && (
              <div className={cn("flex gap-2 mt-2")}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const now = new Date();
                    form.setValue("endAt", now.toISOString()); // ISO 문자열로 저장
                    form.trigger("endAt");
                  }}
                  className={cn("flex-1")}
                >
                  지금 종료하기
                </Button>
                {form.watch("endAt") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.setValue("endAt", undefined, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                      });
                      form.trigger("endAt");
                    }}
                    className={cn("flex-1")}
                  >
                    종료일 삭제
                  </Button>
                )}
              </div>
            )}
          </div>
        </FormGroup>
        <div className={cn("mt-[20px] flex gap-4 justify-between")}>
          {readOnly ? (
            <Button
              onClick={() => {
                onClose();
              }}
              type={"button"}
              variant={"submit-modal"}
              size={"lg"}
              className={cn("flex-1")}
            >
              닫기
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  onClose();
                }}
                type={"button"}
                variant={"negative-modal"}
                size={"lg"}
                className={cn("flex-1")}
              >
                닫기
              </Button>
              <Button
                type={"submit"}
                variant={"submit-modal"}
                size={"lg"}
                className={cn("flex-1")}
              >
                {submitButtonText}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
