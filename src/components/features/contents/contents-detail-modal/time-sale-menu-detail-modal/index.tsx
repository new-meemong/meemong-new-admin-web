"use client";

import {
  formatTimeSaleMenuReservationRate,
  formatTimeSaleMenuAnalysisTreatmentType,
} from "@/utils/timeSaleMenus";

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
import { useGetUserDetailQuery } from "@/queries/users";
import TimeSaleMenuAppPreview from "@/components/features/contents/time-sale-menu-app-preview";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { formatDate } from "@/utils/date";
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
  const designerPhotosQuery = useGetUserDetailQuery(
    currentTimeSaleMenu.designerUserId,
    {
      enabled: isOpen && currentTimeSaleMenu.designerUserId > 0,
    },
  );

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
      className="h-[calc(100dvh-32px)] max-h-[1040px]"
      closable
      onClose={onClose}
      onClickOutside={onClose}
    >
      <ModalHeader>
        콘텐츠 관리 <ChevronRight className="h-4 w-4" />{" "}
        {CONTENTS_CATEGORY_MAP["7"]} <ChevronRight className="h-4 w-4" />{" "}
        상세페이지
      </ModalHeader>

      <ModalBody className="flex min-h-0 flex-col overflow-hidden">
        <FormProvider {...form}>
          <form
            className="flex min-h-0 w-full flex-1 flex-col gap-6"
            onSubmit={handleUpdate}
            noValidate
          >
            <div className="flex min-h-0 w-full flex-1 flex-row gap-6 overflow-hidden">
              <section className="flex min-h-0 w-[24%] flex-shrink-0 flex-col gap-4 overflow-y-auto">
                <h3 className="typo-title-2-semibold text-foreground">
                  유저 정보
                </h3>
                <TimeSaleMenuUserInfoPanel
                  userInfo={currentTimeSaleMenu.userInfo}
                />
                <details open className="border-t pt-4">
                  <summary className="cursor-pointer typo-title-2-semibold">
                    운영 정보
                  </summary>
                  <TimeSaleMenuAdminInfoPanel
                    timeSaleMenu={currentTimeSaleMenu}
                  />
                </details>
              </section>

              <section className="flex min-h-0 w-[375px] shrink-0 flex-col gap-3">
                <h3 className="flex-shrink-0 typo-title-2-semibold text-foreground">
                  앱 미리보기
                </h3>
                <TimeSaleMenuAppPreview
                  key={currentTimeSaleMenu.id}
                  menu={currentTimeSaleMenu}
                  photos={designerPhotosQuery.data?.userPhotos ?? []}
                  photosLoading={designerPhotosQuery.isLoading}
                  photosError={designerPhotosQuery.isError}
                  onRetryPhotos={() => void designerPhotosQuery.refetch()}
                />
              </section>

              <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-6">
                <h3 className="flex-shrink-0 typo-title-2-semibold text-foreground">
                  콘텐츠 수정
                </h3>
                <FormGroup>
                  <CommonForm.Input<TimeSaleMenuForm>
                    name="name"
                    label="제목"
                    placeholder="제목을 입력해주세요."
                  />
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

function TimeSaleMenuAdminInfoPanel({
  timeSaleMenu,
}: {
  timeSaleMenu: ITimeSaleMenu;
}) {
  const reservationSlots = timeSaleMenu.reservationSlots
    ?.map(
      (slot) =>
        `${slot.dayOfWeek} ${formatReservationTime(slot.startTime)}~${formatReservationTime(slot.endTime)}`,
    )
    .join(", ");

  return (
    <div>
      <CommonForm.ReadonlyRow
        stacked
        label="원가"
        value={formatPrice(timeSaleMenu.originalPrice)}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="할인가"
        value={formatPrice(timeSaleMenu.discountPrice)}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="조회수"
        value={timeSaleMenu.viewCount}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="누적 예약 요청수"
        value={timeSaleMenu.reservationRequestCount ?? "-"}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="현재 예약 수락수"
        value={timeSaleMenu.reservationAcceptedCount ?? "-"}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="예약률 (수락수/조회수)"
        value={formatTimeSaleMenuReservationRate(timeSaleMenu.reservationRate)}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="링크 클릭수"
        value={timeSaleMenu.reservationLinkClickCount}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="관심 수"
        value={timeSaleMenu.favoriteCount}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="노출 여부"
        value={timeSaleMenu.isActive ? "노출" : "미노출"}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="시술 종류"
        value={formatTimeSaleMenuAnalysisTreatmentType(
          timeSaleMenu.treatmentType,
        )}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="대상 성별"
        value={timeSaleMenu.targetGender ?? "-"}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="커트 옵션"
        value={timeSaleMenu.cutOption ?? "-"}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="예약 메뉴명"
        value={timeSaleMenu.reservationName ?? "-"}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="예약 디자이너"
        value={timeSaleMenu.naverDesignerName ?? "-"}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="예약 시간"
        value={reservationSlots || "-"}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="작성일"
        value={formatDate(timeSaleMenu.createdAt, "YYYY.MM.DD / HH:mm") ?? "-"}
      />
      <CommonForm.ReadonlyRow
        stacked
        label="최종수정일"
        value={formatDate(timeSaleMenu.updatedAt, "YYYY.MM.DD / HH:mm") ?? "-"}
      />
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
