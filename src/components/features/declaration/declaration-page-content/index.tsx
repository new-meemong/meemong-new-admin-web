"use client";

import React, { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import useSearchForm from "@/components/shared/search-form/useSearchMethods";
import DeclarationSearchForm, {
  IUserReportSearchParams,
} from "@/components/features/declaration/declaration-search-form";
import DeclarationTable from "@/components/features/declaration/declaration-table";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { ReportManagementType } from "@/models/reports";
import { getUserReportReasonLabel } from "@/constants/userReports";
import { useGetChattingRoomReportsQuery } from "@/queries/chattingRoomReports";
import { useGetUserReportsQuery } from "@/queries/userReports";
import { UserReportRoleFilter } from "@/models/userReports";

interface DeclarationPageContentProps {
  className?: string;
  reportType: ReportManagementType;
}

function DeclarationPageContent({
  className,
  reportType,
}: DeclarationPageContentProps) {
  const DEFAULT_SEARCH_PARAMS: IUserReportSearchParams = {
    userRole: "ALL",
    status: "ALL",
    reason: "ALL",
    ...DEFAULT_PAGINATION,
  };

  const methods = useSearchForm<IUserReportSearchParams>({
    defaultParams: DEFAULT_SEARCH_PARAMS,
  });

  const { data: userReportsData, refetch: refetchUserReports } =
    useGetUserReportsQuery(
      {
        status:
          methods.searchParams.status === "ALL"
            ? undefined
            : methods.searchParams.status,
        userRoles: getUserRoleQueryValues(methods.searchParams.userRole),
        page: methods.searchParams.page,
        size: methods.searchParams.size,
      },
      {
        enabled: reportType === "MYPAGE",
      },
    );

  const { data: chattingRoomReportsData, refetch: refetchChattingRoomReports } =
    useGetChattingRoomReportsQuery(
      {
        status:
          methods.searchParams.status === "ALL"
            ? undefined
            : methods.searchParams.status,
        userRoles: getUserRoleQueryValues(methods.searchParams.userRole),
        page: methods.searchParams.page,
        size: methods.searchParams.size,
      },
      {
        enabled: reportType === "CHATTING_ROOM",
      },
    );

  const reportsData =
    reportType === "MYPAGE" ? userReportsData : chattingRoomReportsData;

  const reports = useMemo(() => {
    const content = reportsData?.content ?? [];
    if (methods.searchParams.reason === "ALL") return content;

    return content.filter(
      (report) =>
        getUserReportReasonLabel(report) === methods.searchParams.reason,
    );
  }, [reportsData?.content, methods.searchParams.reason]);

  const handleRefresh = useCallback(() => {
    if (reportType === "MYPAGE") {
      refetchUserReports();
      return;
    }

    refetchChattingRoomReports();
  }, [refetchChattingRoomReports, refetchUserReports, reportType]);

  return (
    <div className={cn("contents-page-content", className)}>
      <DeclarationSearchForm
        searchForm={methods}
        onSubmit={() => {
          methods.handleSubmit();
        }}
        onRefresh={() => {
          methods.handleReset();
        }}
      />
      <DeclarationTable
        reportType={reportType}
        data={reports}
        totalCount={
          methods.searchParams.reason === "ALL"
            ? (reportsData?.totalCount ?? 0)
            : reports.length
        }
        currentPage={methods.params.page}
        pageSize={methods.params.size}
        onRefresh={handleRefresh}
        onPageChange={(page) => {
          methods.handleChangePage(page);
        }}
        onSizeChange={(size) => {
          methods.handleChangeSize(size);
        }}
      />
    </div>
  );
}

function getUserRoleQueryValues(
  userRole: IUserReportSearchParams["userRole"],
): UserReportRoleFilter[] {
  return userRole === "ALL" ? ["1", "2"] : [userRole];
}

export default DeclarationPageContent;
