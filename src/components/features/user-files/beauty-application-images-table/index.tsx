"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import CommonPagination, {
  CommonPaginationProps
} from "@/components/shared/common-pagination";
import React, { useCallback, useMemo, useState } from "react";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import AnnouncementDetailModal from "@/components/features/contents/contents-detail-modal/announcement-detail-modal";
import {
  IBeautyApplicationImage,
} from "@/models/beautyApplicationImages";
import ImageTable from "@/components/shared/image-table";
import ImageSwiper from "@/components/shared/image-swiper";
import { IContents } from "@/models/contents";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeleteBeautyApplicationImageMutation } from "@/queries/beautyApplicationImages";
import { useModal } from "@/components/shared/modal/useModal";
import { toast } from "react-toastify";

interface BeautyApplicationImagesTableProps
  extends Omit<CommonPaginationProps, "currentPage"> {
  className?: string;
  data: IBeautyApplicationImage[];
  currentPage?: number;
  onRefresh: () => void;
}

function BeautyApplicationImagesTable({
  className,
  data,
  totalCount,
  currentPage = DEFAULT_PAGINATION.page,
  pageSize = 10,
  onPageChange,
  onSizeChange,
  onRefresh
}: BeautyApplicationImagesTableProps) {
  const detailModal = useModal();
  const deleteBeautyApplicationImageMutation =
    useDeleteBeautyApplicationImageMutation();
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<IContents | null>(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);

  const previewImages = useMemo(
    () =>
      (data || []).map((image) => ({
        id: image.id,
        src: image.image,
        title: `${image.userInfo.displayName} · ${image.beautyApplicationInfo.title}`,
        deletable: true
      })),
    [data]
  );

  const columns: ColumnDef<IBeautyApplicationImage>[] = [
    {
      accessorKey: "id",
      header: "No"
    },
    {
      accessorKey: "image",
      header: "이미지"
    },
    {
      accessorKey: "userInfo",
      header: "회원"
    }
  ];

  const handleClickRow = useCallback(
    (row: Row<IBeautyApplicationImage>) => {
      const beautyApplicationImage = row.original;

      setSelectedAnnouncement({
        id: beautyApplicationImage.beautyApplicationInfo.beautyApplicationId,
        userInfo: {
          userId: beautyApplicationImage.userInfo.userId,
          displayName: beautyApplicationImage.userInfo.displayName
        },
        isPremium: 0,
        createdAt: beautyApplicationImage.createdAt,
        deletedAt: "",
        description: beautyApplicationImage.beautyApplicationInfo.title
      });
      detailModal.open();
    },
    [detailModal]
  );

  const handleOpenImagePreview = useCallback(
    (imageId: number) => {
      const nextIndex = previewImages.findIndex((image) => image.id === imageId);
      if (nextIndex < 0) return;
      setPreviewImageIndex(nextIndex);
      setIsImagePreviewOpen(true);
    },
    [previewImages]
  );

  const handleDeletePreviewImage = useCallback(
    async (image: { id?: number }) => {
      if (!image.id) {
        window.alert("삭제할 수 없는 이미지입니다.");
        return false;
      }

      try {
        const confirmed = window.confirm("해당 모집공고 이미지를 삭제하시겠습니까?");
        if (!confirmed) return false;

        await deleteBeautyApplicationImageMutation.mutateAsync(image.id);
        toast.success("모집공고 이미지를 삭제했습니다.");
        await onRefresh();
        return true;
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
        return false;
      }
    },
    [deleteBeautyApplicationImageMutation, onRefresh]
  );

  return (
    <div className={cn("beauty-application-images-table-wrapper", className)}>
      <ImageTable
        data={data || []}
        columns={columns}
        renderItem={(row) => {
          const image = row.original;

          return (
            <div
              className={cn(
                "w-full h-full relative flex cursor-pointer items-center justify-center"
              )}
            >
              {image.image ? (
                <img
                  src={image.image}
                  alt={`${image.userInfo.displayName}-${image.beautyApplicationInfo.title}`}
                  className={cn("w-full h-full object-cover aspect-square")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted aspect-square">
                  {image.userInfo.displayName}
                </div>
              )}

              <button
                type="button"
                className={cn(
                  "absolute top-2 left-2 p-1 rounded-md bg-white/90 text-black hover:bg-white cursor-pointer"
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenImagePreview(image.id);
                }}
              >
                <Search className="h-4 w-4" />
              </button>

              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-md bg-white text-black font-bold"
                  )}
                >
                  모집공고
                </span>
              </div>
            </div>
          );
        }}
        onClickRow={handleClickRow}
      />

      <CommonPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount ?? 0}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />

      {isImagePreviewOpen && previewImages.length > 0 && (
        <ImageSwiper
          images={previewImages}
          initialIndex={previewImageIndex}
          open={isImagePreviewOpen}
          onClose={() => setIsImagePreviewOpen(false)}
          onDeleteImage={handleDeletePreviewImage}
        />
      )}

      {selectedAnnouncement && (
        <AnnouncementDetailModal
          isOpen={detailModal.isOpen}
          onClose={detailModal.close}
          contents={selectedAnnouncement}
          categoryId={"4"}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

export default BeautyApplicationImagesTable;
