"use client";

import { useForm } from "react-hook-form";
import { FormEvent, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import {
  IUserForm,
  JoinType,
  UserPhotoType,
  UserRoleType,
} from "@/models/users";
import { CommonForm } from "@/components/shared/common-form";
import { JOIN_TYPE_MAP, USER_TYPE_MAP } from "@/constants/users";
import UserImageBox from "@/components/features/user/user-image-box";
import { formatDate } from "@/utils/date";
import UserBlockInfoList from "@/components/features/user/user-right-drawer/user-block-info-list";

interface UserDetailFormProps {
  formData: IUserForm;
  onSubmit: (event: FormEvent) => void;
}

export default function UserDetailForm({
  formData,
  onSubmit,
}: UserDetailFormProps) {
  const formSchema = z.object({
    id: z.number(),
    role: z.number(),
    displayName: z.string(),
    name: z.string(),
    joinType: z.string(),
    createdAt: z.string(),
    recentLoginTime: z.string(),
    profilePictureURL: z.string(),
    isWithdraw: z.boolean(),
    userPhotos: z.array(
      z.object({
        id: z.number(),
        s3Path: z.string(),
        fileType: z.string(),
      }),
    ),
    phone: z.string(),
    email: z.string(),
    description: z.string(),
    isBlocked: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: undefined,
      role: undefined,
      displayName: "",
      name: "",
      joinType: "",
      createdAt: "",
      recentLoginTime: "",
      isWithdraw: undefined,
      userPhotos: [],
      phone: "",
      email: "",
      description: "",
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
      });
    }
  }, [formData, form]);

  if (!formData) {
    return "...loading";
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
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
            value={form.watch("displayName") || "-"}
          />
          <CommonForm.ReadonlyRow
            label={"이름"}
            value={form.watch("name") || "-"}
          />
          <CommonForm.ReadonlyRow
            label={"가입형태"}
            value={form.watch("joinType")}
            formatter={(v) => {
              return JOIN_TYPE_MAP[v as JoinType] || "-";
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
        <FormGroup title={"프로필 정보"}>
          <CommonForm.ReadonlyRow
            label={"프로필 이미지"}
            value={form.watch("profilePictureURL")}
            formatter={(v) => {
              return v ? <UserImageBox src={v as string} /> : "-";
            }}
          />
          <CommonForm.ReadonlyRow
            label={"휴대폰 번호"}
            value={form.watch("phone") || "-"}
          />
          <CommonForm.ReadonlyRow
            label={"이메일"}
            value={form.watch("email") || "-"}
          />
          <CommonForm.ReadonlyRow
            label={"소개글"}
            value={form.watch("description") || "-"}
          />
        </FormGroup>
        <FormGroup title={"사진 정보"}>
          <CommonForm.ReadonlyRow<UserPhotoType[]>
            label={"사진"}
            value={form.watch("userPhotos")}
            formatter={(userPhotos) => {
              return (
                <div className={cn("flex flex-wrap gap-4 py-[6px]")}>
                  {userPhotos && Array.isArray(userPhotos)
                    ? userPhotos.map((userPhoto) => (
                        <UserImageBox
                          key={`picture-url-${userPhoto.id}`}
                          src={userPhoto.s3Path as string}
                          title={userPhoto.fileType}
                        />
                      ))
                    : "-"}
                </div>
              );
            }}
          />
        </FormGroup>
        <FormGroup title={"차단 정보"}>
          <UserBlockInfoList
            user={formData}
            isBlocked={form.watch("isBlocked")}
          />
        </FormGroup>
      </form>
    </Form>
  );
}
