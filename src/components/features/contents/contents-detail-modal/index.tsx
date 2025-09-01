"use client";

import React, { useCallback } from "react";
import { Modal } from "@/components/shared/modal";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { ContentsCategoryType, IContents } from "@/models/contents";
import { ChevronRight } from "lucide-react";
import { CONTENTS_CATEGORY_MAP } from "@/constants/contents";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { useGetUserDetailQuery } from "@/queries/users";
import ContentsDetailUserForm from "@/components/features/contents/contents-detail-modal/contents-detail-user-form";
import ThunderAnnouncementForm from "@/components/features/contents/contents-detail-modal/thunder-announcement-form";
import JobPostingDetailForm from "@/components/features/contents/contents-detail-modal/job-posting-detail-form";
import ResumeDetailForm from "@/components/features/contents/contents-detail-modal/resume-detail-form";
import AnnouncementDetailForm from "@/components/features/contents/contents-detail-modal/announcement-detail-form";

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
  onRefresh,
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
          onRefresh={onRefresh}
          onClose={onClose}
        />
      );
    }
  }, [categoryId, contents?.userInfo?.userId]);

  return (
    <Modal isOpen={isOpen} size="md">
      <ModalHeader closable={true} onClose={onClose}>
        컨텐츠 관리 <ChevronRight /> {CONTENTS_CATEGORY_MAP[categoryId]}{" "}
        <ChevronRight /> 상세페이지
      </ModalHeader>
      <ModalBody>
        <ContentsDetailUserForm formData={getUserDetailQuery.data!} />
        {renderFormGroup()}
      </ModalBody>
    </Modal>
  );
}
