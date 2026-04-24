"use client";

import {
  IUserForm,
  LoginType,
  UserPhotoType,
  UserRoleType,
} from "@/models/users";
import React, { FormEvent, useCallback, useEffect, useMemo } from "react";
import {
  useUpdateUserDescriptionMutation,
  useUpdateUserDisplayNameMutation,
  useUpdateUserPayModelMutation,
} from "@/queries/users";

import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { Form } from "@/components/ui/form";
import { FormGroup } from "@/components/ui/form-group";
import ImageBox from "@/components/shared/image-box";
import { ImageSwiperItem } from "@/components/shared/image-swiper";
import { LOGIN_TYPE_MAP } from "@/constants/users";
import UserBlockInfoList from "@/components/features/user/user-right-drawer/user-block-info-list";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { getUserRole } from "@/utils/user";
import { toast } from "react-toastify";
import { useDeleteUserFileMutation } from "@/queries/userFiles";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
    recentLoginTime: z.string().nullable().optional(),
    recentRealLoginTime: z.string().nullable().optional(),
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
  const updateUserDisplayNameMutation = useUpdateUserDisplayNameMutation();
  const deleteUserFileMutation = useDeleteUserFileMutation();

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

  const userImages: ImageSwiperItem[] = useMemo(() => {
    const _userImages: ImageSwiperItem[] = [];
    const profilePictureURL = form.watch("profilePictureURL");
    const userPhotos = form.watch("userPhotos");

    const profilePhoto = Array.isArray(userPhotos)
      ? userPhotos.find((userPhoto) => userPhoto.s3Path === profilePictureURL)
      : undefined;

    if (profilePictureURL) {
      _userImages.push({
        id: profilePhoto?.id,
        src: profilePictureURL,
        title: "프로필 이미지",
        deletable: Boolean(profilePhoto?.id),
      });
    }

    if (Array.isArray(userPhotos)) {
      userPhotos.forEach((userPhoto) => {
        _userImages.push({
          id: userPhoto.id,
          src: userPhoto.s3Path as string,
          title: userPhoto.fileType,
          deletable: true,
        });
      });
    }
    return _userImages;
  }, [form.watch("profilePictureURL"), form.watch("userPhotos")]);

  const handleDeleteUserImage = useCallback(
    async (image: ImageSwiperItem) => {
      if (!image.id) {
        window.alert("삭제할 수 없는 이미지입니다.");
        return false;
      }

      try {
        const confirmed = window.confirm("해당 사진을 삭제하시겠습니까?");
        if (!confirmed) return false;

        await deleteUserFileMutation.mutateAsync(image.id);
        toast.success("사진을 삭제했습니다.");

        const nextUserPhotos = (form.getValues("userPhotos") || []).filter(
          (userPhoto) => userPhoto.id !== image.id,
        );
        form.setValue("userPhotos", nextUserPhotos, { shouldDirty: true });

        if (form.getValues("profilePictureURL") === image.src) {
          form.setValue("profilePictureURL", "", { shouldDirty: true });
        }
        return true;
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
        return false;
      }
    },
    [deleteUserFileMutation, form],
  );

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

  const handleUpdateDisplayName = useCallback(async () => {
    try {
      await updateUserDisplayNameMutation.mutateAsync({
        userId: form.getValues("id"),
        displayName: form.getValues("displayName"),
      });

      toast.success("닉네임을 수정했습니다.");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [form.getValues("id"), form.getValues("displayName"), onRefresh]);

  useEffect(() => {
    if (formData) {
      form.reset({
        ...formData,
        recentLoginTime: formData.recentLoginTime ?? undefined,
        recentRealLoginTime: formData.recentRealLoginTime ?? undefined,
      });
    }
  }, [formData, form]);

  if (!formData) {
    return "...loading";
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className={cn("pb-[200px]")}>
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
          <CommonForm.InputRow
            label={"닉네임"}
            name={"displayName"}
            inputClassName={cn("min-w-0")}
          >
            <div className={cn("ml-2")}>
              <Button
                variant={"outline"}
                type={"button"}
                onClick={handleUpdateDisplayName}
              >
                수정
              </Button>
            </div>
          </CommonForm.InputRow>
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
                <ImageBox
                  src={v as string}
                  images={userImages}
                  index={0}
                  onDeleteImage={handleDeleteUserImage}
                />
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
              textareaClassName={cn("min-h-[192px]")}
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
                          onDeleteImage={handleDeleteUserImage}
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
        <FormGroup title={"이용 정지 정보"}>
          <UserBlockInfoList user={formData} onUpdate={onRefresh} />
        </FormGroup>
      </form>
    </Form>
  );
}
