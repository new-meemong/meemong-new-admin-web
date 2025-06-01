"use client";

import { useCallback } from "react";
import { Modal } from "@/components/shared/modal";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalFooter } from "@/components/shared/modal/modal-footer";
import { ChevronRight } from "lucide-react";
import UserDetailForm from "@/components/features/user/user-detail-modal/user-detail-form";
import { useGetUserDetailQuery } from "@/queries/users";

interface UserDetailModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailModal({
  userId,
  isOpen,
  onClose,
}: UserDetailModalProps) {
  const getUserDetailQuery = useGetUserDetailQuery(userId);
  const handleSubmit = useCallback(() => {}, []);

  return (
    <Modal isOpen={isOpen}>
      <ModalHeader onClose={onClose}>
        회원 정보 <ChevronRight /> 상세
      </ModalHeader>
      <ModalBody>
        <UserDetailForm
          formData={getUserDetailQuery.data!}
          onSubmit={handleSubmit}
        />
      </ModalBody>
      <ModalFooter />
    </Modal>
  );
}
