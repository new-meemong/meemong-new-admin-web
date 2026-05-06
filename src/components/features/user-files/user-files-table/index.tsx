"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import CommonPagination, {
  CommonPaginationProps
} from "@/components/shared/common-pagination";
import { IUserFile, UserFileType } from "@/models/userFiles";
import React, { useCallback, useMemo, useState } from "react";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import ImageSwiper from "@/components/shared/image-swiper";
import ImageTable from "@/components/shared/image-table";
import { Search } from "lucide-react";
import { UserFilesUserRoleFilter } from "@/components/features/user-files/user-files-search-form";
import UserRightDrawer from "@/components/features/user/user-right-drawer";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useDeleteUserFileMutation } from "@/queries/userFiles";
import { useDrawer } from "@/stores/drawer";

interface UserFilesTableProps
  extends Omit<CommonPaginationProps, "currentPage"> {
  className?: string;
  data: IUserFile[];
  selectedUserRole?: UserFilesUserRoleFilter;
  currentPage?: number;
  onRefresh: () => void;
}

const USER_ROLE_LABEL_MAP: Record<
  Exclude<UserFilesUserRoleFilter, "ALL">,
  string
> = {
  "1": "모델",
  "2": "디자이너"
};

const FILE_TYPE_LABEL_MAP: Record<UserFileType, string> = {
  profilePhoto: "프로필",
  portfolio: "포트폴리오",
  shop: "매장"
};

function UserFilesTable({
  className,
  data,
  totalCount,
  currentPage = DEFAULT_PAGINATION.page,
  pageSize = 10,
  onPageChange,
  onSizeChange,
  onRefresh,
  selectedUserRole = "ALL"
}: UserFilesTableProps) {
  const { openDrawer } = useDrawer();
  const deleteUserFileMutation = useDeleteUserFileMutation();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);

  const previewImages = useMemo(
    () =>
      (data || []).map((userFile) => ({
        id: userFile.id,
        src: userFile.s3Path,
        title: `${userFile.userInfo.displayName} · ${FILE_TYPE_LABEL_MAP[userFile.fileType]}`,
        deletable: true
      })),
    [data]
  );

  const columns: ColumnDef<IUserFile>[] = [
    {
      accessorKey: "id",
      header: "No"
    },
    {
      accessorKey: "fileType",
      header: "파일타입"
    },
    {
      accessorKey: "s3Path",
      header: "이미지"
    }
  ];

  const handleClickRow = useCallback(
    (row: Row<IUserFile>) => {
      setSelectedUserId(row.original.userInfo.userId);
      openDrawer();
    },
    [openDrawer]
  );

  const handleOpenImagePreview = useCallback(
    (imageId: number) => {
      const nextIndex = previewImages.findIndex(
        (image) => image.id === imageId
      );
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
        const confirmed = window.confirm("해당 사진을 삭제하시겠습니까?");
        if (!confirmed) return false;

        await deleteUserFileMutation.mutateAsync(image.id);
        toast.success("사진을 삭제했습니다.");
        await onRefresh();
        return true;
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
        return false;
      }
    },
    [deleteUserFileMutation, onRefresh]
  );

  return (
    <div className={cn("user-files-table-wrapper", className)}>
      <ImageTable
        data={data || []}
        columns={columns}
        renderItem={(row) => {
          const userFile = row.original;
          const roleFromData = userFile.userInfo.role
            ? USER_ROLE_LABEL_MAP[String(userFile.userInfo.role) as "1" | "2"]
            : undefined;
          const roleLabel =
            selectedUserRole === "ALL"
              ? roleFromData
              : USER_ROLE_LABEL_MAP[selectedUserRole];

          return (
            <div
              className={cn(
                "w-full h-full relative flex cursor-pointer items-center justify-center"
              )}
            >
              {userFile.s3Path ? (
                <img
                  src={userFile.s3Path}
                  alt={`${userFile.userInfo.displayName}-${FILE_TYPE_LABEL_MAP[userFile.fileType]}`}
                  className={cn("w-full h-full object-cover aspect-square")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted aspect-square">
                  {userFile.userInfo.displayName}
                </div>
              )}

              <button
                type="button"
                className={cn(
                  "absolute top-2 left-2 p-1 rounded-md bg-white/90 text-black hover:bg-white cursor-pointer"
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenImagePreview(userFile.id);
                }}
              >
                <Search className="h-4 w-4" />
              </button>

              {selectedUserRole === "ALL" && roleLabel && (
                <div className="absolute top-10 left-2 flex flex-col gap-1">
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-md bg-white text-black font-bold"
                    )}
                  >
                    {roleLabel}
                  </span>
                </div>
              )}

              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-md bg-white text-black font-bold"
                  )}
                >
                  {FILE_TYPE_LABEL_MAP[userFile.fileType]}
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

      <UserRightDrawer userId={selectedUserId!} onRefresh={onRefresh} />
    </div>
  );
}

export default UserFilesTable;
