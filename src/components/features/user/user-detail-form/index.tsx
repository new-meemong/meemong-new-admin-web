"use client";

import { MongMoneyHistoryType } from "@/apis/mongMoneys";
import { IUserForm, LoginType, UserRoleType } from "@/models/users";
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useDeleteUserPhotoMutation,
  useUpdateUserMutation,
} from "@/queries/users";

import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { Form } from "@/components/ui/form";
import { FormGroup } from "@/components/ui/form-group";
import ImageBox from "@/components/shared/image-box";
import { ImageSwiperItem } from "@/components/shared/image-swiper";
import { LOGIN_TYPE_MAP } from "@/constants/users";
import UserBlockInfoList from "@/components/features/user/user-block-info-list";
import UserMongMoneyDepositForm from "@/components/features/user/user-mong-money-deposit-form";
import UserMongMoneyHistory from "@/components/features/user/user-mong-money-history";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { getUserRole } from "@/utils/user";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const USER_PHOTO_PREVIEW_LIMIT = 10;

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
  const [mongHistoryType, setMongHistoryType] =
    useState<MongMoneyHistoryType>("purchase");
  const [photosExpanded, setPhotosExpanded] = useState(false);

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
        id: z.union([z.number(), z.string()]),
        s3Path: z.string().nullable(),
        fileType: z.string().nullable(),
        source: z.enum(["UserFiles", "BeautyApplicationImages", "Users"]),
        sourceId: z.number().optional(),
        beautyApplicationId: z.number().optional(),
        deleteUrl: z.string(),
      }),
    ),
    phone: z.string(),
    email: z.string(),
    paymodel: z.string(),
    description: z.string(),
    storeReservationNotice: z.string(),
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
      storeReservationNotice: "",
    },
  });

  const updateUserMutation = useUpdateUserMutation();
  const deleteUserPhotoMutation = useDeleteUserPhotoMutation(formData.id);

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
      if (updateUserMutation.isPending) return;
      const prevYN = form.getValues("paymodel");
      const prev = prevYN === "Y";

      form.setValue("paymodel", next ? "Y" : "N", { shouldDirty: true });

      try {
        await updateUserMutation.mutateAsync({
          userId: form.getValues("id"),
          modelInfo: { paymodel: next },
        });
        form.resetField("paymodel", { defaultValue: next ? "Y" : "N" });
        toast.success(
          next ? "추천모델로 추가했습니다." : "추천모델에서 제외됐습니다.",
        );
        onRefresh();
      } catch (error) {
        console.error(error);
        form.setValue("paymodel", prev ? "Y" : "N", { shouldDirty: true });
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [form, onRefresh, updateUserMutation],
  );

  const userImages: ImageSwiperItem[] = useMemo(
    () =>
      (formData.userPhotos ?? []).flatMap((photo) =>
        photo.s3Path
          ? [
              {
                id: photo.id,
                src: photo.s3Path,
                title: photo.fileType ?? undefined,
                deleteUrl: photo.deleteUrl,
                deletable: Boolean(photo.deleteUrl),
              },
            ]
          : [],
      ),
    [formData.userPhotos],
  );
  const profileImageIndex = userImages.findIndex(
    (image) => image.src === formData.profilePictureURL,
  );

  const handleDeleteUserImage = useCallback(
    async (image: ImageSwiperItem) => {
      if (!image.deleteUrl) {
        window.alert("삭제할 수 없는 이미지입니다.");
        return false;
      }
      if (!window.confirm("해당 사진을 삭제하시겠습니까?")) return false;

      try {
        const result = await deleteUserPhotoMutation.mutateAsync(
          image.deleteUrl,
        );
        if (result.refreshFailed) {
          toast.warning(
            "사진 삭제는 처리됐지만 화면을 갱신하지 못했습니다. 다시 조회해주세요.",
          );
        } else if (result.alreadyDeleted) {
          toast.info("이미 삭제된 사진입니다. 목록을 갱신했습니다.");
        } else {
          toast.success("사진을 삭제했습니다.");
        }
        return true;
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
        return false;
      }
    },
    [deleteUserPhotoMutation],
  );

  const handleUpdateDesignerText = async (
    field: "description" | "storeReservationNotice",
  ) => {
    const value = form.getValues(field);
    try {
      await updateUserMutation.mutateAsync({
        userId: form.getValues("id"),
        designerInfo: { [field]: value },
      });
      form.resetField(field, { defaultValue: value });
      toast.success(
        field === "description"
          ? "소개글을 수정했습니다."
          : "예약 방법 안내를 수정했습니다.",
      );
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error(
        "저장하지 못했습니다. 회원 정보와 수정 권한을 확인하고 다시 시도해주세요.",
      );
    }
  };

  const handleUpdateDisplayName = useCallback(async () => {
    if (!form.getValues("displayName").trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }
    try {
      await updateUserMutation.mutateAsync({
        userId: form.getValues("id"),
        displayName: form.getValues("displayName"),
      });

      form.resetField("displayName", {
        defaultValue: form.getValues("displayName"),
      });
      toast.success("닉네임을 수정했습니다.");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [form, onRefresh, updateUserMutation]);

  useEffect(() => {
    if (formData) {
      form.reset(
        {
          ...formData,
          address:
            ("modelInfo" in formData || "designerInfo" in formData
              ? (formData.modelInfo?.address ?? formData.designerInfo?.address)
              : formData.address) ?? "",
          description:
            ("designerInfo" in formData
              ? formData.designerInfo?.description
              : formData.description) ?? "",
          storeReservationNotice:
            formData.designerInfo?.storeReservationNotice ?? "",
          paymodel:
            ("modelInfo" in formData
              ? formData.modelInfo?.paymodel
              : (formData as IUserForm & { paymodel?: string }).paymodel) ?? "",
          recentLoginTime: formData.recentLoginTime ?? undefined,
          recentRealLoginTime: formData.recentRealLoginTime ?? undefined,
        },
        { keepDirtyValues: true },
      );
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
            disabled={updateUserMutation.isPending}
            name={"displayName"}
            inputClassName={cn("min-w-0")}
          >
            <div className={cn("ml-2")}>
              <Button
                variant={"outline"}
                type={"button"}
                disabled={updateUserMutation.isPending}
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
            value={formData.profilePictureURL}
            formatter={(v) => {
              return v ? (
                <ImageBox
                  src={v as string}
                  images={
                    profileImageIndex >= 0
                      ? userImages
                      : [{ src: v as string, deletable: false }]
                  }
                  index={Math.max(profileImageIndex, 0)}
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
          {(form.watch("role") === 1 || form.watch("role") === 3) && (
            <CommonForm.CheckBox
              label={"추천모델"}
              checked={form.watch("paymodel") === "Y"}
              disabled={updateUserMutation.isPending}
              onChange={updateUserPayModel}
              name={"paymodel"}
              checkboxLabel={form.watch("paymodel") === "Y" ? "ON" : "OFF"}
            />
          )}
          {(form.watch("role") === 2 || form.watch("role") === 4) && (
            <>
              <CommonForm.TextAreaRow
                label={"소개글"}
                value={form.watch("description") || ""}
                disabled={updateUserMutation.isPending}
                name={"description"}
                textareaClassName={cn("min-h-[192px]")}
              >
                <div className={cn("ml-2")}>
                  <Button
                    variant={"outline"}
                    type={"button"}
                    disabled={updateUserMutation.isPending}
                    onClick={() => void handleUpdateDesignerText("description")}
                  >
                    수정
                  </Button>
                </div>
              </CommonForm.TextAreaRow>
              <CommonForm.TextAreaRow
                label="예약 방법 안내"
                disabled={updateUserMutation.isPending}
                name="storeReservationNotice"
                value={form.watch("storeReservationNotice") || ""}
                textareaClassName="min-h-[192px]"
              >
                <div className="ml-2">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={updateUserMutation.isPending}
                    onClick={() =>
                      void handleUpdateDesignerText("storeReservationNotice")
                    }
                  >
                    수정
                  </Button>
                </div>
              </CommonForm.TextAreaRow>
            </>
          )}
        </FormGroup>
        <FormGroup title={"사진 정보"}>
          <CommonForm.ReadonlyRow<ImageSwiperItem[]>
            label={"사진"}
            value={userImages}
            formatter={(images) => (
              <div className={cn("flex flex-wrap gap-4")}>
                {images?.length
                  ? images
                      .slice(
                        0,
                        photosExpanded
                          ? images.length
                          : USER_PHOTO_PREVIEW_LIMIT,
                      )
                      .map((image, index) => (
                        <ImageBox
                          key={image.id}
                          src={image.src}
                          title={image.title}
                          images={userImages}
                          index={index}
                          onDeleteImage={handleDeleteUserImage}
                        />
                      ))
                  : "-"}
                {images && images.length > USER_PHOTO_PREVIEW_LIMIT && (
                  <div className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-expanded={photosExpanded}
                      onClick={() => setPhotosExpanded((expanded) => !expanded)}
                    >
                      {photosExpanded
                        ? "접기"
                        : `전체 ${images.length}개 펼치기`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          />
        </FormGroup>
        <FormGroup title={"이용 정지 정보"}>
          <UserBlockInfoList user={formData} onUpdate={onRefresh} />
        </FormGroup>
        <FormGroup title={"몽 지급"}>
          <UserMongMoneyDepositForm
            user={formData}
            onUpdate={onRefresh}
            onDeposited={() => setMongHistoryType("reward")}
          />
        </FormGroup>
        <UserMongMoneyHistory
          userId={formData.id}
          type={mongHistoryType}
          onTypeChange={setMongHistoryType}
        />
      </form>
    </Form>
  );
}
