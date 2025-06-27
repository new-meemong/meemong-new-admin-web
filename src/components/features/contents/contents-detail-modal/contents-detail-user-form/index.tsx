"use client";

import { useForm } from "react-hook-form";
import React, { useEffect } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CommonForm } from "@/components/shared/common-form";
import { JOIN_TYPE_MAP, USER_TYPE_MAP } from "@/constants/user";
import { formatDate } from "@/utils/date";
import { IUserForm, JoinType, UserRoleType } from "@/models/user";

interface ContentsDetailUserFormProps {
  formData: IUserForm;
}

export default function ContentsDetailUserForm({
  formData,
}: ContentsDetailUserFormProps) {
  const formSchema = z.object({
    userNumber: z.string(),
    role: z.number(),
    nickname: z.string(),
    name: z.string(),
    joinType: z.string(),
    createdAt: z.string(),
    recentLoggedInAt: z.string(),
    profileUrl: z.string(),
    isWithdraw: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userNumber: "",
      role: undefined,
      nickname: "",
      name: "",
      joinType: "",
      createdAt: "",
      recentLoggedInAt: "",
      isWithdraw: undefined,
    },
  });

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
    <FormGroup title={"기본 정보"}>
      <CommonForm.ReadonlyRow
        label={"회원번호"}
        value={form.watch("userNumber")}
      />
      <CommonForm.ReadonlyRow<UserRoleType>
        label={"유형"}
        value={form.watch("role") as UserRoleType}
        formatter={(v) => {
          return USER_TYPE_MAP[v as UserRoleType] ?? "-";
        }}
      />
      <CommonForm.ReadonlyRow label={"닉네임"} value={form.watch("nickname")} />
      <CommonForm.ReadonlyRow label={"이름"} value={form.watch("name")} />
      <CommonForm.ReadonlyRow
        label={"가입형태"}
        value={form.watch("joinType")}
        formatter={(v) => {
          return JOIN_TYPE_MAP[v as JoinType];
        }}
      />
      <CommonForm.ReadonlyRow
        label={"가입일"}
        value={form.watch("createdAt")}
        formatter={(v) => {
          return v ? formatDate(v as string) : "";
        }}
      />
      <CommonForm.ReadonlyRow
        label={"최근 로그인"}
        value={form.watch("recentLoggedInAt")}
        formatter={(v) => {
          return v ? formatDate(v as string) : "";
        }}
      />
      <CommonForm.ReadonlyRow
        label={"탈퇴여부"}
        value={form.watch("isWithdraw")}
        formatter={(v) => {
          if (typeof v === "undefined") {
            return "";
          }
          return v ? "Y" : "N";
        }}
      />
    </FormGroup>
  );
}
