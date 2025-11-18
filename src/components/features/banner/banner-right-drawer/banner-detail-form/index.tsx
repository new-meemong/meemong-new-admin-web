"use client";

import { FormEvent, useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { Form } from "@/components/ui/form";
import { FormGroup } from "@/components/ui/form-group";
import { IBannerForm } from "@/models/banner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface BannerDetailFormProps {
  formData: IBannerForm;
  onSubmit: (form: Partial<IBannerForm & { imageFile: File }>) => void;
}

export default function BannerDetailForm({
  formData,
  onSubmit
}: BannerDetailFormProps) {
  const BANNER_TYPE_OPTIONS: {
    value: string;
    label: string;
  }[] = [
    { value: "중단 배너", label: "중단 배너" },
    { value: "번개매칭", label: "번개매칭" },
    { value: "일반", label: "일반" },
    { value: "구인구직", label: "구인구직" },
    { value: "바텀시트", label: "바텀시트" }
  ];

  const formSchema = z.object({
    createdAt: z.string(),
    endAt: z.string(),
    bannerType: z.string(),
    imageUrl: z.string(),
    imageFile: z
      .custom<File>((v) => v instanceof File, "유효한 파일이 아닙니다.")
      .optional(),
    redirectUrl: z.string()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: formData as z.infer<typeof formSchema>,
    mode: "onChange"
  });

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      onSubmit({
        endAt: form.getValues("endAt"),
        bannerType: form.getValues("bannerType"),
        imageUrl: form.getValues("imageUrl"),
        imageFile: form.getValues("imageFile"),
        redirectUrl: form.getValues("redirectUrl")
      });
    },
    [onSubmit, form]
  );

  useEffect(() => {
    if (formData) {
      form.reset({
        ...formData
      });
    }
  }, [formData, form]);

  if (!formData) {
    return "...loading";
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <CommonForm.Readonly
            name={"createdAt"}
            label={"등록일"}
            value={form.watch("createdAt")}
            formatter={(v) => {
              return v ? formatDate(v as string, "YYYY.MM.DD") : "-";
            }}
          />
          <CommonForm.Date name={"endAt"} label={"마감일"} />
          <CommonForm.Image
            name={"imageUrl"}
            fileName={"imageFile"}
            label={"이미지"}
          />
          <CommonForm.SelectBox
            name={"bannerType"}
            label={"배너 위치"}
            defaultValue={form.watch("bannerType")}
            options={BANNER_TYPE_OPTIONS}
            placeholder={"배너위치를 선택해주세요."}
          />
          <CommonForm.Input
            name={"redirectUrl"}
            label={"링크"}
            value={form.watch("redirectUrl")}
            placeholder={"링크를 입력해주세요."}
          />
        </FormGroup>
        <div className={cn("mt-[20px]")}>
          <Button type={"submit"} variant={"default"} className={cn("w-full")}>
            수정하기
          </Button>
        </div>
      </form>
    </Form>
  );
}
