"use client";

import { useForm } from "react-hook-form";
import { FormEvent, useCallback } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { CommonForm } from "@/components/shared/common-form";
import { formatDate } from "@/utils/date";
import { BannerLocationType, IBannerForm } from "@/models/banner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BannerDetailFormProps {
  formData: IBannerForm;
  onSubmit: (form: Partial<IBannerForm>) => void;
}

export default function BannerDetailForm({
  formData,
  onSubmit,
}: BannerDetailFormProps) {
  const LOCATION_TYPE_OPTIONS: {
    value: BannerLocationType;
    label: string;
  }[] = [
    { value: "0", label: "일반" },
    { value: "1", label: "모델배너상단" },
  ];

  const formSchema = z.object({
    companyName: z.string(),
    createdAt: z.string(),
    endAt: z.string(),
    location: z.string(),
    bannerImageUrl: z.string(),
    linkUrl: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: formData?.companyName ?? "",
      createdAt: formData?.createdAt ?? "",
      endAt: formData?.endAt ?? "",
      location: formData?.location ?? "",
      bannerImageUrl: formData?.bannerImageUrl ?? "",
      linkUrl: formData?.linkUrl ?? "",
    },
  });

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      onSubmit({
        endAt: form.getValues("endAt"),
        location: form.getValues("location") as BannerLocationType,
        bannerImageUrl: form.getValues("bannerImageUrl"),
        linkUrl: form.getValues("linkUrl"),
      });
    },
    [onSubmit, form],
  );

  if (!formData) {
    return "...loading";
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <CommonForm.Readonly
            name={"companyName"}
            label={"고객사명"}
            value={form.watch("companyName")}
          />
          <CommonForm.Readonly
            name={"createdAt"}
            label={"등록일"}
            value={form.watch("createdAt")}
            formatter={(v) => {
              return v ? formatDate(v as string, "YYYY.MM.DD") : "";
            }}
          />
          <CommonForm.Date
            name={"endAt"}
            label={"마감일"}
          />
          <CommonForm.Image name={"bannerImageUrl"} label={"이미지"} />
          <CommonForm.SelectBox
            name={"location"}
            label={"배너 위치"}
            options={LOCATION_TYPE_OPTIONS}
          />
          <CommonForm.Input name={"linkUrl"} label={"링크"} />
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
