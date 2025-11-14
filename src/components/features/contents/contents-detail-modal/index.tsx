"use client";

import { ContentsCategoryType, IContents } from "@/models/contents";
import React, { useCallback } from "react";

import AnnouncementDetailForm from "@/components/features/contents/contents-detail-modal/announcement-detail-form";
import { CONTENTS_CATEGORY_MAP } from "@/constants/contents";
import { ChevronRight } from "lucide-react";
import ContentsDetailUserForm from "@/components/features/contents/contents-detail-modal/contents-detail-user-form";
import JobPostingDetailForm from "@/components/features/contents/contents-detail-modal/job-posting-detail-form";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import ResumeDetailForm from "@/components/features/contents/contents-detail-modal/resume-detail-form";
import ThunderAnnouncementForm from "@/components/features/contents/contents-detail-modal/thunder-announcement-form";
import { cn } from "@/lib/utils";
import { useGetUserDetailQuery } from "@/queries/users";

interface ContentsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contents: IContents;
  categoryId: ContentsCategoryType;
  onRefresh: () => void;
}

export default function ContentsDetailModal({
  isOpen,
  onClose,
  contents,
  categoryId,
  onRefresh
}: ContentsDetailModalProps) {
  const getUserDetailQuery = useGetUserDetailQuery(contents?.userInfo?.userId);

  const renderFormGroup = useCallback(() => {
    if (categoryId === "2") {
      return <JobPostingDetailForm userId={contents?.userInfo?.userId} />;
    } else if (categoryId === "3") {
      return <ResumeDetailForm userId={contents?.userInfo?.userId} />;
    } else if (categoryId === "4") {
      return <AnnouncementDetailForm userId={contents?.userInfo?.userId} />;
    } else {
      return (
        <ThunderAnnouncementForm
          contentsId={contents?.id}
          categoryId={categoryId}
          onRefresh={onRefresh}
          onClose={onClose}
        />
      );
    }
  }, [
    categoryId,
    contents?.userInfo?.userId,
    contents?.id,
    onRefresh,
    onClose
  ]);

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      closable={true}
      onClose={onClose}
      onClickOutside={onClose}
    >
      <ModalHeader>
        컨텐츠 관리 <ChevronRight /> {CONTENTS_CATEGORY_MAP[categoryId]}{" "}
        <ChevronRight /> 상세페이지
      </ModalHeader>
      <ModalBody>
        <div className={cn("w-full flex flex-row gap-6")}>
          <div className={cn("w-[28%] flex-shrink-0 flex flex-col gap-4")}>
            <h3 className={cn("typo-title-2-semibold text-foreground")}>
              유저 정보
            </h3>
            <ContentsDetailUserForm formData={getUserDetailQuery.data!} />
          </div>
          <div className={cn("flex-1 flex flex-col gap-4 pr-6")}>
            <h3 className={cn("typo-title-2-semibold text-foreground")}>
              모집공고 목록
            </h3>
            {renderFormGroup()}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
