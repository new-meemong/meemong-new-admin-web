"use client";

import { useForm } from "react-hook-form";
import React, { FormEvent, useCallback, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import {
  IUserForm,
  LoginType,
  UserPhotoType,
  UserRoleType,
} from "@/models/users";
import { CommonForm } from "@/components/shared/common-form";
import { LOGIN_TYPE_MAP } from "@/constants/users";
import ImageBox from "@/components/shared/image-box";
import { formatDate } from "@/utils/date";
import UserBlockInfoList from "@/components/features/user/user-right-drawer/user-block-info-list";
import {
  useUpdateUserDescriptionMutation,
  useUpdateUserPayModelMutation,
} from "@/queries/users";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { getUserRole } from "@/utils/user";

interface UserDetailFormProps {
  formData: IUserForm;
  onSubmit: (event: FormEvent) => void;
  onRefresh: () => void;
}

export default function UserDetailForm({
  formData,
  onSubmit,
  onRefresh,
}: UserDetailFormProps) {
  const formSchema = z.object({
    id: z.number(),
    role: z.number(),
    displayName: z.string(),
    name: z.string(),
    address: z.string(),
    loginType: z.string(),
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
    paymodel: z.string(),
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
      address: "",
      loginType: "",
      createdAt: "",
      recentLoginTime: "",
      isWithdraw: undefined,
      userPhotos: [],
      phone: "",
      email: "",
      description: "",
    },
  });

  const updateUserDescriptionMutation = useUpdateUserDescriptionMutation();
  const updateUserPayModelMutation = useUpdateUserPayModelMutation();

  const userId: string = useMemo(() => {
    let _userId: string = String(form.watch("id"));
    if (getUserRole(form.watch("role") as UserRoleType) === "MODEL") {
      _userId = `M-${form.watch("id")}`;
    } else if (getUserRole(form.watch("role") as UserRoleType) === "DESIGNER") {
      _userId = `D-${form.watch("id")}`;
    }

    return _userId;
  }, [form.watch("role"), form.watch("id")]);

  const updateUserPayModel = useCallback(
    async (next: boolean) => {
      const prevYN = form.getValues("paymodel");
      const prev = prevYN === "Y";

      form.setValue("paymodel", next ? "Y" : "N", { shouldDirty: true });

      try {
        const res = await updateUserPayModelMutation.mutateAsync({
          userId: form.getValues("id"),
          paymodel: next,
        });

        if (typeof res?.paymodel === "boolean") {
          if (res.paymodel) {
            toast.success("추천모델로 추가했습니다.");
          } else {
            toast.success("추천모델에서 제외됐습니다.");
          }
          form.setValue("paymodel", res.paymodel ? "Y" : "N", {
            shouldDirty: true,
          });
        }
      } catch (error) {
        console.error(error);
        form.setValue("paymodel", prev ? "Y" : "N", { shouldDirty: true });
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [form.watch("id")],
  );

  const userImages: { src: string; title?: string }[] = useMemo(() => {
    const _userImages: { src: string; title?: string }[] = [];

    if (form.watch("profilePictureURL")) {
      _userImages.push({
        src: form.watch("profilePictureURL"),
        title: "프로필 이미지",
      });
    }

    if (Array.isArray(form.watch("userPhotos"))) {
      form.watch("userPhotos").forEach((userPhoto) => {
        _userImages.push({
          src: userPhoto.s3Path as string,
          title: userPhoto.fileType,
        });
      });
    }
    return _userImages;
  }, [form.watch("profilePictureURL"), form.watch("userPhotos")]);

  const handleUpdateDescription = useCallback(async () => {
    try {
      const res = await updateUserDescriptionMutation.mutateAsync({
        userId: form.getValues("id"),
        description: form.getValues("description"),
      });

      if (res.description) {
        toast.success("소개글을 수정했습니다.");
      } else {
        throw new Error();
      }
      form.setValue("description", res.description, {
        shouldDirty: true,
      });
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [form.getValues("id"), form.getValues("description")]);

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
              return getUserRole(v as UserRoleType) === "MODEL"
                ? "모델"
                : getUserRole(v as UserRoleType) === "DESIGNER"
                  ? "디자이너"
                  : "-";
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
            label={"지역"}
            value={form.watch("address") || "-"}
          />
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
        <FormGroup title={"프로필 정보"}>
          <CommonForm.ReadonlyRow
            label={"프로필 이미지"}
            value={form.watch("profilePictureURL")}
            formatter={(v) => {
              return v ? (
                <ImageBox src={v as string} images={userImages} index={0} />
              ) : (
                "-"
              );
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
          {form.watch("role") === 1 && (
            <CommonForm.CheckBox
              label={"추천모델"}
              checked={form.watch("paymodel") === "Y"}
              onChange={updateUserPayModel}
              name={"paymodel"}
              checkboxLabel={form.watch("paymodel") === "Y" ? "ON" : "OFF"}
            />
          )}
          {form.watch("role") === 2 && (
            <CommonForm.TextAreaRow
              label={"소개글"}
              value={form.watch("description") || ""}
              name={"description"}
            >
              <div className={cn("ml-2")}>
                <Button
                  variant={"outline"}
                  type={"button"}
                  onClick={handleUpdateDescription}
                >
                  수정
                </Button>
              </div>
            </CommonForm.TextAreaRow>
          )}
        </FormGroup>
        <FormGroup title={"사진 정보"}>
          <CommonForm.ReadonlyRow<UserPhotoType[]>
            label={"사진"}
            value={form.watch("userPhotos")}
            formatter={(userPhotos) => {
              return (
                <div className={cn("flex flex-wrap gap-4")}>
                  {userPhotos &&
                  Array.isArray(userPhotos) &&
                  userPhotos.length > 0
                    ? userPhotos.map((userPhoto, index) => (
                        <ImageBox
                          key={`picture-url-${userPhoto.id}`}
                          src={userPhoto.s3Path as string}
                          title={userPhoto.fileType}
                          images={userImages}
                          index={
                            index + (form.watch("profilePictureURL") ? 1 : 0)
                          }
                        />
                      ))
                    : "-"}
                </div>
              );
            }}
          />
        </FormGroup>
        <FormGroup title={"차단 정보"}>
          <UserBlockInfoList user={formData} onUpdate={onRefresh} />
        </FormGroup>
      </form>
    </Form>
  );
}
