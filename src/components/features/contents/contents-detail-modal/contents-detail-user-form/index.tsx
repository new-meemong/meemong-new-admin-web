"use client";

import { useForm } from "react-hook-form";
import React, { useEffect, useMemo } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CommonForm } from "@/components/shared/common-form";
import { LOGIN_TYPE_MAP, USER_TYPE_MAP } from "@/constants/users";
import { formatDate } from "@/utils/date";
import { IUserForm, LoginType, UserRoleType } from "@/models/users";

interface ContentsDetailUserFormProps {
  formData: IUserForm;
}

export default function ContentsDetailUserForm({
  formData,
}: ContentsDetailUserFormProps) {
  const formSchema = z.object({
    id: z.string(),
    role: z.number(),
    displayName: z.string(),
    name: z.string(),
    loginType: z.string(),
    createdAt: z.string(),
    recentLoginTime: z.string(),
    profileUrl: z.string(),
    isWithdraw: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      role: undefined,
      displayName: "",
      name: "",
      loginType: "",
      createdAt: "",
      recentLoginTime: "",
      isWithdraw: undefined,
    },
  });

  const userId: string = useMemo(() => {
    let _userId: string = String(form.watch("id"));
    if (form.watch("role") === 1) {
      _userId = `M-${form.watch("id")}`;
    } else if (form.watch("role") === 2) {
      _userId = `D-${form.watch("id")}`;
    }

    return _userId;
  }, [form.watch("role"), form.watch("id")]);

  useEffect(() => {
    if (formData) {
      form.reset({
        ...formData,
        id: String(formData.id),
        role: Number(formData.role),
        isWithdraw: Boolean(formData.isWithdraw),
      });
    }
  }, [formData]);

  if (!formData) {
    return "...loading";
  }

  return (
    <FormGroup title={"기본 정보"}>
      <CommonForm.ReadonlyRow label={"회원번호"} value={userId} />
      <CommonForm.ReadonlyRow<UserRoleType>
        label={"유형"}
        value={form.watch("role") as UserRoleType}
        formatter={(v) => {
          return USER_TYPE_MAP[v as UserRoleType] ?? "-";
        }}
      />
      <CommonForm.ReadonlyRow
        label={"닉네임"}
        value={form.watch("displayName")}
      />
      <CommonForm.ReadonlyRow label={"이름"} value={form.watch("name")} />
      <CommonForm.ReadonlyRow
        label={"가입형태"}
        value={form.watch("loginType")}
        formatter={(v) => {
          return LOGIN_TYPE_MAP[v as LoginType] || "-";
        }}
      />
      <CommonForm.ReadonlyRow
        label={"가입일"}
        value={form.watch("createdAt")}
        formatter={(v) => {
          return v ? formatDate(v as string) : "-";
        }}
      />
      <CommonForm.ReadonlyRow
        label={"최근 로그인"}
        value={form.watch("recentLoginTime")}
        formatter={(v) => {
          return v ? formatDate(v as string) : "-";
        }}
      />
      <CommonForm.ReadonlyRow
        label={"탈퇴여부"}
        value={form.watch("isWithdraw")}
        formatter={(v) => {
          if (typeof v === "undefined") {
            return "-";
          }
          return v ? "Y" : "N";
        }}
      />
    </FormGroup>
  );
}
