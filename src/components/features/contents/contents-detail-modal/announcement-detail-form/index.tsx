"use client";

import React, { useCallback } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { useDialog } from "@/components/shared/dialog/context";
import AnnouncementDetailItem from "@/components/features/contents/contents-detail-modal/announcement-detail-form/announcement-detail-item";
import {
  useDeleteAnnouncementMutation,
  useGetAnnouncementsByUserIdQuery,
} from "@/queries/announcements";

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
      const confirmed =
        await dialog.confirm("해당 구인공고를 삭제하시겠습니까?");

      if (confirmed) {
        // TODO: toast 로 교체하기
        await deleteAnnouncementMutation.mutateAsync(announcementId);
        getAnnouncementsByUserIdQuery.refetch();
      }
    },
    [],
  );

  return (
    <FormGroup title={"게시물 정보"}>
      {announcementList.map((announcement) => (
        <AnnouncementDetailItem
          key={`announcement-list-${announcement.id}`}
          announcement={announcement}
          onDelete={() => handleClickDeleteButton(announcement.id)}
        />
      ))}
    </FormGroup>
  );
}
