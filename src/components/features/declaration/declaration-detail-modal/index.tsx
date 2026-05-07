"use client";

import React, { useCallback } from "react";
import { Modal } from "@/components/shared/modal";
import { ModalHeader } from "@/components/shared/modal/modal-header";

import { IChattingRoomReport } from "@/models/chattingRoomReports";
import { IUserReport } from "@/models/userReports";
import { ModalBody } from "@/components/shared/modal/modal-body";
import {
  ReportManagementType,
  IReportAdminMemo,
  ReportStatus,
} from "@/models/reports";
import {
  useGetChattingRoomReportDetailQuery,
  usePatchChattingRoomReportStatusMutation,
} from "@/queries/chattingRoomReports";
import {
  useGetUserReportDetailQuery,
  usePatchUserReportStatusMutation,
} from "@/queries/userReports";
import DeclarationDetailForm from "@/components/features/declaration/declaration-detail-modal/declaration-detail-form";
import { useDialog } from "@/components/shared/dialog/context";
import { toast } from "react-toastify";
import { useGetUserDetailQuery } from "@/queries/users";

type DeclarationReport = IUserReport | IChattingRoomReport;

interface DeclarationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  report?: DeclarationReport | null;
  reportType: ReportManagementType;
}

export default function DeclarationDetailModal({
  isOpen,
  onClose,
  onSubmit,
  report,
  reportType,
}: DeclarationDetailModalProps) {
  const dialog = useDialog();

  const getUserReportDetailQuery = useGetUserReportDetailQuery(report?.id, {
    enabled: Boolean(isOpen && reportType === "MYPAGE" && !!report?.id),
  });
  const getChattingRoomReportDetailQuery = useGetChattingRoomReportDetailQuery(
    report?.id,
    {
      enabled: Boolean(
        isOpen && reportType === "CHATTING_ROOM" && !!report?.id,
      ),
    },
  );

  const detail =
    reportType === "MYPAGE"
      ? getUserReportDetailQuery.data
      : getChattingRoomReportDetailQuery.data;

  const getReporterDetailQuery = useGetUserDetailQuery(
    detail?.userInfo.userId,
    {
      enabled: Boolean(isOpen && detail?.userInfo.userId),
    },
  );
  const getReportedUserDetailQuery = useGetUserDetailQuery(
    isUserReport(detail) ? detail.reportedUserId : undefined,
    {
      enabled: Boolean(isOpen && isUserReport(detail) && detail.reportedUserId),
    },
  );

  const patchUserReportStatusMutation = usePatchUserReportStatusMutation();
  const patchChattingRoomReportStatusMutation =
    usePatchChattingRoomReportStatusMutation();

  const handleSubmit = useCallback(
    async ({
      status,
      memo,
      onMemoSaved,
    }: {
      status: ReportStatus;
      memo?: string;
      onMemoSaved?: (memo: IReportAdminMemo) => void;
    }) => {
      if (!report?.id) return false;

      try {
        const confirmed = await dialog.confirm(`신고 내용을 저장하시겠습니까?`);

        if (confirmed) {
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

          if (memo?.trim() && onMemoSaved) {
            onMemoSaved({
              id: `${reportType}-${report.id}-${Date.now()}`,
              memo: memo.trim(),
              status,
              createdAt: new Date().toISOString(),
            });
          }

          toast.success("신고 내용을 저장했습니다.");

          onSubmit();
          if (reportType === "MYPAGE") {
            getUserReportDetailQuery.refetch();
          } else {
            getChattingRoomReportDetailQuery.refetch();
          }
          return true;
        }

        return false;
      } catch (error) {
        console.log(error);
        toast.error("잠시 후 다시 시도해주세요.");
        return false;
      }
    },
    [
      dialog,
      getChattingRoomReportDetailQuery,
      getUserReportDetailQuery,
      onSubmit,
      patchChattingRoomReportStatusMutation,
      patchUserReportStatusMutation,
      report?.id,
      reportType,
    ],
  );

  if (!detail) return null;

  return (
    <Modal
      isOpen={isOpen}
      size="md"
      closable={true}
      onClose={onClose}
      onClickOutside={onClose}
    >
      <ModalHeader>신고 상세</ModalHeader>
      <ModalBody>
        <DeclarationDetailForm
          formData={detail}
          reportType={reportType}
          reporterUser={getReporterDetailQuery.data}
          reportedUser={getReportedUserDetailQuery.data}
          isSubmitting={
            patchUserReportStatusMutation.isPending ||
            patchChattingRoomReportStatusMutation.isPending
          }
          onSubmit={handleSubmit}
        />
      </ModalBody>
    </Modal>
  );
}

function isUserReport(report?: DeclarationReport): report is IUserReport {
  return Boolean(report && "reportedUserId" in report);
}
