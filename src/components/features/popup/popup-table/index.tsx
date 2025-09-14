"use client";

import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import CommonTable, {
  CommonTableProps,
} from "@/components/shared/common-table";
import CommonPagination, {
  CommonPaginationProps,
} from "@/components/shared/common-pagination";
import { formatDate } from "@/utils/date";
import { IPopup } from "@/models/popup";
import PopupImageBox from "@/components/features/popup/popup-image-box";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import PopupFormModal from "@/components/features/popup/popup-form-modal";
import { useModal } from "@/components/shared/modal/useModal";
import { HIDE_TYPE_SHORT_LABELS } from "@/constants/popup";

interface PopupTableProps
  extends Omit<CommonTableProps<IPopup> & CommonPaginationProps, "columns"> {
  onRefresh: () => void;
  className?: string;
}

function PopupTable({
  className,
  data,
  totalCount,
  currentPage = 1,
  pageSize = DEFAULT_PAGINATION.size,
  onRefresh,
  onPageChange,
  onSizeChange,
  ...props
}: PopupTableProps) {
  const modal = useModal();

  const [selectedPopupId, setSelectedPopupId] = useState<number | undefined>(
    undefined,
  );

  const columns: ColumnDef<IPopup>[] = [
    {
      accessorKey: "imageUrl",
      header: "이미지",
      cell: (info) => <PopupImageBox src={info.getValue() as string} />,
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: "등록일",
      cell: (info) => formatDate(info.getValue() as string),
    },
    {
      accessorKey: "endAt",
      header: "종료일",
      cell: (info) => formatDate(info.getValue() as string),
    },
    {
      accessorKey: "clickCount",
      header: "클릭수",
      cell: (info) => info.getValue(),
      enableSorting: false,
    },
    {
      accessorKey: "hideType",
      header: "안보기옵션",
      cell: (info) => HIDE_TYPE_SHORT_LABELS[info.getValue() as string] || "-",
      enableSorting: false,
    },
    {
      accessorKey: "redirectUrl",
      header: "링크",
      cell: (info) => info.getValue(),
      enableSorting: false,
    },
  ];

  const handleClickRow = useCallback((row: Row<IPopup>) => {
    setSelectedPopupId(row.original?.id);
    modal.open();
  }, []);

  return (
    <div className={cn("popup-table-wrapper", className)} {...props}>
      <CommonTable<IPopup>
        data={data || []}
        columns={columns}
        onClickRow={handleClickRow}
      />
      <CommonPagination
        currentPage={currentPage || 1}
        pageSize={pageSize}
        totalCount={totalCount ?? 0}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />
      <PopupFormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        popupId={selectedPopupId}
        onSubmit={() => {
          onRefresh();
        }}
      />
    </div>
  );
}

export default PopupTable;
