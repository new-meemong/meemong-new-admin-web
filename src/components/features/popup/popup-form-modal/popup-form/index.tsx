"use client";

import { useForm } from "react-hook-form";
import React, { useCallback, useEffect } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { CommonForm } from "@/components/shared/common-form";
import { IPopupForm } from "@/models/popup";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  POPUP_TYPE_OPTIONS,
  PopupUserType,
  DEFAULT_POPUP_TYPE_BY_USER_TYPE,
  USER_TYPE_OPTIONS,
  HIDE_TYPE_OPTIONS,
} from "@/constants/popup";

interface PopupFormProps {
  formData: IPopupForm;
  onSubmit: (form: Partial<IPopupForm & { imageFile: File }>) => void;
  onClose: () => void;
}

export default function PopupForm({
  formData,
  onSubmit,
  onClose,
}: PopupFormProps) {
  const readOnly = Boolean(formData.id);

  const formSchema = z.object({
    userType: z.string(),
    popupType: z.string(),
    hideType: z.string(),
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
      userType: form.getValues("userType"),
      popupType: form.getValues("popupType"),
      hideType: form.getValues("hideType"),
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
                  "popupType",
                  DEFAULT_POPUP_TYPE_BY_USER_TYPE[value as PopupUserType],
                );
              },
              size: "sm",
              placeholder: "유저타입을 선택해주세요.",
              width: 100,
              readOnly,
            }}
            right={{
              name: "popupType",
              options:
                POPUP_TYPE_OPTIONS[form.watch("userType") as PopupUserType] ||
                [],
              value: form.watch("popupType"),
              onChange: ({ value }) => form.setValue("popupType", value),
              size: "sm",
              placeholder: "배너위치를 선택해주세요.",
              className: "flex-1",
              readOnly,
            }}
          />
          <CommonForm.SelectBox
            name={"hideType"}
            label={"안보기옵션"}
            defaultValue={"일주일간 보지 않기"}
            options={HIDE_TYPE_OPTIONS}
            align={"row"}
            size={"sm"}
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
                팝업 시작
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
