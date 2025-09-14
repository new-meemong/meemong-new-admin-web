"use client";

import { useForm } from "react-hook-form";
import React, { useCallback, useEffect } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { CommonForm } from "@/components/shared/common-form";
import { IBannerForm } from "@/models/banner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BANNER_TYPE_OPTIONS,
  BannerUserType,
  DEFAULT_BANNER_TYPE_BY_USER_TYPE,
  USER_TYPE_OPTIONS,
} from "@/constants/banner";

interface BannerFormProps {
  formData: IBannerForm;
  onSubmit: (form: Partial<IBannerForm & { imageFile: File }>) => void;
  onClose: () => void;
}

export default function BannerForm({
  formData,
  onSubmit,
  onClose,
}: BannerFormProps) {
  const readOnly = Boolean(formData.id);

  const formSchema = z.object({
    company: z.string().min(1, "고객사명을 입력해주세요."),
    userType: z.string(),
    bannerType: z.string(),
    imageUrl: z.string().optional(),
    imageFile: z
      .custom<File>((v) => v instanceof File, "유효한 파일이 아닙니다.")
      .refine((f) => f.size > 0, "파일이 비어있습니다."),
    redirectUrl: z.string().min(1, "링크를 입력해주세요."),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: formData as z.infer<typeof formSchema>,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const handleSubmit = useCallback(() => {
    onSubmit({
      company: form.getValues("company"),
      userType: form.getValues("userType"),
      bannerType: form.getValues("bannerType"),
      imageUrl: form.getValues("imageUrl"),
      imageFile: form.getValues("imageFile"),
      redirectUrl: form.getValues("redirectUrl"),
    });
  }, [onSubmit, form]);

  useEffect(() => {
    if (formData.id && formData) {
      form.reset({
        ...formData,
      });
    }
  }, [formData, form]);

  if (!formData) {
    return "...loading";
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col justify-between h-full")}
        onSubmit={form.handleSubmit(handleSubmit, () => {})}
      >
        <FormGroup className={"flex-1 overflow-y-auto"}>
          <CommonForm.DoubleSelectBox
            label={"위치"}
            left={{
              name: "userType",
              options: USER_TYPE_OPTIONS,
              value: form.watch("userType"),
              onChange: ({ value }) => {
                form.setValue("userType", value);
                form.setValue(
                  "bannerType",
                  DEFAULT_BANNER_TYPE_BY_USER_TYPE[value as BannerUserType],
                );
              },
              size: "sm",
              placeholder: "유저타입을 선택해주세요.",
              width: 100,
              readOnly,
            }}
            right={{
              name: "bannerType",
              options:
                BANNER_TYPE_OPTIONS[form.watch("userType") as BannerUserType] ||
                [],
              value: form.watch("bannerType"),
              onChange: ({ value }) => form.setValue("bannerType", value),
              size: "sm",
              placeholder: "배너위치를 선택해주세요.",
              className: "flex-1",
              readOnly,
            }}
          />
          <CommonForm.Input
            name={"company"}
            label={"고객사명"}
            placeholder={"고객사명을 입력해주세요."}
            align={"row"}
            readOnly={readOnly}
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
        </FormGroup>
        <div className={cn("mt-[20px] flex gap-4 justify-between")}>{
          readOnly ? <Button
            onClick={() => {
              onClose();
            }}
            type={"button"}
            variant={"submit-modal"}
            size={"lg"}
            className={cn("flex-1")}
          >
            닫기
          </Button> :<><Button
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
              배너교체
            </Button></>
        }

        </div>
      </form>
    </Form>
  );
}
