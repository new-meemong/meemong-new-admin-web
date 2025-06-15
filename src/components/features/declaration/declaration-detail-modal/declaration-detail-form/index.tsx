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
    value: DeclarationStatusType;
    label: string;
  }[] = [
    { value: "0", label: "미확인" },
    { value: "1", label: "확인" },
    { value: "2", label: "대기" },
    { value: "3", label: "처리완료" },
  ];

  const formSchema = z.object({
    reporter: z.string(),
    reporterName: z.string(),
    reporterUid: z.string(),
    respondent: z.string(),
    respondentName: z.string(),
    respondentUid: z.string(),
    content: z.string(),
    location: z.string(),
    declarationImageUrlList: z.array(z.string()),
    status: z.string(),
    memo: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reporter: "",
      reporterName: "",
      reporterUid: "",
      respondent: "",
      respondentName: "",
      respondentUid: "",
      content: "",
      location: "",
      declarationImageUrlList: [],
      status: "",
      memo: "",
    },
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
            name={"location"}
            label={"신고위치"}
            value={form.watch("location")}
          />
          <CommonForm.Readonly
            name={"declarationImageUrlList"}
            label={"신고 이미지"}
            value={form.watch("declarationImageUrlList")}
            formatter={(urlList) => {
              return (
                <div className={cn("flex flex-wrap gap-4 py-[6px]")}>
                  {urlList && Array.isArray(urlList)
                    ? urlList.map((urlItem, index) => (
                        <DeclarationImageBox
                          key={`declaration-url-${index}`}
                          src={urlItem as string}
                          width={100}
                          height={100}

                        />
                      ))
                    : ""}
                </div>
              );
            }}
          />
          <CommonForm.SelectBox
            name={"status"}
            label={"처리상태"}
            options={STATUS_TYPE_OPTIONS}
          />
          <CommonForm.Textarea
            name={"memo"}
            label={"메모"}
            value={form.watch("memo")}
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
