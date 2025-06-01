"use client";

import { useForm } from "react-hook-form";
import { FormEvent, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { IUserForm, JoinType, UserType } from "@/models/user";
import { CommonForm } from "@/components/shared/common-form";
import { JOIN_TYPE_MAP, USER_TYPE_MAP } from "@/constants/user";
import UserImageBox from "@/components/features/user/user-image-box";
import { formatDate } from "@/utils/date";
import UserBlockInfoList from "@/components/features/user/user-detail-modal/user-block-info-list";

interface UserDetailModalProps {
  formData: IUserForm;
  onSubmit: (event: FormEvent) => void;
}

export default function UserDetailForm({
  formData,
  onSubmit,
}: UserDetailModalProps) {
  const formSchema = z.object({
    userNumber: z.string(),
    userType: z.string(),
    nickname: z.string(),
    name: z.string(),
    joinType: z.string(),
    createdAt: z.string(),
    recentLoggedInAt: z.string(),
    profileUrl: z.string(),
    isWithdraw: z.boolean(),
    pictureUrlList: z.array(
      z.object({
        src: z.string(),
        title: z.string(),
      }),
    ),
    phoneNumber: z.string(),
    email: z.string(),
    intro: z.string(),
    isBlocked: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userNumber: "",
      userType: "",
      nickname: "",
      name: "",
      joinType: "",
      createdAt: "",
      recentLoggedInAt: "",
      isWithdraw: undefined,
      pictureUrlList: [],
      phoneNumber: "",
      email: "",
      intro: "",
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
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <FormGroup title={"기본 정보"}>
          <CommonForm.Readonly
            name={"userNumber"}
            label={"회원번호"}
            value={form.watch("userNumber")}
          />
          <CommonForm.Readonly
            name={"userType"}
            label={"유형"}
            value={form.watch("userType")}
            formatter={(v) => {
              return USER_TYPE_MAP[v as UserType] ?? "-";
            }}
          />
          <CommonForm.Readonly
            name={"nickname"}
            label={"닉네임"}
            value={form.watch("nickname")}
          />
          <CommonForm.Readonly
            name={"name"}
            label={"이름"}
            value={form.watch("name")}
          />
          <CommonForm.Readonly
            name={"joinType"}
            label={"가입형태"}
            value={form.watch("joinType")}
            formatter={(v) => {
              return JOIN_TYPE_MAP[v as JoinType];
            }}
          />
          <CommonForm.Readonly
            name={"createdAt"}
            label={"가입일"}
            value={form.watch("createdAt")}
            formatter={(v) => {
              return v ? formatDate(v as string) : "";
            }}
          />
          <CommonForm.Readonly
            name={"recentLoggedInAt"}
            label={"최근 로그인"}
            value={form.watch("recentLoggedInAt")}
            formatter={(v) => {
              return v ? formatDate(v as string) : "";
            }}
          />
          <CommonForm.Readonly
            name={"isWithdraw"}
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
        <FormGroup title={"프로필 정보"}>
          <CommonForm.Readonly
            name={"profileUrl"}
            label={"프로필 이미지"}
            value={form.watch("profileUrl")}
            formatter={(v) => {
              return v ? <UserImageBox src={v as string} size={64} /> : "";
            }}
          />
          <CommonForm.Readonly
            name={"phoneNumber"}
            label={"휴대폰 번호"}
            value={form.watch("phoneNumber")}
          />
          <CommonForm.Readonly
            name={"email"}
            label={"이메일"}
            value={form.watch("email")}
          />
          <CommonForm.Readonly
            name={"intro"}
            label={"소개글"}
            value={form.watch("intro")}
          />
        </FormGroup>
        <FormGroup title={"사진 정보"}>
          <div className={cn("flex flex-wrap gap-4 py-[6px]")}>
            {(form.watch("pictureUrlList") || []).map((picture, index) => (
              <UserImageBox
                key={`picture-url-${index}`}
                src={picture.src}
                title={picture.title}
                size={64}
              />
            ))}
          </div>
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
