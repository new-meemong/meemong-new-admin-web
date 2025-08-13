"use client";

import React from "react";
import { IAnnouncementForm } from "@/models/announcements";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import AnnouncementDeleteButtonBox from "@/components/features/contents/contents-detail-modal/announcement-detail-form/announcement-delete-button-box";
import ImageBox from "@/components/shared/image-box";

interface AnnouncementDetailItemProps {
  announcement: IAnnouncementForm;
  onDelete: () => void;
}

export default function AnnouncementDetailItem({
  announcement,
  onDelete,
}: AnnouncementDetailItemProps) {
  const announcementImages = (announcement.images || []).map((image) => ({
    src: image.image,
  }));

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
          {announcementImages && announcementImages.length > 0 && (
            <div className={cn("w-fit grid grid-cols-4 gap-2")}>
              {announcementImages.map((image, index) => (
                <ImageBox
                  key={`announcement-${announcement.id}-${index}`}
                  src={image.src}
                  images={announcementImages}
                  index={index}
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
