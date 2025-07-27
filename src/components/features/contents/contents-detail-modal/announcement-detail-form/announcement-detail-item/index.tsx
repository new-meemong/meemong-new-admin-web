"use client";

import React from "react";
import { IAnnouncementForm } from "@/models/announcements";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import AnnouncementDeleteButtonBox from "@/components/features/contents/contents-detail-modal/announcement-detail-form/announcement-delete-button-box";
import UserImageBox from "@/components/features/user/user-image-box";

interface AnnouncementDetailItemProps {
  announcement: IAnnouncementForm;
  onDelete: () => void;
}

export default function AnnouncementDetailItem({
  announcement,
  onDelete,
}: AnnouncementDetailItemProps) {
  return (
    <div className={cn("w-full flex")}>
      <div className={cn("w-full flex flex-row gap-[10px]")}>
        <div className={cn("w-full flex flex-col gap-2 py-[10px] border-b")}>
          <div className={cn("w-full flex flex-row gap-2")}>
            <span>{announcement.category || "-"}</span>
            <span>|</span>
            <span className={cn("truncate")}>
              {announcement.priceType || "-"}
            </span>
            <span>|</span>
            <span>
              {announcement.createdAt
                ? formatDate(announcement.createdAt, "YYYY.MM.DD")
                : "-"}
            </span>
          </div>
          <div className={cn("w-full")}>{announcement.description || "-"}</div>
          {announcement.images && announcement.images.length > 0 && (
            <div className={cn("w-fit grid grid-cols-4 gap-2")}>
              {announcement.images.map((imageItem) => (
                <UserImageBox
                  key={`announcement-${announcement.id}-${imageItem.id}`}
                  src={imageItem.image}
                />
              ))}
            </div>
          )}
        </div>
        <div className={cn("ml-4 py-[10px]")}>
          <AnnouncementDeleteButtonBox onClick={onDelete} />
        </div>
      </div>
    </div>
  );
}
