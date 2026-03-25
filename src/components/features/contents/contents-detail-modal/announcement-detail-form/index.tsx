"use client";

import React, { useCallback } from "react";
import {
  useDeleteBeautyApplicationMutation,
  useGetBeautyApplicationByIdQuery
} from "@/queries/beautyApplications";

import AnnouncementDetailItem from "@/components/features/contents/contents-detail-modal/announcement-detail-form/announcement-detail-item";
import { FormGroup } from "@/components/ui/form-group";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";

interface AnnouncementDetailFormProps {
  id?: number;
  onClose?: () => void;
}

export default function AnnouncementDetailForm({
  id,
  onClose
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
        onClose?.();
      }
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [dialog, deleteBeautyApplicationMutation, id, onClose]);

  return (
    <FormGroup>
      <div className={cn("flex flex-col gap-4")}>
        {announcement && (
          <AnnouncementDetailItem
            announcement={announcement}
            onDelete={handleClickDeleteButton}
            onRefresh={async () => {
              await getBeautyApplicationByIdQuery.refetch();
            }}
          />
        )}
      </div>
    </FormGroup>
  );
}
