"use client";

import { ITimeSaleMenu, ITimeSaleMenuUserInfo } from "@/models/timeSaleMenus";
import React, { useCallback, useEffect } from "react";
import {
  useDeleteTimeSaleMenuMutation,
  useGetTimeSaleMenuByIdQuery,
  usePutTimeSaleMenuMutation,
  timeSaleMenusQueryKeys,
} from "@/queries/timeSaleMenus";
import { ChevronRight } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { CommonFormButtonBox } from "@/components/shared/common-form/common-form-button-box";
import { CONTENTS_CATEGORY_MAP } from "@/constants/contents";
import { FormGroup } from "@/components/ui/form-group";
import ImageBox from "@/components/shared/image-box";
import { ImageSwiperItem } from "@/components/shared/image-swiper";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { formatDate } from "@/utils/date";
import { parseImageUrl } from "@/utils/image";
import { formatPrice } from "@/utils/price";
import { formatReservationTime } from "@/utils/timeSaleMenus";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

function isHttpUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "제목을 입력해주세요.")
    .max(255, "제목은 255자 이하로 입력해주세요."),
  description: z.string(),
  naverReservationNotice: z.string(),
  naverReservationUrl: z
    .string()
    .trim()
    .refine(isHttpUrl, "http 또는 https 링크를 입력해주세요."),
});

type TimeSaleMenuForm = z.infer<typeof schema>;

function getTimeSaleMenuFormValues(
  timeSaleMenu: ITimeSaleMenu,
): TimeSaleMenuForm {
  return {
    name: timeSaleMenu.name,
    description: timeSaleMenu.description ?? "",
    naverReservationNotice: timeSaleMenu.naverReservationNotice ?? "",
    naverReservationUrl: timeSaleMenu.naverReservationUrl ?? "",
  };
}

interface TimeSaleMenuDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeSaleMenu: ITimeSaleMenu;
  onRefresh: () => void;
}

export default function TimeSaleMenuDetailModal({
  isOpen,
  onClose,
  timeSaleMenu,
  onRefresh,
}: TimeSaleMenuDetailModalProps) {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const detailQuery = useGetTimeSaleMenuByIdQuery(timeSaleMenu.id, {
    enabled: isOpen,
  });
  const putMutation = usePutTimeSaleMenuMutation();
  const deleteMutation = useDeleteTimeSaleMenuMutation();
  const detail = detailQuery.data;
  const currentTimeSaleMenu = detail ?? timeSaleMenu;

  const form = useForm<TimeSaleMenuForm>({
    resolver: zodResolver(schema),
    defaultValues: getTimeSaleMenuFormValues(timeSaleMenu),
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    if (!detail || isDirty) return;

    form.reset(getTimeSaleMenuFormValues(detail));
  }, [detail, form, isDirty]);

  const handleUpdate = form.handleSubmit(async (values) => {
    try {
      const confirmed = await dialog.confirm(
        "해당 리뷰특가 메뉴를 수정하시겠습니까?",
      );
      if (!confirmed) return;

      const updatedTimeSaleMenu = await putMutation.mutateAsync({
        timeSaleMenuId: timeSaleMenu.id,
        name: values.name,
        description: values.description,
        naverReservationNotice: values.naverReservationNotice,
        naverReservationUrl: values.naverReservationUrl || null,
      });
      queryClient.setQueryData(
        timeSaleMenusQueryKeys.detail(timeSaleMenu.id),
        updatedTimeSaleMenu,
      );
      form.reset(getTimeSaleMenuFormValues(updatedTimeSaleMenu));
      toast.success("리뷰특가 메뉴를 수정했습니다.");
      void detailQuery.refetch();
      onRefresh();
    } catch {
      toast.error("잠시 후 다시 시도해주세요.");
    }
  });

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await dialog.confirm(
        "해당 리뷰특가 메뉴를 삭제하시겠습니까?",
      );
      if (!confirmed) return;

      await deleteMutation.mutateAsync(timeSaleMenu.id);
      queryClient.removeQueries({
        queryKey: timeSaleMenusQueryKeys.detail(timeSaleMenu.id),
        exact: true,
      });
      toast.success("리뷰특가 메뉴를 삭제했습니다.");
      onRefresh();
      onClose();
    } catch {
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [
    deleteMutation,
    dialog,
    onClose,
    onRefresh,
    queryClient,
    timeSaleMenu.id,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      closable
      onClose={onClose}
      onClickOutside={onClose}
    >
      <ModalHeader>
        콘텐츠 관리 <ChevronRight className="h-4 w-4" />{" "}
        {CONTENTS_CATEGORY_MAP["7"]} <ChevronRight className="h-4 w-4" />{" "}
        상세페이지
      </ModalHeader>

      <ModalBody className="flex flex-col overflow-hidden">
        <FormProvider {...form}>
          <form
            className="flex min-h-0 w-full flex-1 flex-col gap-6"
            onSubmit={handleUpdate}
            noValidate
          >
            <div className="flex min-h-0 w-full flex-1 flex-row gap-6">
              <section className="flex w-[28%] flex-shrink-0 flex-col gap-4 overflow-y-auto">
                <h3 className="typo-title-2-semibold text-foreground">
                  유저 정보
                </h3>
                <TimeSaleMenuUserInfoPanel
                  userInfo={currentTimeSaleMenu.userInfo}
                />
              </section>

              <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                <h3 className="flex-shrink-0 typo-title-2-semibold text-foreground">
                  리뷰특가 상세
                </h3>
                <FormGroup>
                  <CommonForm.Input<TimeSaleMenuForm>
                    name="name"
                    label="제목"
                    placeholder="제목을 입력해주세요."
                  />
                  <TimeSaleMenuReadOnlyPanel
                    timeSaleMenu={currentTimeSaleMenu}
                  />
                </FormGroup>
              </section>

              <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-6">
                <h3 className="flex-shrink-0 typo-title-2-semibold text-foreground">
                  본문내용
                </h3>
                <FormGroup>
                  <CommonForm.Textarea<TimeSaleMenuForm>
                    name="description"
                    label="본문내용"
                    placeholder="본문내용을 입력해주세요."
                    rows={14}
                    textareaClassName="min-h-[280px]"
                  />
                  <CommonForm.Textarea<TimeSaleMenuForm>
                    name="naverReservationNotice"
                    label="예약안내"
                    placeholder="예약 안내를 입력해주세요."
                    rows={5}
                    textareaClassName="min-h-[100px]"
                  />
                  <CommonForm.Input<TimeSaleMenuForm>
                    name="naverReservationUrl"
                    label="링크"
                    type="url"
                    placeholder="https://"
                  />
                </FormGroup>
              </section>
            </div>

            <div className="w-full flex-shrink-0 border-t border-border pb-[10px] pt-[10px]">
              <CommonFormButtonBox>
                <Button
                  type="submit"
                  variant="default"
                  size="submit-multi"
                  disabled={putMutation.isPending || deleteMutation.isPending}
                >
                  수정
                </Button>
                <Button
                  type="button"
                  variant="negative"
                  size="submit-multi"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending || putMutation.isPending}
                >
                  삭제
                </Button>
              </CommonFormButtonBox>
            </div>
          </form>
        </FormProvider>
      </ModalBody>
    </Modal>
  );
}

function TimeSaleMenuUserInfoPanel({
  userInfo,
}: {
  userInfo: ITimeSaleMenuUserInfo | null | undefined;
}) {
  if (!userInfo) {
    return (
      <p className="text-sm text-foreground-weak">유저 정보가 없습니다.</p>
    );
  }

  const memberNumber =
    userInfo.role === 1
      ? `M-${userInfo.userId}`
      : userInfo.role === 2
        ? `D-${userInfo.userId}`
        : String(userInfo.userId);

  return (
    <FormGroup>
      <CommonForm.ReadonlyRow label="회원번호" value={memberNumber} />
      <CommonForm.ReadonlyRow
        label="유형"
        value={
          userInfo.role === 1 ? "모델" : userInfo.role === 2 ? "디자이너" : "-"
        }
      />
      <CommonForm.ReadonlyRow label="닉네임" value={userInfo.displayName} />
      <CommonForm.ReadonlyRow label="연락처" value={userInfo.phone ?? "-"} />
      <CommonForm.ReadonlyRow label="이메일" value={userInfo.email ?? "-"} />
      <CommonForm.ReadonlyRow
        label="가입형태"
        value={formatLoginType(userInfo.loginType)}
      />
      <CommonForm.ReadonlyRow
        label="가입일"
        value={formatDate(userInfo.createdAt, "YYYY.MM.DD / HH:mm") ?? "-"}
      />
      <CommonForm.ReadonlyRow
        label="최근 로그인"
        value={
          formatDate(
            userInfo.lastLoginAt ?? userInfo.recentLoginTime ?? "",
            "YYYY.MM.DD / HH:mm",
          ) ?? "-"
        }
      />
      <CommonForm.ReadonlyRow
        label="탈퇴여부"
        value={userInfo.isDeleted ? "Y" : "N"}
      />
    </FormGroup>
  );
}

function TimeSaleMenuReadOnlyPanel({
  timeSaleMenu,
}: {
  timeSaleMenu: ITimeSaleMenu;
}) {
  const images: ImageSwiperItem[] = [...(timeSaleMenu.images ?? [])]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((image) => ({
      id: image.id,
      src: parseImageUrl(image.imageUrl),
    }));
  const displayImages: ImageSwiperItem[] =
    images.length > 0
      ? images
      : timeSaleMenu.thumbnailImageUrl
        ? [{ src: parseImageUrl(timeSaleMenu.thumbnailImageUrl) }]
        : [];
  const reservationSlots = timeSaleMenu.reservationSlots
    ?.map(
      (slot) =>
        `${slot.dayOfWeek} ${formatReservationTime(slot.startTime)}~${formatReservationTime(slot.endTime)}`,
    )
    .join(", ");

  return (
    <div>
      <CommonForm.ReadonlyRow
        label="원가"
        value={formatPrice(timeSaleMenu.originalPrice)}
      />
      <CommonForm.ReadonlyRow
        label="할인가"
        value={formatPrice(timeSaleMenu.discountPrice)}
      />
      <CommonForm.ReadonlyRow label="조회수" value={timeSaleMenu.viewCount} />
      <CommonForm.ReadonlyRow
        label="링크 클릭수"
        value={timeSaleMenu.reservationLinkClickCount}
      />
      <CommonForm.ReadonlyRow
        label="관심 수"
        value={timeSaleMenu.favoriteCount}
      />
      <CommonForm.ReadonlyRow
        label="노출 여부"
        value={timeSaleMenu.isActive ? "노출" : "미노출"}
      />
      <CommonForm.ReadonlyRow
        label="시술 종류"
        value={timeSaleMenu.treatmentType ?? "-"}
      />
      <CommonForm.ReadonlyRow
        label="대상 성별"
        value={timeSaleMenu.targetGender ?? "-"}
      />
      <CommonForm.ReadonlyRow
        label="커트 옵션"
        value={timeSaleMenu.cutOption ?? "-"}
      />
      <CommonForm.ReadonlyRow
        label="예약 메뉴명"
        value={timeSaleMenu.reservationName ?? "-"}
      />
      <CommonForm.ReadonlyRow
        label="예약 디자이너"
        value={timeSaleMenu.naverDesignerName ?? "-"}
      />
      <CommonForm.ReadonlyRow
        label="예약 시간"
        value={reservationSlots || "-"}
      />
      <CommonForm.ReadonlyRow
        label="작성일"
        value={formatDate(timeSaleMenu.createdAt, "YYYY.MM.DD / HH:mm") ?? "-"}
      />
      <CommonForm.ReadonlyRow
        label="최종수정일"
        value={formatDate(timeSaleMenu.updatedAt, "YYYY.MM.DD / HH:mm") ?? "-"}
      />
      <div className="mt-[20px] flex flex-col gap-0">
        <label className="mb-2 w-full shrink-0 text-foreground-strong">
          사진
        </label>
        <div className="typo-body-2-regular">
          {displayImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {displayImages.map((image, index) => (
                <ImageBox
                  key={`time-sale-menu-image-${image.id ?? image.src}`}
                  src={image.src}
                  images={displayImages}
                  index={index}
                />
              ))}
            </div>
          ) : (
            "-"
          )}
        </div>
      </div>
    </div>
  );
}

function formatLoginType(loginType: string | null) {
  const loginTypeMap: Record<string, string> = {
    APPLE: "애플",
    KAKAO: "카카오",
    GOOGLE: "구글",
  };

  return loginType ? (loginTypeMap[loginType] ?? loginType) : "-";
}
