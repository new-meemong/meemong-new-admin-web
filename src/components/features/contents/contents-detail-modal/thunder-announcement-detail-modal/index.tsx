"use client";

import { ContentsCategoryType, IContents } from "@/models/contents";
import React from "react";

import { CONTENTS_CATEGORY_MAP } from "@/constants/contents";
import { ChevronRight } from "lucide-react";
import ContentsDetailUserForm from "@/components/features/contents/contents-detail-modal/contents-detail-user-form";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import ThunderAnnouncementForm from "@/components/features/contents/contents-detail-modal/thunder-announcement-form";
import { cn } from "@/lib/utils";
import { useGetUserDetailQuery } from "@/queries/users";
import { useThunderAnnouncementForm } from "@/components/features/contents/contents-detail-modal/thunder-announcement-form/useThunderAnnouncementForm";
import { FormProvider } from "react-hook-form";

interface ThunderAnnouncementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contents: IContents;
  categoryId: ContentsCategoryType;
  onRefresh: () => void;
}

export default function ThunderAnnouncementDetailModal({
  isOpen,
  onClose,
  contents,
  categoryId,
  onRefresh
}: ThunderAnnouncementDetailModalProps) {
  const getUserDetailQuery = useGetUserDetailQuery(contents?.userInfo?.userId);
  const { form } = useThunderAnnouncementForm(contents?.id);

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
      <ModalBody className={cn("overflow-hidden flex flex-col")}>
        <FormProvider {...form}>
          <div className={cn("w-full flex flex-col gap-6 flex-1 min-h-0")}>
            <div className={cn("w-full flex flex-row gap-6 flex-1 min-h-0")}>
              <div className={cn("w-[28%] flex-shrink-0 flex flex-col gap-4")}>
                <h3 className={cn("typo-title-2-semibold text-foreground")}>
                  유저 정보
                </h3>
                <ContentsDetailUserForm formData={getUserDetailQuery.data!} />
              </div>
              <div className={cn("flex-1 flex flex-col gap-4 overflow-y-auto min-h-0")}>
                <h3 className={cn("typo-title-2-semibold text-foreground flex-shrink-0")}>
                  {categoryId === "0"
                    ? "빠른매칭 일반공고 상세"
                    : categoryId === "1"
                      ? "빠른매칭 프리미엄공고 상세"
                      : "빠른공고 상세"}
                </h3>
                <ThunderAnnouncementForm
                  contentsId={contents?.id}
                  categoryId={categoryId}
                  onRefresh={onRefresh}
                  onClose={onClose}
                  layout="center"
                />
              </div>
              <div className={cn("flex-1 flex flex-col gap-4 pr-6 overflow-y-auto min-h-0")}>
                <h3 className={cn("typo-title-2-semibold text-foreground flex-shrink-0")}>
                  본문내용
                </h3>
                <ThunderAnnouncementForm
                  contentsId={contents?.id}
                  categoryId={categoryId}
                  onRefresh={onRefresh}
                  onClose={onClose}
                  layout="right"
                />
              </div>
            </div>
            <div className={cn("w-full border-t border-border pt-[10px] pb-[10px] flex-shrink-0")}>
              <ThunderAnnouncementForm
                contentsId={contents?.id}
                categoryId={categoryId}
                onRefresh={onRefresh}
                onClose={onClose}
                layout="buttons"
              />
            </div>
          </div>
        </FormProvider>
      </ModalBody>
    </Modal>
  );
}

