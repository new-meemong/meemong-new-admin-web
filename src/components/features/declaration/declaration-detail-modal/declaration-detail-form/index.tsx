"use client";

import { useForm } from "react-hook-form";
import React, { FormEvent, useCallback, useEffect } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CommonForm } from "@/components/shared/common-form";
import { IDeclarationForm } from "@/models/declaration";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DeclarationStatusType } from "@/constants/declaration";
import DeclarationImageBox from "@/components/features/declaration/declaration-image-box";

interface DeclarationDetailFormProps {
  formData: IDeclarationForm;
  onSubmit: (form: Partial<IDeclarationForm>) => void;
}

export default function DeclarationDetailForm({
  formData,
  onSubmit,
}: DeclarationDetailFormProps) {
  const STATUS_TYPE_OPTIONS: {
    value: string;
    label: string;
  }[] = [
    { value: "미확인", label: "미확인" },
    { value: "확인", label: "확인" },
    { value: "대기", label: "대기" },
    { value: "처리완료", label: "처리완료" },
  ];

  const formSchema = z.object({
    reporter: z.string(),
    reporterName: z.string(),
    reporterUid: z.string(),
    respondent: z.string(),
    respondentName: z.string(),
    respondentUid: z.string(),
    description: z.string(),
    declarationType: z.string(),
    imageUrl: z.string(),
    status: z.string(),
    memo: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: formData as z.infer<typeof formSchema>,
    mode: "onChange",
  });

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      onSubmit({
        status: form.getValues("status") as DeclarationStatusType,
        memo: form.getValues("memo"),
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
            name={"reporter"}
            label={"신고자"}
            value={`${form.watch("reporter")} / ${form.watch("reporterName")} / ${form.watch("reporterUid")}`}
          />
          <CommonForm.Readonly
            name={"respondent"}
            label={"피신고자"}
            value={`${form.watch("respondent")} / ${form.watch("respondentName")} / ${form.watch("respondentUid")}`}
          />
          <CommonForm.Readonly
            name={"declarationType"}
            label={"신고위치"}
            value={form.watch("declarationType")}
          />
          <CommonForm.Readonly
            name={"imageUrl"}
            label={"신고 이미지"}
            value={form.watch("imageUrl")}
            formatter={(imgUrl) => {
              return (
                <div className={cn("flex flex-wrap gap-4 py-[6px]")}>
                  {imgUrl ? (
                    <DeclarationImageBox src={imgUrl as string} />
                  ) : (
                    "-"
                  )}
                </div>
              );
            }}
          />
          <CommonForm.Readonly
            name={"description"}
            label={"신고사유"}
            value={form.watch("description")}
          />
          <CommonForm.SelectBox
            name={"status"}
            label={"처리상태"}
            defaultValue={"처리완료"}
            options={STATUS_TYPE_OPTIONS}
          />
          <CommonForm.Textarea
            name={"memo"}
            label={"메모"}
            value={form.watch("memo") || ""}
          />
        </FormGroup>
        <div className={cn("mt-[20px]")}>
          <Button type={"submit"} variant={"default"} className={cn("w-full")}>
            확인
          </Button>
        </div>
      </form>
    </Form>
  );
}
