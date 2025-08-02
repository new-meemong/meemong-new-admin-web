"use client";

import { useForm } from "react-hook-form";
import { FormEvent, useCallback, useEffect } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { CommonForm } from "@/components/shared/common-form";
import { formatDate } from "@/utils/date";
import { IBannerForm } from "@/models/banner";
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
  const formSchema = z.object({
    company: z.string(),
    createdAt: z.string(),
    endAt: z.string(),
    bannerType: z.string(),
    imageUrl: z.string(),
    redirectUrl: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "-",
      createdAt: "-",
      endAt: "",
      bannerType: "-",
      imageUrl: "",
      redirectUrl: "",
    },
  });

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      onSubmit({
        endAt: form.getValues("endAt"),
        bannerType: form.getValues("bannerType"),
        imageUrl: form.getValues("imageUrl"),
        redirectUrl: form.getValues("redirectUrl"),
      });
    },
    [onSubmit, form],
  );

  useEffect(() => {
    if (formData) {
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
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <CommonForm.Readonly
            name={"companyName"}
            label={"고객사명"}
            value={form.watch("company") || "-"}
          />
          <CommonForm.Readonly
            name={"createdAt"}
            label={"등록일"}
            value={form.watch("createdAt")}
            formatter={(v) => {
              return v ? formatDate(v as string, "YYYY.MM.DD") : "-";
            }}
          />
          <CommonForm.Date name={"endAt"} label={"마감일"} />
          <CommonForm.Image name={"imageUrl"} label={"이미지"} readOnly={true} />
          <CommonForm.Readonly
            name={"bannerType"}
            value={form.watch("bannerType")}
            label={"배너 위치"}
          />
          <CommonForm.Input
            name={"redirectUrl"}
            label={"링크"}
            value={form.watch("redirectUrl")}
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
