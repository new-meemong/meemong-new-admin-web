"use client";

import React, { useCallback } from "react";
import {
  useDeleteBeautyApplicationMutation,
  useGetBeautyApplicationByIdQuery,
} from "@/queries/beautyApplications";

import AnnouncementDetailItem from "@/components/features/contents/contents-detail-modal/announcement-detail-form/announcement-detail-item";
import { ApiError } from "@/apis/core";
import { Button } from "@/components/ui/button";
import { FormGroup } from "@/components/ui/form-group";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";

interface AnnouncementDetailFormProps {
  id?: number;
  onClose?: () => void;
  onRefresh?: () => Promise<void> | void;
}

export default function AnnouncementDetailForm({
  id,
  onClose,
  onRefresh,
}: AnnouncementDetailFormProps) {
  const dialog = useDialog();

  const getBeautyApplicationByIdQuery = useGetBeautyApplicationByIdQuery(id!);
  const deleteBeautyApplicationMutation = useDeleteBeautyApplicationMutation();

  const announcement = getBeautyApplicationByIdQuery?.data?.data;

  const handleClickDeleteButton = useCallback(async () => {
    if (!id) return;
    try {
      const confirmed =
        await dialog.confirm("해당 모집공고를 삭제하시겠습니까?");

      if (confirmed) {
        await deleteBeautyApplicationMutation.mutateAsync(id);
        toast.success("모집공고를 삭제했습니다.");
        await onRefresh?.();
        onClose?.();
      }
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [dialog, deleteBeautyApplicationMutation, id, onClose, onRefresh]);

  return (
    <FormGroup>
      <div className={cn("flex flex-col gap-4")}>
        {getBeautyApplicationByIdQuery.isPending && (
          <p role="status">메뉴를 불러오는 중…</p>
        )}
        {getBeautyApplicationByIdQuery.isError && (
          <div role="alert">
            <p>
              {getBeautyApplicationByIdQuery.error instanceof ApiError &&
              [401, 403].includes(getBeautyApplicationByIdQuery.error.status)
                ? "조회 권한이 없습니다."
                : getBeautyApplicationByIdQuery.error instanceof ApiError &&
                    getBeautyApplicationByIdQuery.error.status === 404
                  ? "메뉴를 찾을 수 없습니다."
                  : "메뉴를 불러오지 못했습니다."}
            </p>
            <Button
              onClick={() => void getBeautyApplicationByIdQuery.refetch()}
            >
              다시 시도
            </Button>
          </div>
        )}
        {announcement && !getBeautyApplicationByIdQuery.isError && (
          <AnnouncementDetailItem
            announcement={announcement}
            onDelete={handleClickDeleteButton}
            onRefresh={async () => {
              await getBeautyApplicationByIdQuery.refetch();
              await onRefresh?.();
            }}
          />
        )}
      </div>
    </FormGroup>
  );
}
