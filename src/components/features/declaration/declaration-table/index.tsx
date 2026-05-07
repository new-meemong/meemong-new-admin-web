"use client";

import React, { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import CommonTable from "@/components/shared/common-table";
import CommonPagination, {
  CommonPaginationProps,
} from "@/components/shared/common-pagination";
import { formatDate } from "@/utils/date";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { useModal } from "@/components/shared/modal/useModal";
import DeclarationDetailModal from "@/components/features/declaration/declaration-detail-modal";
import { IUserReport } from "@/models/userReports";
import {
  USER_REPORT_STATUS_CHANGE_OPTIONS,
  getChattingRoomAdminUrl,
  getUserReportReasonLabel,
} from "@/constants/userReports";
import SelectBox from "@/components/shared/select-box";
import { usePatchUserReportStatusMutation } from "@/queries/userReports";
import { toast } from "react-toastify";
import UserRightDrawer from "@/components/features/user/user-right-drawer";
import { useDrawer } from "@/stores/drawer";
import { useGetUserDetailQuery } from "@/queries/users";
import { ReportManagementType, ReportStatus } from "@/models/reports";
import { IChattingRoomReport } from "@/models/chattingRoomReports";
import { usePatchChattingRoomReportStatusMutation } from "@/queries/chattingRoomReports";
import { Button } from "@/components/ui/button";

type DeclarationReport = IUserReport | IChattingRoomReport;

interface DeclarationTableProps extends CommonPaginationProps {
  className?: string;
  data: DeclarationReport[];
  reportType: ReportManagementType;
  onRefresh?: () => void;
}

function DeclarationTable({
  className,
  data,
  reportType,
  totalCount,
  currentPage = DEFAULT_PAGINATION.page,
  pageSize = DEFAULT_PAGINATION.size,
  onRefresh,
  onPageChange,
  onSizeChange,
  ...props
}: DeclarationTableProps) {
  const modal = useModal();
  const { openDrawer } = useDrawer();
  const patchUserReportStatusMutation = usePatchUserReportStatusMutation();
  const patchChattingRoomReportStatusMutation =
    usePatchChattingRoomReportStatusMutation();

  const [selectedReport, setSelectedReport] =
    useState<DeclarationReport | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const isStatusPending =
    patchUserReportStatusMutation.isPending ||
    patchChattingRoomReportStatusMutation.isPending;

  const handleOpenUserDrawer = useCallback(
    (userId?: number) => {
      if (!userId) return;

      setSelectedUserId(userId);
      openDrawer();
    },
    [openDrawer],
  );

  const handleOpenDetail = useCallback(
    (report: DeclarationReport) => {
      setSelectedReport(report);
      modal.open();
    },
    [modal],
  );

  const handleChangeStatus = useCallback(
    async (report: DeclarationReport, status: ReportStatus) => {
      if (report.status === status) return;

      try {
        if (reportType === "MYPAGE") {
          await patchUserReportStatusMutation.mutateAsync({
            id: report.id,
            status,
          });
        } else {
          await patchChattingRoomReportStatusMutation.mutateAsync({
            id: report.id,
            status,
          });
        }

        toast.success("처리상태를 변경했습니다.");
        onRefresh?.();
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [
      onRefresh,
      patchChattingRoomReportStatusMutation,
      patchUserReportStatusMutation,
      reportType,
    ],
  );

  const columns = useMemo<ColumnDef<DeclarationReport>[]>(() => {
    const baseColumns: ColumnDef<DeclarationReport>[] = [
      {
        id: "no",
        header: "No",
        cell: (info) => (currentPage - 1) * pageSize + info.row.index + 1,
        size: 70,
        enableSorting: false,
      },
      {
        accessorKey: "userInfo.displayName",
        header: "신고자",
        cell: (info) => (
          <ReportUserButton
            label={(info.getValue() as string) || "-"}
            onClick={() =>
              handleOpenUserDrawer(info.row.original.userInfo.userId)
            }
          />
        ),
        size: 140,
        enableSorting: false,
      },
    ];

    if (reportType === "MYPAGE") {
      baseColumns.push({
        accessorKey: "reportedUserId",
        header: "피신고자",
        cell: (info) => {
          const report = info.row.original;
          if (!isUserReport(report)) return "-";

          return (
            <ReportedUserButton
              report={report}
              onClick={() => handleOpenUserDrawer(report.reportedUserId)}
            />
          );
        },
        size: 140,
        enableSorting: false,
      });
    }

    baseColumns.push({
      accessorKey: "reason",
      header: "신고내용",
      cell: (info) => (
        <button
          type="button"
          className={cn(
            "max-w-full cursor-pointer truncate text-secondary-foreground hover:underline",
          )}
          onClick={(event) => {
            event.stopPropagation();
            handleOpenDetail(info.row.original);
          }}
        >
          {getUserReportReasonLabel(info.row.original)}
        </button>
      ),
      enableSorting: false,
    });

    if (reportType === "CHATTING_ROOM") {
      baseColumns.push({
        id: "chattingRoom",
        header: "채팅방 이동",
        cell: (info) => {
          const report = info.row.original;
          if (!isChattingRoomReport(report)) return "-";

          return (
            <Button variant="outline" size="sm" asChild>
              <a
                href={getChattingRoomAdminUrl(report.chattingRoomId)}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                이동
              </a>
            </Button>
          );
        },
        size: 120,
        enableSorting: false,
      });
    }

    baseColumns.push(
      {
        accessorKey: "createdAt",
        header: "신고날짜",
        cell: (info) =>
          formatDate(info.getValue() as string, "YYYY-MM-DD HH:mm") || "-",
        size: 170,
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "처리상태",
        cell: (info) => (
          <SelectBox<{ status: ReportStatus }>
            className={cn("w-[110px]")}
            name="status"
            size="sm"
            value={info.getValue() as ReportStatus}
            options={USER_REPORT_STATUS_CHANGE_OPTIONS}
            disabled={isStatusPending}
            onChange={({ value }) =>
              handleChangeStatus(info.row.original, value as ReportStatus)
            }
          />
        ),
        size: 130,
        enableSorting: false,
      },
    );

    return baseColumns;
  }, [
    currentPage,
    handleChangeStatus,
    handleOpenDetail,
    handleOpenUserDrawer,
    isStatusPending,
    pageSize,
    reportType,
  ]);

  const handleSubmit = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  return (
    <div className={cn("declaration-table-wrapper", className)} {...props}>
      <CommonTable<DeclarationReport> data={data || []} columns={columns} />
      <CommonPagination
        currentPage={currentPage || 1}
        pageSize={pageSize}
        totalCount={totalCount ?? 0}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />
      <DeclarationDetailModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSubmit={handleSubmit}
        report={selectedReport}
        reportType={reportType}
      />
      <UserRightDrawer userId={selectedUserId!} onRefresh={handleSubmit} />
    </div>
  );
}

function ReportUserButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "max-w-full cursor-pointer truncate text-secondary-foreground hover:underline",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {label || "-"}
    </button>
  );
}

function ReportedUserButton({
  report,
  onClick,
}: {
  report: IUserReport;
  onClick: () => void;
}) {
  const getUserDetailQuery = useGetUserDetailQuery(report.reportedUserId, {
    enabled: Boolean(report.reportedUserId),
  });
  const displayName =
    report.reportedUserInfo?.displayName ||
    getUserDetailQuery.data?.displayName ||
    `#${report.reportedUserId}`;

  return <ReportUserButton label={displayName} onClick={onClick} />;
}

function isUserReport(report: DeclarationReport): report is IUserReport {
  return "reportedUserId" in report;
}

function isChattingRoomReport(
  report: DeclarationReport,
): report is IChattingRoomReport {
  return "chattingRoomId" in report;
}

export default DeclarationTable;
