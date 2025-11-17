"use client";

import { ContentsCategoryType, IContents } from "@/models/contents";
import React from "react";

import AnnouncementDetailForm from "@/components/features/contents/contents-detail-modal/announcement-detail-form";
import { CONTENTS_CATEGORY_MAP } from "@/constants/contents";
import { ChevronRight } from "lucide-react";
import ContentsDetailUserForm from "@/components/features/contents/contents-detail-modal/contents-detail-user-form";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { cn } from "@/lib/utils";
import { useGetUserDetailQuery } from "@/queries/users";

interface AnnouncementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contents: IContents;
  categoryId: ContentsCategoryType;
  onRefresh?: () => void;
}

export default function AnnouncementDetailModal({
  isOpen,
  onClose,
  contents,
  categoryId
}: AnnouncementDetailModalProps) {
  const getUserDetailQuery = useGetUserDetailQuery(contents?.userInfo?.userId);

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
            <AnnouncementDetailForm userId={contents?.userInfo?.userId} />
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}

