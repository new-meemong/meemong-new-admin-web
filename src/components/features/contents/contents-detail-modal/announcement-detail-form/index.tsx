"use client";

import React, { useCallback } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { useDialog } from "@/components/shared/dialog/context";
import AnnouncementDetailItem from "@/components/features/contents/contents-detail-modal/announcement-detail-form/announcement-detail-item";
import {
  useDeleteAnnouncementMutation,
  useGetAnnouncementsByUserIdQuery,
} from "@/queries/announcements";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

interface AnnouncementDetailFormProps {
  userId?: number;
}

export default function AnnouncementDetailForm({
  userId,
}: AnnouncementDetailFormProps) {
  const dialog = useDialog();

  const getAnnouncementsByUserIdQuery = useGetAnnouncementsByUserIdQuery(
    userId!,
  );
  const deleteAnnouncementMutation = useDeleteAnnouncementMutation();

  const announcementList = getAnnouncementsByUserIdQuery?.data?.content || [];

  const handleClickDeleteButton = useCallback(
    async (announcementId: number) => {
      try {
        const confirmed =
          await dialog.confirm("해당 모집공고를 삭제하시겠습니까?");

        if (confirmed) {
          await deleteAnnouncementMutation.mutateAsync(announcementId);
          toast.success("모집공고를 삭제했습니다.");
          await getAnnouncementsByUserIdQuery.refetch();
        }
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [dialog, deleteAnnouncementMutation, getAnnouncementsByUserIdQuery],
  );

  return (
    <FormGroup>
      <div className={cn("flex flex-col gap-4")}>
        {announcementList.map((announcement) => (
          <AnnouncementDetailItem
            key={`announcement-list-${announcement.id}`}
            announcement={announcement}
            onDelete={() => handleClickDeleteButton(announcement.id)}
            onRefresh={async () => {
              await getAnnouncementsByUserIdQuery.refetch();
            }}
          />
        ))}
      </div>
    </FormGroup>
  );
}
